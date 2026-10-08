<script lang="ts">
  import { enhance } from '$app/forms';
  import { ars } from '$lib/format';
  let { data, form } = $props();
  let contado = $state<number | undefined>();
  const esperado = $derived(data.actual ? Number(data.actual.monto_inicial) + data.actual.porMetodo.efectivo : 0);
  const dif = $derived(contado == null ? null : Math.round((contado - esperado) * 100) / 100);
  const tz = { timeZone: 'America/Argentina/Buenos_Aires' } as const;
  const fh = (s: string) => new Date(s).toLocaleString('es-AR', tz);
  const fd = (s: string) => s.split('-').reverse().join('/');
  const confirmar = (e: Event) => { if (!confirm('¿Cerrar la caja? Después no se puede reabrir.')) e.preventDefault(); };
  const alCerrar = () => async ({ update }: any) => { await update(); contado = undefined; };
</script>

<h1>Caja</h1>
{#if form?.error}<p class="err">{form.error}</p>{/if}
{#if form?.ok}<p class="ok">{form.ok}</p>{/if}

{#if !data.actual}
  <p class="muted">No hay una caja abierta. Abrila antes de empezar a vender, así las ventas quedan registradas en el cierre.</p>
  <form method="post" action="?/abrir" use:enhance class="row" style="margin:12px 0 24px">
    <input name="inicial" type="number" min="0" step="any" placeholder="Efectivo inicial" style="width:170px" />
    <button class="btn">Abrir caja</button>
  </form>
{:else}
  <p class="muted">Abierta el {fh(data.actual.fecha_apertura)} · {data.actual.cantidad} ventas</p>
  <table style="margin-bottom:16px">
    <tbody>
      <tr><td>Efectivo inicial</td><td>{ars(data.actual.monto_inicial)}</td></tr>
      <tr><td>Ventas en efectivo</td><td>{ars(data.actual.porMetodo.efectivo)}</td></tr>
      <tr><td>Ventas por transferencia</td><td>{ars(data.actual.porMetodo.transferencia)}</td></tr>
      <tr><td>Ventas con tarjeta</td><td>{ars(data.actual.porMetodo.tarjeta)}</td></tr>
      <tr><td>Otros</td><td>{ars(data.actual.porMetodo.otro)}</td></tr>
      <tr><td><strong>Total vendido</strong></td><td><strong>{ars(data.actual.total)}</strong></td></tr>
    </tbody>
  </table>
  <h2>Cerrar caja</h2>
  <p>Efectivo que tendría que haber: <strong>{ars(esperado)}</strong> <span class="muted">(inicial + ventas en efectivo)</span></p>
  <form method="post" action="?/cerrar" use:enhance={alCerrar} class="row" style="margin:12px 0">
    <input name="contado" type="number" min="0" step="any" placeholder="Efectivo contado" required bind:value={contado} style="width:170px" />
    <button class="btn" onclick={confirmar}>Cerrar caja</button>
  </form>
  {#if dif !== null}
    <p class:err={dif < 0} class:ok={dif >= 0}>
      {dif === 0 ? 'La caja cuadra.' : dif > 0 ? `Sobran ${ars(dif)}.` : `Faltan ${ars(-dif)}.`}
    </p>
  {/if}
{/if}

<h2>Cierres anteriores</h2>
{#if data.historial.length === 0}<p class="muted">Todavía no hay cierres.</p>{:else}
<table>
  <thead><tr><th>Día</th><th>Ventas</th><th>Contado</th><th>Diferencia</th></tr></thead>
  <tbody>
    {#each data.historial as c (c.id)}
      <tr>
        <td>{c.fecha_correspondiente ? fd(c.fecha_correspondiente) : fh(c.fecha_apertura)}<br /><small class="muted">{fh(c.fecha_cierre)}</small></td>
        <td>{ars(c.ventas)}</td>
        <td>{ars(c.monto_final ?? 0)}</td>
        <td class:err={Number(c.diferencia) < 0}>{ars(c.diferencia ?? 0)}</td>
      </tr>
    {/each}
  </tbody>
</table>
{/if}
