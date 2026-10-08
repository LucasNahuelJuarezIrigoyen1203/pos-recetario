import { fail, redirect } from '@sveltejs/kit';
export const actions = {
  default: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('password')) });
    if (error) return fail(400, { error: 'Email o contraseña incorrectos' });
    redirect(303, '/dashboard');
  }
};
