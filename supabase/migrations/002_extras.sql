-- 002: roles, anular ventas y reportes. Pegar en Supabase → SQL Editor (después de 001).

-- ¿El usuario logueado es admin o dueña?
create or replace function es_gerente() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from usuarios where id = auth.uid() and rol in ('admin','dueña'));
$$;

create or replace function hay_gerentes() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from usuarios where rol in ('admin','dueña'));
$$;

-- La tabla usuarios define los permisos, así que se protege en la base:
-- todos leen; solo admin/dueña modifican; cada uno puede registrarse a sí mismo como vendedor,
-- y el primero de todos (cuando todavía no hay admin ni dueña) queda como admin.
drop policy if exists "solo autenticados" on usuarios;
drop policy if exists usuarios_leer on usuarios;
drop policy if exists usuarios_insertar on usuarios;
drop policy if exists usuarios_modificar on usuarios;
drop policy if exists usuarios_borrar on usuarios;
create policy usuarios_leer on usuarios for select to authenticated using (true);
create policy usuarios_insertar on usuarios for insert to authenticated
  with check (es_gerente() or (id = auth.uid() and (rol = 'vendedor' or not hay_gerentes())));
create policy usuarios_modificar on usuarios for update to authenticated using (es_gerente()) with check (es_gerente());
create policy usuarios_borrar on usuarios for delete to authenticated using (es_gerente());

-- Anular una venta: devuelve el stock de insumos y deja registro en el historial
create or replace function anular_venta(p_venta bigint, p_motivo text) returns void
language plpgsql as $$
declare v_estado text; it record;
begin
  if not es_gerente() then raise exception 'Solo la dueña o un admin pueden anular ventas'; end if;
  select estado into v_estado from ventas where id = p_venta for update;
  if v_estado is null then raise exception 'La venta no existe'; end if;
  if v_estado = 'anulada' then raise exception 'La venta ya está anulada'; end if;
  for it in select producto_id, cantidad from venta_items where venta_id = p_venta and producto_id is not null loop
    update insumos i set stock_actual = i.stock_actual + pi.cantidad_necesaria * it.cantidad
      from producto_insumos pi where pi.insumo_id = i.id and pi.producto_id = it.producto_id;
  end loop;
  update ventas set estado = 'anulada', motivo_anulacion = p_motivo where id = p_venta;
  insert into ventas_historial (venta_id, usuario_id, campo_modificado, valor_anterior, valor_nuevo)
  values (p_venta, auth.uid(), 'estado', 'activa', 'anulada');
end $$;

-- Reporte de un período: totales, por método de pago, por día y productos más vendidos
create or replace function reporte(p_desde timestamptz, p_hasta timestamptz) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'total_ventas', coalesce((select sum(total) from ventas where estado = 'activa' and fecha >= p_desde and fecha < p_hasta), 0),
    'cant_ventas', (select count(*) from ventas where estado = 'activa' and fecha >= p_desde and fecha < p_hasta),
    'total_gastos', coalesce((select sum(monto) from gastos where fecha >= p_desde and fecha < p_hasta), 0),
    'por_metodo', coalesce((select jsonb_object_agg(m, t) from (
        select metodo_pago::text m, sum(total) t from ventas
        where estado = 'activa' and fecha >= p_desde and fecha < p_hasta group by 1) x), '{}'::jsonb),
    'por_dia', coalesce((select jsonb_agg(jsonb_build_object('dia', d, 'total', t) order by d) from (
        select (fecha at time zone 'America/Argentina/Buenos_Aires')::date d, sum(total) t from ventas
        where estado = 'activa' and fecha >= p_desde and fecha < p_hasta group by 1) x), '[]'::jsonb),
    'top', coalesce((select jsonb_agg(jsonb_build_object('nombre', n, 'cantidad', c, 'monto', mt) order by mt desc) from (
        select coalesce(p.nombre, vi.nombre_libre, 'Sin nombre') n, sum(vi.cantidad) c, sum(vi.subtotal) mt
        from venta_items vi join ventas v on v.id = vi.venta_id left join productos p on p.id = vi.producto_id
        where v.estado = 'activa' and v.fecha >= p_desde and v.fecha < p_hasta
        group by 1 order by mt desc limit 10) x), '[]'::jsonb)
  );
$$;
