import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { data } = await locals.supabase.from('pedidos')
    .select('*, clientes(nombre,telefono), pedido_items(cantidad, productos(nombre))')
    .order('fecha_entrega', { ascending: true }).limit(150);
  const todos = (data ?? []) as any[];
  return {
    pendientes: todos.filter((p) => p.estado === 'pendiente'),
    anteriores: todos.filter((p) => p.estado !== 'pendiente').reverse().slice(0, 20)
  };
};

export const actions = {
  entregar: async ({ request, locals }) => {
    const f = await request.formData();
    const id = Number(f.get('id'));
    const metodo = String(f.get('metodo'));
    if (!['efectivo', 'transferencia', 'tarjeta', 'otro'].includes(metodo)) return fail(400, { error: 'Elegí cómo se cobró' });
    // se "reserva" el pedido primero para que no se entregue dos veces
    const { data: tomado } = await locals.supabase.from('pedidos').update({ estado: 'entregado' }).eq('id', id).eq('estado', 'pendiente').select('id,cliente_id');
    if (!tomado?.length) return fail(400, { error: 'El pedido ya no está pendiente' });
    const { data: items } = await locals.supabase.from('pedido_items').select('producto_id,cantidad,precio_unitario').eq('pedido_id', id);
    const { error } = await locals.supabase.rpc('crear_venta', { p_cliente: tomado[0].cliente_id, p_metodo: metodo, p_items: items ?? [] });
    if (error) {
      await locals.supabase.from('pedidos').update({ estado: 'pendiente' }).eq('id', id);
      return fail(500, { error: error.message });
    }
    return { ok: 'Pedido entregado y registrado como venta' };
  },
  cancelar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('pedidos').update({ estado: 'cancelado' }).eq('id', Number(f.get('id'))).eq('estado', 'pendiente');
    if (error) return fail(400, { error: error.message });
    return { ok: 'Pedido cancelado' };
  }
};
