<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
  const confirmar = (e: Event) => { if (!confirm('¿Borrar este usuario? Ya no va a poder entrar.')) e.preventDefault(); };
  const roles = ['admin', 'dueña', 'vendedor'];
</script>
<h1>Usuarios</h1>
<p class="muted">Admin y dueña ven y editan todo. El vendedor puede registrar ventas y pedidos, abrir y cerrar la caja y cargar clientes, pero no entra a productos, stock, gastos, reportes ni usuarios, y no puede editar ni anular ventas.</p>

{#if !data.configurado}
  <div class="card">
    <p class="err">Para crear usuarios desde acá falta una clave secreta.</p>
    <p>En Supabase, andá a <strong>Project Settings → API Keys → Secret keys</strong> y copiá la clave (<code>sb_secret_...</code>). Guardala como <code>SUPABASE_SECRET_KEY</code> en tu archivo <code>.env</code> y en <strong>Vercel → Settings → Environment Variables</strong> (sin que sea pública), y volvé a desplegar. Esa clave nunca se sube a GitHub.</p>
  </div>
{:else}
  <form method="post" action="?/crear" use:enhance class="row" style="margin-bottom:16px">
    <input name="nombre" placeholder="Nombre" class="grow" />
    <input name="email" type="email" placeholder="Email" required />
    <input name="password" type="text" placeholder="Contraseña (mín. 6)" required minlength="6" />
    <select name="rol">{#each roles as r}<option value={r} selected={r === 'vendedor'}>{r}</option>{/each}</select>
    <button class="btn">Crear usuario</button>
  </form>
{/if}
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}

{#each data.usuarios as u (u.id)}
  <div class="card">
    <form method="post" action="?/rol" use:enhance={keep} class="row">
      <input type="hidden" name="id" value={u.id} />
      <div class="grow"><input name="nombre" value={u.nombre ?? ''} style="width:100%" aria-label="Nombre" />{#if u.email}<span class="lbl">{u.email}</span>{/if}</div>
      {#if u.id === data.miId}
        <span class="pill">{u.rol} · sos vos</span>
      {:else}
        <select name="rol" aria-label="Rol">{#each roles as r}<option value={r} selected={r === u.rol}>{r}</option>{/each}</select>
        <button class="btn">Guardar</button>
      {/if}
    </form>
    {#if data.configurado && u.id !== data.miId}
      <div class="row" style="margin-top:8px">
        <form method="post" action="?/clave" use:enhance class="row">
          <input type="hidden" name="id" value={u.id} />
          <input name="password" type="text" placeholder="Nueva contraseña" minlength="6" required style="width:180px" />
          <button class="btn sec">Cambiar contraseña</button>
        </form>
        <form method="post" action="?/borrar" use:enhance>
          <input type="hidden" name="id" value={u.id} />
          <button class="btn danger" onclick={confirmar}>Borrar usuario</button>
        </form>
      </div>
    {/if}
  </div>
{/each}
