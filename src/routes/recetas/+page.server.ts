export const load = async ({ locals }) => {
  const [p, r] = await Promise.all([
    locals.supabase.from('productos').select('id,nombre,categoria,precio_venta,activo').order('nombre'),
    locals.supabase.from('producto_insumos').select('producto_id,cantidad_necesaria,insumos(costo_unitario)')
  ]);
  const por: Record<number, { n: number; costo: number }> = {};
  for (const x of (r.data ?? []) as any[]) {
    const a = (por[x.producto_id] ??= { n: 0, costo: 0 });
    a.n++; a.costo += Number(x.cantidad_necesaria) * Number(x.insumos?.costo_unitario ?? 0);
  }
  return { productos: (p.data ?? []).map((x) => ({ ...x, ingredientes: por[x.id]?.n ?? 0, costo: por[x.id]?.costo ?? 0 })) };
};
