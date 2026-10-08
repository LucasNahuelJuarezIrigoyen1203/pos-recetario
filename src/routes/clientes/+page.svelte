<script lang="ts">
  import { enhance } from '$app/forms';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
  const confirmar = (e: Event) => { if (!confirm('¿Borrar este cliente?')) e.preventDefault(); };
</script>
<h1>Clientes</h1>
<form method="post" action="?/crear" use:enhance class="row" style="margin-bottom:16px">
  <input name="nombre" placeholder="Nombre" required class="grow" />
  <input name="telefono" placeholder="Teléfono" style="width:150px" />
  <input name="email" type="email" placeholder="Email" />
  <input name="notas" placeholder="Notas" class="grow" />
  <button class="btn">Agregar cliente</button>
</form>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}
{#if data.clientes.length === 0}<p class="muted">Todavía no hay clientes. Agregá el primero arriba.</p>{/if}
{#each data.clientes as c (c.id)}
  <form method="post" action="?/editar" use:enhance={keep} class="row item">
    <input type="hidden" name="id" value={c.id} />
    <input name="nombre" value={c.nombre} required class="grow" aria-label="Nombre" />
    <input name="telefono" value={c.telefono ?? ''} placeholder="Teléfono" style="width:150px" aria-label="Teléfono" />
    <input name="email" type="email" value={c.email ?? ''} placeholder="Email" aria-label="Email" />
    <input name="notas" value={c.notas ?? ''} placeholder="Notas" class="grow" aria-label="Notas" />
    <button class="btn">Guardar</button>
    {#if waLink(c.telefono)}<a href={waLink(c.telefono)} target="_blank" rel="noopener">WhatsApp</a>{/if}
    <button class="btn danger" formaction="?/borrar" onclick={confirmar}>Borrar</button>
  </form>
{/each}
