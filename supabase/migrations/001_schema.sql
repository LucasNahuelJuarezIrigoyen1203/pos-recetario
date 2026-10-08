-- Esquema completo del plan (sección 2). Pegar en Supabase → SQL Editor.
create type metodo_pago as enum ('efectivo','tarjeta','transferencia','otro');
create type rol_usuario as enum ('admin','dueña','vendedor');
create type motivo_item as enum ('normal','danado','promocion');

create table sucursales (id bigint generated always as identity primary key, nombre text not null, direccion text, activa boolean default true);
create table usuarios (id uuid primary key references auth.users on delete cascade, nombre text, rol rol_usuario not null default 'dueña');
create table clientes (id bigint generated always as identity primary key, nombre text not null, telefono text, email text, notas text, created_at timestamptz default now());
create table proveedores (id bigint generated always as identity primary key, nombre text not null, telefono text, contacto text, notas text);
create table insumos (id bigint generated always as identity primary key, nombre text not null, unidad text not null default 'u', stock_actual numeric not null default 0, stock_minimo numeric not null default 0, proveedor_id bigint references proveedores, costo_unitario numeric default 0, sucursal_id bigint references sucursales);
create table productos (id bigint generated always as identity primary key, nombre text not null, descripcion text, precio_venta numeric not null, categoria text, color text default '#dbe7e0', activo boolean default true, created_at timestamptz default now());
create table producto_insumos (id bigint generated always as identity primary key, producto_id bigint not null references productos on delete cascade, insumo_id bigint not null references insumos, cantidad_necesaria numeric not null);
create table caja_sesiones (id bigint generated always as identity primary key, fecha_apertura timestamptz default now(), fecha_correspondiente date, monto_inicial numeric not null default 0, fecha_cierre timestamptz, monto_final numeric, diferencia numeric, usuario_id uuid references usuarios, sucursal_id bigint references sucursales);
create table ventas (id bigint generated always as identity primary key, cliente_id bigint references clientes, fecha timestamptz default now(), metodo_pago metodo_pago not null, color_etiqueta text, total numeric not null default 0, caja_sesion_id bigint references caja_sesiones, usuario_id uuid, estado text not null default 'activa' check (estado in ('activa','anulada')), motivo_anulacion text, sucursal_id bigint references sucursales);
create table venta_items (id bigint generated always as identity primary key, venta_id bigint not null references ventas on delete cascade, producto_id bigint references productos, nombre_libre text, cantidad numeric not null, precio_unitario numeric not null, subtotal numeric generated always as (cantidad * precio_unitario) stored, motivo motivo_item not null default 'normal', nota text);
create table gastos (id bigint generated always as identity primary key, tipo text not null check (tipo in ('compra_producto','extra')), monto numeric not null, descripcion text, fecha timestamptz default now(), proveedor_id bigint references proveedores);
create table ventas_historial (id bigint generated always as identity primary key, venta_id bigint not null references ventas, usuario_id uuid, fecha_edicion timestamptz default now(), campo_modificado text, valor_anterior text, valor_nuevo text);
create table productos_historial (id bigint generated always as identity primary key, producto_id bigint not null references productos, usuario_id uuid, fecha_cambio timestamptz default now(), precio_anterior numeric, precio_nuevo numeric);
create table productos_pendientes (id bigint generated always as identity primary key, nombre_mencionado text, cantidad numeric, origen text check (origen in ('web','whatsapp')), venta_id bigint references ventas, resuelto boolean default false, created_at timestamptz default now());
create table pedidos (id bigint generated always as identity primary key, cliente_id bigint references clientes, fecha_pedido timestamptz default now(), fecha_entrega date not null, estado text not null default 'pendiente' check (estado in ('pendiente','entregado','cancelado')), monto_total numeric not null default 0, "monto_seña" numeric not null default 0, usuario_id uuid);
create table pedido_items (id bigint generated always as identity primary key, pedido_id bigint not null references pedidos on delete cascade, producto_id bigint not null references productos, cantidad numeric not null, precio_unitario numeric not null);
create table whatsapp_sesiones (id bigint generated always as identity primary key, telefono text not null, estado text default 'activa' check (estado in ('activa','pausada')), datos_parciales jsonb default '{}', actualizado_en timestamptz default now());
create table whatsapp_numeros_autorizados (id bigint generated always as identity primary key, telefono text not null unique, nombre text, activo boolean default true, agregado_por uuid references usuarios, created_at timestamptz default now());

-- Registrar venta + descontar stock + marcar productos que no están en el catálogo
create or replace function crear_venta(p_cliente bigint, p_metodo metodo_pago, p_items jsonb)
returns bigint language plpgsql as $$
declare v_id bigint; it jsonb; v_prod bigint; v_cant numeric; v_total numeric := 0; v_caja bigint;
begin
  select id into v_caja from caja_sesiones where fecha_cierre is null order by id desc limit 1;
  insert into ventas (cliente_id, metodo_pago, caja_sesion_id, usuario_id) values (p_cliente, p_metodo, v_caja, auth.uid()) returning id into v_id;
  for it in select * from jsonb_array_elements(p_items) loop
    v_prod := nullif(it->>'producto_id','')::bigint; v_cant := (it->>'cantidad')::numeric;
    insert into venta_items (venta_id, producto_id, nombre_libre, cantidad, precio_unitario, motivo, nota)
    values (v_id, v_prod, it->>'nombre_libre', v_cant, (it->>'precio_unitario')::numeric, coalesce(it->>'motivo','normal')::motivo_item, it->>'nota');
    v_total := v_total + v_cant * (it->>'precio_unitario')::numeric;
    if v_prod is not null then
      update insumos i set stock_actual = i.stock_actual - pi.cantidad_necesaria * v_cant
        from producto_insumos pi where pi.insumo_id = i.id and pi.producto_id = v_prod;
    else
      insert into productos_pendientes (nombre_mencionado, cantidad, origen, venta_id) values (it->>'nombre_libre', v_cant, 'web', v_id);
    end if;
  end loop;
  update ventas set total = v_total where id = v_id;
  return v_id;
end $$;

-- Seguridad: solo usuarios logueados. Ajustar por rol más adelante.
do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "solo autenticados" on %I for all to authenticated using (true) with check (true)', t);
  end loop; end $$;
