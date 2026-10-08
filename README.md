# POS + Stock + Recetario

1. Supabase: crear proyecto, correr `supabase/migrations/001_schema.sql` en el SQL Editor y crear un usuario en Authentication → Users.
2. `cp .env.example .env` y completar `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`.
3. `npm install && npm run dev`
4. Deploy: subir a GitHub, importar en Vercel y cargar las mismas dos variables.

Hecho: login, inicio, ventas (nueva + listado con color), productos, esquema completo, descuento de stock.
Falta (orden del plan): clientes, insumos/recetas, proveedores, gastos, caja, editar ventas + historial, pedidos, PDFs, reportes, WhatsApp.
