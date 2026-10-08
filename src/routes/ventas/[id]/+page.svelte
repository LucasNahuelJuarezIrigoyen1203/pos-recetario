<script lang="ts">
  import { enhance } from '$app/forms';
  import { ars, hora } from '$lib/format';
  let { data, form } = $props();
  const v = $derived(data.venta);
  const rol = $derived((data as any).rol);
  const keep = () => async ({ update }: any) => { await update({ reset: false }); };
  const confirmar = (e: Event) => { if (!confirm('¿Anular esta venta? Se devuelve el stock y no se puede deshacer.')) e.preventDefault(); };
  const campos: Record<string, string> = { metodo_pago: 'Método de pago', cliente: 'Cliente', color_etiqueta: 'Color', estado: 'Estado' };
</script>

<p><a href="/ventas">← Ventas</a></p>
<h1>Venta #{v.id} {#if v.estado === 'anulada'}<span class="pill err">Anulada</span>{/if}</h1>
<p class="muted">{hora(v.fecha)} · {v.clientes?.nombre ?? 'Sin cliente'} · {v.metodo_pago}</p>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}
{#if v.estado === 'anulada' && v.motivo_anulacion}<p class="err">Motivo: {v.motivo_anulacion}</p>{/if}

<table>
  <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
  <tbody>
    {#each data.items as i (i.id)}
      <tr><td>{i.productos?.nombre ?? i.nombre_libre ?? '—'}</td><td>{i.cantidad}</td><td>{ars(i.precio_unitario)}</td><td>{ars(i.subtotal)}</td></tr>
    {/each}
    <tr><td colspan="3"><strong>Total</strong></td><td><strong>{ars(v.total)}</strong></td></tr>
  </tbody>
</table>

{#if v.estado === 'activa' && rol !== 'vendedor'}
  <h2>Editar</h2>
  <form method="post" action="?/editar" use:enhance={keep} class="row" style="margin-bottom:8px">
    <select name="metodo">
      {#each ['efectivo', 'transferencia', 'tarjeta', 'otro'] as m}<option value={m} selected={m === v.metodo_pago}>{m}</option>{/each}
    </select>
    <select name="cliente">
      <option value="">Sin cliente</option>
      {#each data.clientes as c}<option value={c.id} selected={c.id === v.cliente_id}>{c.nombre}</option>{/each}
    </select>
    <input name="color" type="color" value={v.color_etiqueta ?? '#ffffff'} aria-label="Color de etiqueta" />
    <button class="btn">Guardar cambios</button>
  </form>
  <p class="muted">Para corregir productos o cantidades, anulá la venta y cargala de nuevo.</p>

  <h2>Anular</h2>
  <form method="post" action="?/anular" use:enhance class="row">
    <input name="motivo" placeholder="Motivo de la anulación" required class="grow" />
    <button class="btn danger" onclick={confirmar}>Anular venta</button>
  </form>
{/if}

<h2>Historial de cambios</h2>
{#if data.historial.length === 0}<p class="muted">Esta venta no tuvo cambios.</p>{:else}
<table>
  <thead><tr><th>Fecha</th><th>Qué cambió</th><th>Antes</th><th>Después</th></tr></thead>
  <tbody>
    {#each data.historial as h (h.id)}
      <tr><td>{hora(h.fecha_edicion)}</td><td>{campos[h.campo_modificado] ?? h.campo_modificado}</td><td>{h.valor_anterior}</td><td>{h.valor_nuevo}</td></tr>
    {/each}
  </tbody>
</table>
{/if}
