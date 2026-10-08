<script lang="ts">
  import { ars } from '$lib/format';
  let { data } = $props();
</script>
<h1>Recetas</h1>
<p class="muted">Cada receta define qué insumos usa un producto. Con eso, cada venta descuenta stock automáticamente y se calcula el costo y el margen.</p>
{#if data.productos.length === 0}<p class="muted">Primero creá productos en la sección Productos.</p>{:else}
<table>
  <thead><tr><th>Producto</th><th>Insumos</th><th>Costo</th><th>Precio</th><th>Margen</th><th></th></tr></thead>
  <tbody>
    {#each data.productos as p (p.id)}
      <tr class:off={!p.activo}>
        <td>{p.nombre}</td>
        <td>{p.ingredientes === 0 ? 'Sin receta' : p.ingredientes}</td>
        <td>{p.ingredientes ? ars(p.costo) : '—'}</td>
        <td>{ars(p.precio_venta)}</td>
        <td>{p.ingredientes && Number(p.precio_venta) > 0 ? Math.round(((Number(p.precio_venta) - p.costo) / Number(p.precio_venta)) * 100) + '%' : '—'}</td>
        <td><a href="/recetas/{p.id}">{p.ingredientes ? 'Ver / editar' : 'Armar receta'}</a></td>
      </tr>
    {/each}
  </tbody>
</table>
{/if}
