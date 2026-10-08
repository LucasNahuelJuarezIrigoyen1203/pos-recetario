export const load = async ({ locals }) => {
  // inicio del día en horario argentino (UTC-3)
  const d = new Date(Date.now() - 3 * 3600e3); d.setUTCHours(0, 0, 0, 0);
  const desde = new Date(d.getTime() + 3 * 3600e3).toISOString();
  const [v, s, p] = await Promise.all([
    locals.supabase.from('ventas').select('total').eq('estado', 'activa').gte('fecha', desde),
    locals.supabase.from('insumos').select('id,nombre,unidad,stock_actual,stock_minimo').order('nombre'),
    locals.supabase.from('productos_pendientes').select('id', { count: 'exact', head: true }).eq('resuelto', false)
  ]);
  return {
    totalHoy: (v.data ?? []).reduce((a, r) => a + Number(r.total), 0),
    cantVentas: v.data?.length ?? 0,
    bajos: (s.data ?? []).filter((i) => Number(i.stock_actual) <= Number(i.stock_minimo)),
    pendientes: p.count ?? 0
  };
};
