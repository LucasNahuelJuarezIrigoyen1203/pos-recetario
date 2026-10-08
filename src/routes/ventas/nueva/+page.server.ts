import { fail, redirect } from '@sveltejs/kit';
export const load = async ({ locals }) => {
  const [p, c, k] = await Promise.all([
    locals.supabase.from('productos').select('id,nombre,precio_venta,color').eq('activo', true).order('nombre'),
    locals.supabase.from('clientes').select('id,nombre').order('nombre'),
    locals.supabase.from('caja_sesiones').select('id', { count: 'exact', head: true }).is('fecha_cierre', null)
  ]);
  return { productos: p.data ?? [], clientes: c.data ?? [], cajaAbierta: (k.count ?? 0) > 0 };
};
export const actions = {
  default: async ({ request, locals }) => {
    const f = await request.formData();
    const items = JSON.parse(String(f.get('items') || '[]'));
    if (!items.length) return fail(400, { error: 'Agregá al menos un producto' });
    const { error } = await locals.supabase.rpc('crear_venta', {
      p_cliente: f.get('cliente') ? Number(f.get('cliente')) : null,
      p_metodo: String(f.get('metodo')),
      p_items: items
    });
    if (error) return fail(500, { error: error.message });
    redirect(303, '/ventas');
  }
};
