import { error, fail } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
  const id = Number(params.id);
  const { data: producto } = await locals.supabase.from('productos').select('id,nombre,descripcion,precio_venta').eq('id', id).maybeSingle();
  if (!producto) error(404, 'Producto no encontrado');
  const [it, ins] = await Promise.all([
    locals.supabase.from('producto_insumos').select('id,cantidad_necesaria,insumos(id,nombre,unidad,costo_unitario)').eq('producto_id', id).order('id'),
    locals.supabase.from('insumos').select('id,nombre,unidad').order('nombre')
  ]);
  return { producto, items: (it.data ?? []) as any[], insumos: ins.data ?? [] };
};

export const actions = {
  descripcion: async ({ request, locals, params }) => {
    const f = await request.formData();
    const { error: e } = await locals.supabase.from('productos')
      .update({ descripcion: String(f.get('descripcion') || '').trim() || null }).eq('id', Number(params.id));
    if (e) return fail(400, { error: e.message });
    return { ok: 'Preparación guardada' };
  },
  agregar: async ({ request, locals, params }) => {
    const f = await request.formData();
    const producto_id = Number(params.id), insumo_id = Number(f.get('insumo_id')), cant = Number(f.get('cantidad'));
    if (!insumo_id || !(cant > 0)) return fail(400, { error: 'Elegí un insumo y una cantidad mayor a 0' });
    const { data: ya } = await locals.supabase.from('producto_insumos').select('id').eq('producto_id', producto_id).eq('insumo_id', insumo_id).maybeSingle();
    const { error: e } = ya
      ? await locals.supabase.from('producto_insumos').update({ cantidad_necesaria: cant }).eq('id', ya.id)
      : await locals.supabase.from('producto_insumos').insert({ producto_id, insumo_id, cantidad_necesaria: cant });
    if (e) return fail(400, { error: e.message });
    return { ok: ya ? 'Cantidad actualizada' : 'Insumo agregado a la receta' };
  },
  cantidad: async ({ request, locals }) => {
    const f = await request.formData();
    const cant = Number(f.get('cantidad'));
    if (!(cant > 0)) return fail(400, { error: 'La cantidad tiene que ser mayor a 0' });
    const { error: e } = await locals.supabase.from('producto_insumos').update({ cantidad_necesaria: cant }).eq('id', Number(f.get('id')));
    if (e) return fail(400, { error: e.message });
    return { ok: 'Cantidad guardada' };
  },
  quitar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error: e } = await locals.supabase.from('producto_insumos').delete().eq('id', Number(f.get('id')));
    if (e) return fail(400, { error: e.message });
    return { ok: 'Insumo quitado' };
  }
};
