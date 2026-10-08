import { fail } from '@sveltejs/kit';
export const load = async ({ locals }) => {
  const { data } = await locals.supabase.from('productos').select('id,nombre,precio_venta,categoria,color,activo').order('nombre');
  return { productos: data ?? [] };
};
export const actions = {
  default: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('productos').insert({
      nombre: String(f.get('nombre')), precio_venta: Number(f.get('precio')),
      categoria: String(f.get('categoria') || '') || null, color: String(f.get('color'))
    });
    if (error) return fail(400, { error: error.message });
  }
};
