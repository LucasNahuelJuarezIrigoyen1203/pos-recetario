<script lang="ts">
  import { enhance } from '$app/forms';
  import { ars } from '$lib/format';
  let { data, form } = $props();
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
  const costo = $derived(data.items.reduce((a: number, i: any) => a + Number(i.cantidad_necesaria) * Number(i.insumos?.costo_unitario ?? 0), 0));
  const precio = $derived(Number(data.producto.precio_venta));
  const margen = $derived(precio > 0 ? Math.round(((precio - costo) / precio) * 100) : 0);
</script>

<div class="noprint">
  <p><a href="/recetas">← Recetas</a></p>
  <h1>{data.producto.nombre}</h1>
  {#if form?.error}<p class="err">{form.error}</p>{/if}
  {#if form?.ok}<p class="ok">{form.ok}</p>{/if}

  <h2>Insumos</h2>
  {#if data.items.length === 0}<p class="muted">Esta receta todavía no tiene insumos. Agregá el primero abajo.</p>{/if}
  {#each data.items as i (i.id)}
    <form method="post" action="?/cantidad" use:enhance={keep} class="row item">
      <input type="hidden" name="id" value={i.id} />
      <span class="grow">{i.insumos?.nombre}</span>
      <input name="cantidad" type="number" min="0" step="any" value={i.cantidad_necesaria} style="width:110px" aria-label="Cantidad" />
      <span class="muted" style="width:40px">{i.insumos?.unidad}</span>
      <span class="muted" style="width:90px">{ars(Number(i.cantidad_necesaria) * Number(i.insumos?.costo_unitario ?? 0))}</span>
      <button class="btn">Guardar</button>
      <button class="btn danger" formaction="?/quitar">Quitar</button>
    </form>
  {/each}

  <form method="post" action="?/agregar" use:enhance class="row" style="margin:16px 0">
    <select name="insumo_id" required class="grow">
      <option value="">Elegí un insumo</option>
      {#each data.insumos as s}<option value={s.id}>{s.nombre} ({s.unidad})</option>{/each}
    </select>
    <input name="cantidad" type="number" min="0" step="any" placeholder="Cantidad por unidad" required style="width:170px" />
    <button class="btn">Agregar a la receta</button>
  </form>
  {#if data.insumos.length === 0}<p class="muted">No hay insumos cargados. Creá los insumos primero en <a href="/stock">Stock</a>.</p>{/if}

  {#if data.items.length}
    <p>Costo por unidad: <strong>{ars(costo)}</strong> · Precio: <strong>{ars(precio)}</strong> · Margen: <strong class:err={margen < 0}>{margen}%</strong></p>
    <p class="muted">El costo usa el costo unitario cargado en Stock. Las cantidades son por cada unidad vendida del producto.</p>
  {/if}

  <h2>Preparación</h2>
  <form method="post" action="?/descripcion" use:enhance={keep}>
    <textarea name="descripcion" rows="8" placeholder="Pasos, tiempos de cocción, notas...">{data.producto.descripcion ?? ''}</textarea>
    <div class="row" style="margin-top:8px">
      <button class="btn">Guardar preparación</button>
      <button type="button" class="btn sec" onclick={() => window.print()}>Imprimir receta / guardar PDF</button>
    </div>
  </form>
</div>

<div class="solo-print">
  <h1>{data.producto.nombre}</h1>
  <h2>Ingredientes (por unidad)</h2>
  <ul>{#each data.items as i}<li>{i.insumos?.nombre}: {i.cantidad_necesaria} {i.insumos?.unidad}</li>{/each}</ul>
  {#if data.producto.descripcion}
    <h2>Preparación</h2>
    <p style="white-space:pre-wrap">{data.producto.descripcion}</p>
  {/if}
</div>
