import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const { data } = await locals.supabase.from('productos')
    .select('id,nombre,precio_venta,categoria,color,activo').order('nombre');
  return { productos: data ?? [] };
};

export const actions = {
  crear: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('productos').insert({
      nombre: String(f.get('nombre')).trim(), precio_venta: Number(f.get('precio')),
      categoria: String(f.get('categoria') || '').trim() || null, color: String(f.get('color'))
    });
    if (error) return fail(400, { error: error.message });
    return { ok: 'Producto creado' };
  },
  editar: async ({ request, locals }) => {
    const f = await request.formData();
    const id = Number(f.get('id'));
    const precio = Number(f.get('precio'));
    const { data: actual } = await locals.supabase.from('productos').select('precio_venta').eq('id', id).single();
    const { error } = await locals.supabase.from('productos').update({
      nombre: String(f.get('nombre')).trim(), precio_venta: precio,
      categoria: String(f.get('categoria') || '').trim() || null,
      color: String(f.get('color')), activo: f.get('activo') === 'on'
    }).eq('id', id);
    if (error) return fail(400, { error: error.message });
    // guarda el cambio de precio en el historial
    if (actual && Number(actual.precio_venta) !== precio) {
      await locals.supabase.from('productos_historial').insert({
        producto_id: id, usuario_id: locals.user?.id, precio_anterior: actual.precio_venta, precio_nuevo: precio
      });
    }
    return { ok: 'Cambios guardados' };
  }
};
