import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const [g, p] = await Promise.all([
    locals.supabase.from('gastos').select('id,tipo,monto,descripcion,fecha,proveedores(nombre)').order('fecha', { ascending: false }).limit(100),
    locals.supabase.from('proveedores').select('id,nombre').order('nombre')
  ]);
  return { gastos: (g.data ?? []) as any[], proveedores: p.data ?? [] };
};

export const actions = {
  crear: async ({ request, locals }) => {
    const f = await request.formData();
    const monto = Number(f.get('monto'));
    const tipo = String(f.get('tipo'));
    if (!(monto > 0)) return fail(400, { error: 'El monto tiene que ser mayor a 0' });
    if (!['compra_producto', 'extra'].includes(tipo)) return fail(400, { error: 'Tipo de gasto inválido' });
    const { error } = await locals.supabase.from('gastos').insert({
      tipo, monto, descripcion: String(f.get('descripcion') || '').trim() || null,
      proveedor_id: f.get('proveedor_id') ? Number(f.get('proveedor_id')) : null
    });
    if (error) return fail(400, { error: error.message });
    return { ok: 'Gasto registrado' };
  },
  borrar: async ({ request, locals }) => {
    const f = await request.formData();
    const { error } = await locals.supabase.from('gastos').delete().eq('id', Number(f.get('id')));
    if (error) return fail(400, { error: error.message });
    return { ok: 'Gasto borrado' };
  }
};
