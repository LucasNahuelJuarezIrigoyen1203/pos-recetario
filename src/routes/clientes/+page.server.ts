import { fail } from '@sveltejs/kit';

const campos = (f: FormData) => ({
  nombre: String(f.get('nombre')).trim(),
  telefono: String(f.get('telefono') || '').trim() || null,
  email: String(f.get('email') || '').trim() || null,
  notas: String(f.get('notas') || '').trim() || null
});

export const load = async ({ locals }) => {
  const { data } = await locals.supabase.from('clientes').select('id,nombre,telefono,email,notas').order('nombre');
  return { clientes: data ?? [] };
};

export const actions = {
  crear: async ({ request, locals }) => {
    const { error } = await locals.supabase.from('clientes').insert(campos(await request.formData()));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Cliente creado' };
  },
  editar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('clientes').update(campos(f)).eq('id', Number(f.get('id')));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Cambios guardados' };
  },
  borrar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('clientes').delete().eq('id', Number(f.get('id')));
    if (error) {
      return fail(400, { error: error.code === '23503'
        ? 'No se puede borrar: el cliente tiene ventas o pedidos asociados.' : error.message });
    }
    return { ok: 'Cliente borrado' };
  }
};
