<script lang="ts">
  import { ars } from '$lib/format';
  let { data, form } = $props();
  type Linea = { producto_id: number; nombre: string; precio: number; cant: number };
  let lineas = $state<Linea[]>([]);
  const total = $derived(lineas.reduce((a, l) => a + l.precio * l.cant, 0));
  const items = $derived(JSON.stringify(lineas.map((l) => ({ producto_id: l.producto_id, cantidad: l.cant, precio_unitario: l.precio }))));
  function sumar(p: any) {
    const l = lineas.find((x) => x.producto_id === p.id);
    if (l) l.cant++; else lineas.push({ producto_id: p.id, nombre: p.nombre, precio: Number(p.precio_venta), cant: 1 });
  }
  function restar(l: Linea) { l.cant--; if (l.cant <= 0) lineas = lineas.filter((x) => x !== l); }
</script>
<p><a href="/pedidos">← Pedidos</a></p>
<h1>Nuevo pedido</h1>
{#if data.productos.length === 0}<p class="muted">Primero creá productos en la sección Productos.</p>{/if}
<div class="tiles">
  {#each data.productos as p}
    <button type="button" class="tile" style:background={p.color} onclick={() => sumar(p)}>{p.nombre}<br /><small>{ars(p.precio_venta)}</small></button>
  {/each}
</div>
<form method="post">
  {#each lineas as l}
    <div class="row" style="margin-bottom:6px">
      <span class="grow">{l.nombre}</span>
      <button type="button" class="btn" onclick={() => restar(l)} aria-label="Restar">−</button>
      <strong>{l.cant}</strong>
      <button type="button" class="btn" onclick={() => l.cant++} aria-label="Sumar">+</button>
      <input type="number" min="0" step="any" bind:value={l.precio} style="width:110px" aria-label="Precio unitario" />
    </div>
  {/each}
  <input type="hidden" name="items" value={items} />
  <div class="row" style="margin:16px 0">
    <label>Entrega <input name="entrega" type="date" required /></label>
    <select name="cliente"><option value="">Sin cliente</option>{#each data.clientes as c}<option value={c.id}>{c.nombre}</option>{/each}</select>
    <input name="sena" type="number" min="0" step="any" placeholder="Seña" style="width:120px" />
  </div>
  {#if form?.error}<p class="err">{form.error}</p>{/if}
  <button class="btn">Guardar pedido · {ars(total)}</button>
</form>
