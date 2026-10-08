import { fail } from '@sveltejs/kit';

const campos = (f: FormData) => ({
  nombre: String(f.get('nombre')).trim(),
  unidad: String(f.get('unidad') || 'u').trim() || 'u',
  stock_actual: Number(f.get('stock_actual') || 0),
  stock_minimo: Number(f.get('stock_minimo') || 0),
  costo_unitario: Number(f.get('costo_unitario') || 0),
  proveedor_id: f.get('proveedor_id') ? Number(f.get('proveedor_id')) : null
});

export const load = async ({ locals }) => {
  const [i, p] = await Promise.all([
    locals.supabase.from('insumos').select('id,nombre,unidad,stock_actual,stock_minimo,costo_unitario,proveedor_id').order('nombre'),
    locals.supabase.from('proveedores').select('id,nombre').order('nombre')
  ]);
  return { insumos: i.data ?? [], proveedores: p.data ?? [] };
};

export const actions = {
  crear: async ({ request, locals }) => {
    const { error } = await locals.supabase.from('insumos').insert(campos(await request.formData()));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Insumo creado' };
  },
  editar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('insumos').update(campos(f)).eq('id', Number(f.get('id')));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Stock actualizado' };
  },
  borrar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('insumos').delete().eq('id', Number(f.get('id')));
    if (error) {
      return fail(400, { error: error.code === '23503'
        ? 'No se puede borrar: el insumo se usa en la receta de algún producto.' : error.message });
    }
    return { ok: 'Insumo borrado' };
  }
};
