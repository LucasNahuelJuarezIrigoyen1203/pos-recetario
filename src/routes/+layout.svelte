<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  let { data, children } = $props();
  // [ruta, texto, solo para admin/dueña]
  const todos: [string, string, boolean][] = [
    ['/dashboard', 'Inicio', false], ['/ventas/nueva', 'Nueva venta', false], ['/ventas', 'Ventas', false],
    ['/pedidos', 'Pedidos', false], ['/clientes', 'Clientes', false], ['/caja', 'Caja', false],
    ['/productos', 'Productos', true], ['/recetas', 'Recetas', true], ['/stock', 'Stock', true],
    ['/proveedores', 'Proveedores', true], ['/gastos', 'Gastos', true], ['/reportes', 'Reportes', true], ['/usuarios', 'Usuarios', true]
  ];
  const links = $derived(todos.filter(([, , g]) => !g || data.rol !== 'vendedor'));
  const activo = (href: string) => page.url.pathname === href || (href !== '/ventas' && page.url.pathname.startsWith(href + '/'));
</script>

{#if page.url.pathname !== '/login'}
  <nav>
    {#each links as [href, label]}
      <a {href} aria-current={activo(href) ? 'page' : undefined}>{label}</a>
    {/each}
    <form method="post" action="/logout"><button>Salir</button></form>
  </nav>
{/if}
<main>{@render children()}</main>
