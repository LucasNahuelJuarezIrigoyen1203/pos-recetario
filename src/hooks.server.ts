import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => event.cookies.set(name, value, { ...options, path: '/' }))
    }
  });
  const { data: { user } } = await event.locals.supabase.auth.getUser();
  event.locals.user = user;
  if (!user && !event.url.pathname.startsWith('/login')) redirect(303, '/login');
  return resolve(event, { filterSerializedResponseHeaders: (n) => n === 'content-range' || n === 'x-supabase-api-version' });
};
