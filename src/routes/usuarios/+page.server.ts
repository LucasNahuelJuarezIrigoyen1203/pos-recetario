import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as pub } from '$env/dynamic/public';
import { createClient } from '@supabase/supabase-js';

const ROLES = ['admin', 'dueña', 'vendedor'];

// Crear o borrar usuarios necesita la clave secreta de Supabase. Solo se usa acá, en el servidor.
const admin = () => env.SUPABASE_SECRET_KEY
  ? createClient(pub.PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

export const load = async ({ locals }) => {
  const { data: filas } = await locals.supabase.from('usuarios').select('id,nombre,rol').order('nombre');
  const a = admin();
  const emails: Record<string, string> = {};
  if (a) {
    const { data } = await a.auth.admin.listUsers({ perPage: 200 });
    for (const u of data?.users ?? []) emails[u.id] = u.email ?? '';
  }
  return {
    configurado: !!a, miId: locals.user?.id ?? null,
    usuarios: (filas ?? []).map((u) => ({ ...u, email: emails[u.id] ?? '' }))
  };
};

export const actions = {
  crear: async ({ request }) => {
    const a = admin();
    if (!a) return fail(400, { error: 'Falta configurar SUPABASE_SECRET_KEY' });
    const f = await request.formData();
    const email = String(f.get('email') || '').trim().toLowerCase();
    const password = String(f.get('password') || '');
    const nombre = String(f.get('nombre') || '').trim() || email;
    const rol = String(f.get('rol'));
    if (!email || password.length < 6) return fail(400, { error: 'Poné un email y una contraseña de al menos 6 caracteres' });
    if (!ROLES.includes(rol)) return fail(400, { error: 'Rol inválido' });
    const { data, error } = await a.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) return fail(400, { error: error?.message ?? 'No se pudo crear el usuario' });
    const { error: e2 } = await a.from('usuarios').insert({ id: data.user.id, nombre, rol });
    if (e2) {
      await a.auth.admin.deleteUser(data.user.id);
      return fail(500, { error: e2.message });
    }
    return { ok: `Usuario ${email} creado` };
  },
  rol: async ({ request, locals }) => {
    const f = await request.formData();
    const id = String(f.get('id')), rol = String(f.get('rol'));
    if (id === locals.user?.id) return fail(400, { error: 'No podés cambiar tu propio rol' });
    if (!ROLES.includes(rol)) return fail(400, { error: 'Rol inválido' });
    const { error } = await locals.supabase.from('usuarios').update({ rol, nombre: String(f.get('nombre') || '').trim() || null }).eq('id', id);
    if (error) return fail(400, { error: error.message });
    return { ok: 'Usuario actualizado' };
  },
  clave: async ({ request }) => {
    const a = admin();
    if (!a) return fail(400, { error: 'Falta configurar SUPABASE_SECRET_KEY' });
    const f = await request.formData();
    const password = String(f.get('password') || '');
    if (password.length < 6) return fail(400, { error: 'La contraseña tiene que tener al menos 6 caracteres' });
    const { error } = await a.auth.admin.updateUserById(String(f.get('id')), { password });
    if (error) return fail(400, { error: error.message });
    return { ok: 'Contraseña cambiada' };
  },
  borrar: async ({ request, locals }) => {
    const a = admin();
    if (!a) return fail(400, { error: 'Falta configurar SUPABASE_SECRET_KEY' });
    const id = String((await request.formData()).get('id'));
    if (id === locals.user?.id) return fail(400, { error: 'No podés borrarte a vos mismo' });
    const { error } = await a.auth.admin.deleteUser(id);
    if (error) return fail(400, { error: error.message });
    return { ok: 'Usuario borrado' };
  }
};
