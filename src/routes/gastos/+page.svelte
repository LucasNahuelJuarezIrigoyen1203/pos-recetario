<script lang="ts">
  import { enhance } from '$app/forms';
  import { ars, hora } from '$lib/format';
  let { data, form } = $props();
  const confirmar = (e: Event) => { if (!confirm('¿Borrar este gasto?')) e.preventDefault(); };
  const tipos: Record<string, string> = { compra_producto: 'Compra de mercadería', extra: 'Gasto extra' };
  const total = $derived(data.gastos.reduce((a: number, g: any) => a + Number(g.monto), 0));
</script>
<h1>Gastos</h1>
<form method="post" action="?/crear" use:enhance class="row" style="margin-bottom:16px">
  <select name="tipo" required>
    <option value="compra_producto">Compra de mercadería</option><option value="extra">Gasto extra</option>
  </select>
  <input name="monto" type="number" min="0" step="any" placeholder="Monto" required style="width:120px" />
  <input name="descripcion" placeholder="Descripción" class="grow" />
  <select name="proveedor_id"><option value="">Sin proveedor</option>{#each data.proveedores as p}<option value={p.id}>{p.nombre}</option>{/each}</select>
  <button class="btn">Registrar gasto</button>
</form>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}
{#if data.gastos.length === 0}<p class="muted">Todavía no hay gastos registrados.</p>{:else}
<p class="muted">Últimos {data.gastos.length} gastos · suman {ars(total)}</p>
<table>
  <thead><tr><th>Fecha</th><th>Detalle</th><th>Monto</th><th></th></tr></thead>
  <tbody>
    {#each data.gastos as g (g.id)}
      <tr>
        <td>{hora(g.fecha)}</td>
        <td>{g.descripcion ?? '—'}<br /><small class="muted">{tipos[g.tipo]}{g.proveedores?.nombre ? ' · ' + g.proveedores.nombre : ''}</small></td>
        <td>{ars(g.monto)}</td>
        <td>
          <form method="post" action="?/borrar" use:enhance>
            <input type="hidden" name="id" value={g.id} />
            <button class="btn danger" onclick={confirmar}>Borrar</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
{/if}
