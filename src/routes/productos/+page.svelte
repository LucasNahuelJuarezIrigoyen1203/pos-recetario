<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
</script>
<h1>Productos</h1>
<form method="post" action="?/crear" use:enhance class="row" style="margin-bottom:16px">
  <input name="nombre" placeholder="Nombre" required class="grow" />
  <input name="precio" type="number" min="0" step="any" placeholder="Precio" required style="width:120px" />
  <input name="categoria" placeholder="Categoría" />
  <input name="color" type="color" value="#dbe7e0" aria-label="Color" />
  <button class="btn">Crear producto</button>
</form>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}
{#each data.productos as p (p.id)}
  <form method="post" action="?/editar" use:enhance={keep} class="row item" class:off={!p.activo}>
    <input type="hidden" name="id" value={p.id} />
    <input name="nombre" value={p.nombre} required class="grow" aria-label="Nombre" />
    <input name="precio" type="number" min="0" step="any" value={p.precio_venta} required style="width:110px" aria-label="Precio" />
    <input name="categoria" value={p.categoria ?? ''} placeholder="Categoría" style="width:130px" aria-label="Categoría" />
    <input name="color" type="color" value={p.color ?? '#dbe7e0'} aria-label="Color" />
    <label class="chk"><input type="checkbox" name="activo" checked={p.activo} /> Activo</label>
    <button class="btn">Guardar</button>
  </form>
{/each}
<p class="muted">Un producto desactivado deja de aparecer en "Nueva venta", pero se conserva en las ventas anteriores.</p>
