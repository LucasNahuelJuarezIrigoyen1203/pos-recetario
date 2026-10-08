<script lang="ts">
  import { ars } from '$lib/format';
  let { data } = $props();
</script>
<h1>Hoy</h1>
<p class="stat">{ars(data.totalHoy)}</p>
<p class="muted">{data.cantVentas} ventas registradas</p>
{#if data.pendientes}<p class="err">{data.pendientes} productos vendidos que no están en el catálogo.</p>{/if}
<h2>Stock bajo</h2>
{#if data.bajos.length === 0}<p class="muted">Todo el stock está por encima del mínimo.</p>
{:else}<ul>{#each data.bajos as i}<li class="err">{i.nombre}: quedan {i.stock_actual} {i.unidad}</li>{/each}</ul>{/if}
