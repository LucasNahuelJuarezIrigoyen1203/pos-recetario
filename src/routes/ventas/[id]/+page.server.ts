import { error, fail } from '@sveltejs/kit';

const METODOS = ['efectivo', 'transferencia', 'tarjeta', 'otro'];

export const load = async ({ locals, params }) => {
  const id = Number(params.id);
  const { data: venta } = await locals.supabase.from('ventas').select('*, clientes(nombre)').eq('id', id).maybeSingle();
  if (!venta) error(404, 'Venta no encontrada');
  const [it, h, c] = await Promise.all([
    locals.supabase.from('venta_items').select('id,cantidad,precio_unitario,subtotal,nombre_libre,productos(nombre)').eq('venta_id', id).order('id'),
    locals.supabase.from('ventas_historial').select('id,fecha_edicion,campo_modificado,valor_anterior,valor_nuevo').eq('venta_id', id).order('id', { ascending: false }),
    locals.supabase.from('clientes').select('id,nombre').order('nombre')
  ]);
  return { venta, items: (it.data ?? []) as any[], historial: h.data ?? [], clientes: c.data ?? [] };
};

export const actions = {
  editar: async ({ request, locals, params }) => {
    if (locals.rol === 'vendedor') return fail(403, { error: 'Solo la dueña o un admin pueden editar ventas' });
    const id = Number(params.id);
    const f = await request.formData();
    const { data: v } = await locals.supabase.from('ventas').select('*').eq('id', id).maybeSingle();
    if (!v) return fail(404, { error: 'La venta no existe' });
    if (v.estado === 'anulada') return fail(400, { error: 'Una venta anulada no se puede editar' });
    const { data: clientes } = await locals.supabase.from('clientes').select('id,nombre');
    const nombreCliente = (cid: number | null) => (cid ? clientes?.find((c) => c.id === cid)?.nombre ?? String(cid) : 'Sin cliente');

    const metodo = String(f.get('metodo'));
    if (!METODOS.includes(metodo)) return fail(400, { error: 'Método de pago inválido' });
    const cliente = f.get('cliente') ? Number(f.get('cliente')) : null;
    const color = String(f.get('color') || '').trim() || null;

    const cambios: { campo: string; antes: string; despues: string }[] = [];
    if (v.metodo_pago !== metodo) cambios.push({ campo: 'metodo_pago', antes: v.metodo_pago, despues: metodo });
    if ((v.cliente_id ?? null) !== cliente) cambios.push({ campo: 'cliente', antes: nombreCliente(v.cliente_id), despues: nombreCliente(cliente) });
    if ((v.color_etiqueta ?? null) !== color) cambios.push({ campo: 'color_etiqueta', antes: v.color_etiqueta ?? '—', despues: color ?? '—' });
    if (cambios.length === 0) return { ok: 'No hay cambios para guardar' };

    const { error: e } = await locals.supabase.from('ventas').update({ metodo_pago: metodo, cliente_id: cliente, color_etiqueta: color }).eq('id', id);
    if (e) return fail(400, { error: e.message });
    await locals.supabase.from('ventas_historial').insert(cambios.map((c) => ({
      venta_id: id, usuario_id: locals.user?.id, campo_modificado: c.campo, valor_anterior: c.antes, valor_nuevo: c.despues
    })));
    return { ok: 'Venta actualizada' };
  },
  anular: async ({ request, locals, params }) => {
    if (locals.rol === 'vendedor') return fail(403, { error: 'Solo la dueña o un admin pueden anular ventas' });
    const f = await request.formData();
    const motivo = String(f.get('motivo') || '').trim();
    if (!motivo) return fail(400, { error: 'Escribí el motivo de la anulación' });
    const { error: e } = await locals.supabase.rpc('anular_venta', { p_venta: Number(params.id), p_motivo: motivo });
    if (e) return fail(400, { error: e.message });
    return { ok: 'Venta anulada. El stock de insumos se devolvió.' };
  }
};
