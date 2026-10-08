<script lang="ts">
  import { ars } from '$lib/format';
  let { data, form } = $props();
</script>
<h1>Productos</h1>
<form method="post" class="row" style="margin-bottom:16px">
  <input name="nombre" placeholder="Nombre" required class="grow" />
  <input name="precio" type="number" min="0" step="any" placeholder="Precio" required style="width:120px" />
  <input name="categoria" placeholder="Categoría" />
  <input name="color" type="color" value="#dbe7e0" aria-label="Color" />
  <button class="btn">Crear producto</button>
</form>
{#if form?.error}<p class="err">{form.error}</p>{/if}
<table>
  <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th></tr></thead>
  <tbody>{#each data.productos as p}
    <tr><td><span style:background={p.color} style="display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:8px"></span>{p.nombre}</td><td>{p.categoria ?? '—'}</td><td>{ars(p.precio_venta)}</td></tr>
  {/each}</tbody>
</table>
