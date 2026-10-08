<script lang="ts">
  import { enhance } from '$app/forms';
  import { ars, fechaCorta } from '$lib/format';
  import { waLink } from '$lib/whatsapp';
  let { data, form } = $props();
  const sena = (p: any) => Number(p['monto_seña'] ?? 0);
  const confirmar = (msg: string) => (e: Event) => { if (!confirm(msg)) e.preventDefault(); };
  const aviso = (p: any) => `Hola ${p.clientes?.nombre ?? ''}, te recordamos tu pedido para el ${fechaCorta(p.fecha_entrega)}. Saldo a abonar: ${ars(Number(p.monto_total) - sena(p))}.`;
</script>
<div class="row" style="justify-content:space-between"><h1>Pedidos</h1><a href="/pedidos/nuevo">+ Nuevo pedido</a></div>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}

<h2>Pendientes</h2>
{#if data.pendientes.length === 0}<p class="muted">No hay pedidos pendientes.</p>{/if}
{#each data.pendientes as p (p.id)}
  <div class="card">
    <div class="row" style="justify-content:space-between">
      <strong>Entrega: {fechaCorta(p.fecha_entrega)}</strong>
      <span>{p.clientes?.nombre ?? 'Sin cliente'}</span>
    </div>
    <ul>{#each p.pedido_items as i}<li>{i.cantidad} × {i.productos?.nombre ?? 'Producto'}</li>{/each}</ul>
    <p>Total {ars(p.monto_total)} · Seña {ars(sena(p))} · <strong>Saldo {ars(Number(p.monto_total) - sena(p))}</strong></p>
    <form method="post" action="?/entregar" use:enhance class="row">
      <input type="hidden" name="id" value={p.id} />
      <select name="metodo" aria-label="Cómo se cobró">
        <option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option>
        <option value="tarjeta">Tarjeta</option><option value="otro">Otro</option>
      </select>
      <button class="btn" onclick={confirmar('¿Marcar como entregado y registrar la venta?')}>Entregar y cobrar</button>
      <button class="btn danger" formaction="?/cancelar" onclick={confirmar('¿Cancelar este pedido?')}>Cancelar pedido</button>
      {#if waLink(p.clientes?.telefono, aviso(p))}<a href={waLink(p.clientes?.telefono, aviso(p))} target="_blank" rel="noopener">Avisar por WhatsApp</a>{/if}
    </form>
  </div>
{/each}
<p class="muted">Al entregar se registra una venta por el total del pedido (y se descuenta stock). La seña ya cobrada antes no figura en la caja de ese día.</p>

{#if data.anteriores.length}
  <h2>Anteriores</h2>
  <table>
    <thead><tr><th>Entrega</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
    <tbody>{#each data.anteriores as p (p.id)}
      <tr class:off={p.estado === 'cancelado'}><td>{fechaCorta(p.fecha_entrega)}</td><td>{p.clientes?.nombre ?? '—'}</td><td>{ars(p.monto_total)}</td><td>{p.estado}</td></tr>
    {/each}</tbody>
  </table>
{/if}
