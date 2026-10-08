<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
  const confirmar = (e: Event) => { if (!confirm('¿Borrar este insumo?')) e.preventDefault(); };
  const bajo = (i: any) => Number(i.stock_actual) <= Number(i.stock_minimo);
</script>
<h1>Stock</h1>
<p class="muted">Acá se cargan los insumos (harina, huevos, pollo...). Cada venta descuenta stock según la receta del producto, que se arma en <a href="/recetas">Recetas</a>.</p>
<form method="post" action="?/crear" use:enhance class="row" style="margin-bottom:16px">
  <input name="nombre" placeholder="Insumo" required class="grow" />
  <input name="unidad" placeholder="Unidad (kg, u, l)" style="width:130px" />
  <input name="stock_actual" type="number" step="any" placeholder="Stock" style="width:100px" />
  <input name="stock_minimo" type="number" step="any" placeholder="Mínimo" style="width:100px" />
  <input name="costo_unitario" type="number" min="0" step="any" placeholder="Costo" style="width:100px" />
  <select name="proveedor_id"><option value="">Sin proveedor</option>{#each data.proveedores as p}<option value={p.id}>{p.nombre}</option>{/each}</select>
  <button class="btn">Agregar insumo</button>
</form>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}
{#if data.insumos.length === 0}<p class="muted">Todavía no hay insumos. Agregá el primero arriba.</p>{/if}
{#each data.insumos as i (i.id)}
  <form method="post" action="?/editar" use:enhance={keep} class="row item">
    <input type="hidden" name="id" value={i.id} />
    <div class="grow"><input name="nombre" value={i.nombre} required style="width:100%" aria-label="Nombre" />{#if bajo(i)}<span class="err lbl">Stock bajo</span>{/if}</div>
    <div><span class="lbl">Unidad</span><input name="unidad" value={i.unidad} style="width:80px" /></div>
    <div><span class="lbl">Stock</span><input name="stock_actual" type="number" step="any" value={i.stock_actual} style="width:100px" /></div>
    <div><span class="lbl">Mínimo</span><input name="stock_minimo" type="number" step="any" value={i.stock_minimo} style="width:100px" /></div>
    <div><span class="lbl">Costo</span><input name="costo_unitario" type="number" min="0" step="any" value={i.costo_unitario} style="width:100px" /></div>
    <div><span class="lbl">Proveedor</span>
      <select name="proveedor_id"><option value="">—</option>{#each data.proveedores as p}<option value={p.id} selected={p.id === i.proveedor_id}>{p.nombre}</option>{/each}</select>
    </div>
    <button class="btn">Guardar</button>
    <button class="btn danger" formaction="?/borrar" onclick={confirmar}>Borrar</button>
  </form>
{/each}
