<script lang="ts">
  import { enhance } from '$app/forms';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
  const confirmar = (e: Event) => { if (!confirm('¿Borrar este proveedor?')) e.preventDefault(); };
</script>
<h1>Proveedores</h1>
<form method="post" action="?/crear" use:enhance class="row" style="margin-bottom:16px">
  <input name="nombre" placeholder="Nombre" required class="grow" />
  <input name="telefono" placeholder="Teléfono" style="width:150px" />
  <input name="contacto" placeholder="Persona de contacto" />
  <input name="notas" placeholder="Notas" class="grow" />
  <button class="btn">Agregar proveedor</button>
</form>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}
{#if data.proveedores.length === 0}<p class="muted">Todavía no hay proveedores. Agregá el primero arriba.</p>{/if}
{#each data.proveedores as p (p.id)}
  <form method="post" action="?/editar" use:enhance={keep} class="row item">
    <input type="hidden" name="id" value={p.id} />
    <input name="nombre" value={p.nombre} required class="grow" aria-label="Nombre" />
    <input name="telefono" value={p.telefono ?? ''} placeholder="Teléfono" style="width:150px" aria-label="Teléfono" />
    <input name="contacto" value={p.contacto ?? ''} placeholder="Contacto" aria-label="Contacto" />
    <input name="notas" value={p.notas ?? ''} placeholder="Notas" class="grow" aria-label="Notas" />
    <button class="btn">Guardar</button>
    {#if waLink(p.telefono)}<a href={waLink(p.telefono)} target="_blank" rel="noopener">WhatsApp</a>{/if}
    <button class="btn danger" formaction="?/borrar" onclick={confirmar}>Borrar</button>
  </form>
{/each}
