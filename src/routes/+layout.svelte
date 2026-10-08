<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  let { children } = $props();
  const links = [['/dashboard', 'Inicio'], ['/ventas/nueva', 'Nueva venta'], ['/ventas', 'Ventas'], ['/productos', 'Productos']];
</script>

{#if page.url.pathname !== '/login'}
  <nav>
    {#each links as [href, label]}
      <a {href} aria-current={page.url.pathname === href ? 'page' : undefined}>{label}</a>
    {/each}
    <form method="post" action="/logout"><button>Salir</button></form>
  </nav>
{/if}
<main>{@render children()}</main>
