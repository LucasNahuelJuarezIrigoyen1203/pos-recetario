import { fail } from '@sveltejs/kit';

const campos = (f: FormData) => ({
  nombre: String(f.get('nombre')).trim(),
  telefono: String(f.get('telefono') || '').trim() || null,
  contacto: String(f.get('contacto') || '').trim() || null,
  notas: String(f.get('notas') || '').trim() || null
});

export const load = async ({ locals }) => {
  const { data } = await locals.supabase.from('proveedores').select('id,nombre,telefono,contacto,notas').order('nombre');
  return { proveedores: data ?? [] };
};

export const actions = {
  crear: async ({ request, locals }) => {
    const { error } = await locals.supabase.from('proveedores').insert(campos(await request.formData()));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Proveedor creado' };
  },
  editar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('proveedores').update(campos(f)).eq('id', Number(f.get('id')));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Cambios guardados' };
  },
  borrar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('proveedores').delete().eq('id', Number(f.get('id')));
    if (error) {
      return fail(400, { error: error.code === '23503'
        ? 'No se puede borrar: el proveedor tiene insumos o gastos asociados.' : error.message });
    }
    return { ok: 'Proveedor borrado' };
  }
};
