# POS + Stock + Recetario

1. Supabase: crear proyecto y, en el SQL Editor, correr en orden `supabase/migrations/001_schema.sql` y `002_extras.sql`. Crear un usuario en Authentication → Users (el primero en entrar queda como admin).
2. `cp .env.example .env` y completar `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`. Para crear usuarios desde la app, agregar también `SUPABASE_SECRET_KEY` (clave secreta, solo servidor).
3. `npm install && npm run dev`
4. Deploy: subir a GitHub, importar en Vercel y cargar las mismas variables.

Incluye: login con roles (admin, dueña, vendedor), inicio, ventas (nueva, listado, detalle con edición, anulación e historial), pedidos con seña, clientes, caja (apertura y cierre), productos, recetas con costo e impresión, stock de insumos, proveedores, gastos, reportes y usuarios.
Falta: bot de WhatsApp (por ahora hay links para abrir el chat).
