import { fail } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ars } from '$lib/format';

// fecha de hoy en horario argentino (UTC-3), formato AAAA-MM-DD
const hoyAR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const redondear = (n: number) => Math.round(n * 100) / 100;

const cajaAbierta = (sb: SupabaseClient) =>
  sb.from('caja_sesiones').select('*').is('fecha_cierre', null).order('id', { ascending: false }).limit(1).maybeSingle();

// ventas activas de una sesión, separadas por método de pago
async function resumen(sb: SupabaseClient, sesionId: number) {
  const { data } = await sb.from('ventas').select('total,metodo_pago').eq('caja_sesion_id', sesionId).eq('estado', 'activa');
  const porMetodo: Record<string, number> = { efectivo: 0, transferencia: 0, tarjeta: 0, otro: 0 };
  for (const v of data ?? []) porMetodo[v.metodo_pago] = (porMetodo[v.metodo_pago] ?? 0) + Number(v.total);
  const total = Object.values(porMetodo).reduce((a, b) => a + b, 0);
  return { porMetodo, total, cantidad: data?.length ?? 0 };
}

export const load = async ({ locals }) => {
  const { data: abierta } = await cajaAbierta(locals.supabase);
  const actual = abierta ? { ...abierta, ...(await resumen(locals.supabase, abierta.id)) } : null;

  const { data: cerradas } = await locals.supabase.from('caja_sesiones')
    .select('id,fecha_apertura,fecha_cierre,fecha_correspondiente,monto_inicial,monto_final,diferencia')
    .not('fecha_cierre', 'is', null).order('id', { ascending: false }).limit(15);

  const ids = (cerradas ?? []).map((c) => c.id);
  const tot: Record<number, number> = {};
  if (ids.length) {
    const { data: vs } = await locals.supabase.from('ventas').select('caja_sesion_id,total')
      .in('caja_sesion_id', ids).eq('estado', 'activa');
    for (const v of vs ?? []) tot[v.caja_sesion_id] = (tot[v.caja_sesion_id] ?? 0) + Number(v.total);
  }
  return { actual, historial: (cerradas ?? []).map((c) => ({ ...c, ventas: tot[c.id] ?? 0 })) };
};

export const actions = {
  abrir: async ({ request, locals }) => {
    const f = await request.formData();
    const inicial = Number(f.get('inicial') || 0);
    if (!Number.isFinite(inicial) || inicial < 0) return fail(400, { error: 'El monto inicial no es válido' });
    const { data: ya } = await cajaAbierta(locals.supabase);
    if (ya) return fail(400, { error: 'Ya hay una caja abierta' });
    const { error } = await locals.supabase.from('caja_sesiones').insert({ monto_inicial: inicial, fecha_correspondiente: hoyAR() });
    if (error) return fail(400, { error: error.message });
    return { ok: 'Caja abierta' };
  },
  cerrar: async ({ request, locals }) => {
    const f = await request.formData();
    const crudo = String(f.get('contado') ?? '').trim();
    const contado = Number(crudo);
    if (crudo === '' || !Number.isFinite(contado) || contado < 0) return fail(400, { error: 'Ingresá el efectivo que contaste en la caja' });
    const { data: abierta } = await cajaAbierta(locals.supabase);
    if (!abierta) return fail(400, { error: 'No hay una caja abierta' });
    // el esperado se calcula acá con los datos de la base, no con lo que mande el navegador
    const r = await resumen(locals.supabase, abierta.id);
    const esperado = Number(abierta.monto_inicial) + r.porMetodo.efectivo;
    const diferencia = redondear(contado - esperado);
    const { error } = await locals.supabase.from('caja_sesiones')
      .update({ fecha_cierre: new Date().toISOString(), monto_final: contado, diferencia })
      .eq('id', abierta.id).is('fecha_cierre', null);
    if (error) return fail(400, { error: error.message });
    const txt = diferencia === 0 ? 'La caja cuadra.' : diferencia > 0 ? `Sobran ${ars(diferencia)}.` : `Faltan ${ars(-diferencia)}.`;
    return { ok: `Caja cerrada. ${txt}` };
  }
};
