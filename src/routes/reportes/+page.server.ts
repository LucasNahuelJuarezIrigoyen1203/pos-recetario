const fechaAR = (offsetDias = 0) => new Date(Date.now() - 3 * 3600e3 + offsetDias * 86400e3).toISOString().slice(0, 10);
const esFecha = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const load = async ({ locals, url }) => {
  const d = url.searchParams.get('desde'), h = url.searchParams.get('hasta');
  const desde = esFecha(d) ? d! : fechaAR(-29);
  const hasta = esFecha(h) ? h! : fechaAR();
  // el período va de las 00:00 de "desde" hasta el final de "hasta", en horario argentino
  const fin = new Date(new Date(`${hasta}T00:00:00-03:00`).getTime() + 86400e3).toISOString();
  const { data, error } = await locals.supabase.rpc('reporte', { p_desde: `${desde}T00:00:00-03:00`, p_hasta: fin });
  const r = data ?? { total_ventas: 0, cant_ventas: 0, total_gastos: 0, por_metodo: {}, por_dia: [], top: [] };
  return { desde, hasta, r, error: error?.message ?? null };
};
