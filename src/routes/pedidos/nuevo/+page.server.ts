import { fail, redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const [p, c] = await Promise.all([
    locals.supabase.from('productos').select('id,nombre,precio_venta,color').eq('activo', true).order('nombre'),
    locals.supabase.from('clientes').select('id,nombre').order('nombre')
  ]);
  return { productos: p.data ?? [], clientes: c.data ?? [] };
};

export const actions = {
  default: async ({ request, locals }) => {
    const f = await request.formData();
    const items: { producto_id: number; cantidad: number; precio_unitario: number }[] = JSON.parse(String(f.get('items') || '[]'));
    const entrega = String(f.get('entrega') || '');
    if (!items.length) return fail(400, { error: 'Agregá al menos un producto' });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entrega)) return fail(400, { error: 'Elegí la fecha de entrega' });
    const total = items.reduce((a, i) => a + Number(i.cantidad) * Number(i.precio_unitario), 0);
    const sena = Number(f.get('sena') || 0);
    if (sena < 0 || sena > total) return fail(400, { error: 'La seña no puede ser negativa ni mayor al total' });

    const { data: pedido, error } = await locals.supabase.from('pedidos').insert({
      cliente_id: f.get('cliente') ? Number(f.get('cliente')) : null,
      fecha_entrega: entrega, monto_total: total, 'monto_seña': sena, usuario_id: locals.user?.id
    }).select('id').single();
    if (error) return fail(500, { error: error.message });

    const { error: e2 } = await locals.supabase.from('pedido_items').insert(items.map((i) => ({
      pedido_id: pedido.id, producto_id: i.producto_id, cantidad: i.cantidad, precio_unitario: i.precio_unitario
    })));
    if (e2) {
      await locals.supabase.from('pedidos').delete().eq('id', pedido.id);
      return fail(500, { error: e2.message });
    }
    redirect(303, '/pedidos');
  }
};
