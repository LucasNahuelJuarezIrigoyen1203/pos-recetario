import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { redirect, type Handle } from '@sveltejs/kit';

// Secciones que un vendedor no puede abrir
const SOLO_GERENTE = ['/productos', '/recetas', '/stock', '/proveedores', '/gastos', '/reportes', '/usuarios'];

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }))
    }
  });
  const { data: { user } } = await event.locals.supabase.auth.getUser();
  event.locals.user = user;
  event.locals.rol = null;
  event.locals.nombre = null;
  if (!user && !event.url.pathname.startsWith('/login')) redirect(303, '/login');

  if (user) {
    const sb = event.locals.supabase;
    let { data: perfil } = await sb.from('usuarios').select('rol,nombre').eq('id', user.id).maybeSingle();
    if (!perfil) {
      // primer ingreso: el primero de todos queda como admin, el resto como vendedor
      const nombre = user.email ?? 'Usuario';
      let r: any = await sb.from('usuarios').insert({ id: user.id, nombre, rol: 'admin' }).select('rol,nombre').single();
      if (r.error) r = await sb.from('usuarios').insert({ id: user.id, nombre, rol: 'vendedor' }).select('rol,nombre').single();
      perfil = r.data;
    }
    event.locals.rol = perfil?.rol ?? 'vendedor';
    event.locals.nombre = perfil?.nombre ?? null;
    const p = event.url.pathname;
    if (event.locals.rol === 'vendedor' && SOLO_GERENTE.some((s) => p === s || p.startsWith(s + '/'))) redirect(303, '/ventas/nueva');
  }
  return resolve(event, { filterSerializedResponseHeaders: (n) => n === 'content-range' || n === 'x-supabase-api-version' });
};
