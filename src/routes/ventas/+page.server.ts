export const load = async ({ locals }) => {
  const { data } = await locals.supabase.from('ventas')
    .select('id,fecha,total,metodo_pago,color_etiqueta,estado,clientes(nombre)')
    .order('fecha', { ascending: false }).limit(100);
  return { ventas: data ?? [] };
};
