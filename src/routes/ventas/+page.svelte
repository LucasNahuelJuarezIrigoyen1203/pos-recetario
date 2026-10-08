<script lang="ts">
  import { ars } from '$lib/format';
  let { data } = $props();
</script>
<h1>Ventas</h1>
{#if data.ventas.length === 0}<p class="muted">Todavía no hay ventas. Cargá la primera en "Nueva venta".</p>{:else}
<table>
  <thead><tr><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Total</th></tr></thead>
  <tbody>
    {#each data.ventas as v}
      <tr class:anulada={v.estado === 'anulada'} style:box-shadow={v.color_etiqueta ? `inset 6px 0 ${v.color_etiqueta}` : undefined}>
        <td><a href="/ventas/{v.id}">{new Date(v.fecha).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</a></td>
        <td>{v.clientes?.nombre ?? '—'}</td><td>{v.metodo_pago}</td><td>{ars(v.total)}</td>
      </tr>
    {/each}
  </tbody>
</table>{/if}
