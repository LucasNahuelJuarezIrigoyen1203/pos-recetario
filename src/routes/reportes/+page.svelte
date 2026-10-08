<script lang="ts">
  import { ars, fechaCorta } from '$lib/format';
  let { data } = $props();
  let canvas = $state<HTMLCanvasElement>();
  const ventas = $derived(Number(data.r.total_ventas));
  const gastos = $derived(Number(data.r.total_gastos));
  const resultado = $derived(ventas - gastos);
  const metodos = $derived(Object.entries(data.r.por_metodo as Record<string, number>));

  $effect(() => {
    const dias = data.r.por_dia as { dia: string; total: number }[];
    const el = canvas;
    if (!el || dias.length === 0) return;
    let vivo = true, chart: any;
    (async () => {
      const { Chart } = await import('chart.js/auto');
      if (!vivo) return;
      chart = new Chart(el, {
        type: 'bar',
        data: { labels: dias.map((d) => fechaCorta(d.dia).slice(0, 5)), datasets: [{ label: 'Ventas', data: dias.map((d) => Number(d.total)), backgroundColor: '#4fb58c' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    })();
    return () => { vivo = false; chart?.destroy(); };
  });
</script>

<h1>Reportes</h1>
<form method="get" class="row noprint" style="margin-bottom:16px">
  <label>Desde <input type="date" name="desde" value={data.desde} /></label>
  <label>Hasta <input type="date" name="hasta" value={data.hasta} /></label>
  <button class="btn">Ver</button>
  <button type="button" class="btn sec" onclick={() => window.print()}>Imprimir / guardar PDF</button>
</form>
{#if data.error}<p class="err">No se pudo generar el reporte: {data.error}. ¿Ejecutaste la migración 002 en Supabase?</p>{/if}
<p class="muted">Del {fechaCorta(data.desde)} al {fechaCorta(data.hasta)}</p>

<div class="card">
  <p class="stat" style="margin:0">{ars(ventas)}</p>
  <p class="muted" style="margin:0">{data.r.cant_ventas} ventas (sin contar las anuladas)</p>
</div>
<table style="margin-bottom:16px">
  <tbody>
    <tr><td>Ventas</td><td>{ars(ventas)}</td></tr>
    <tr><td>Gastos registrados</td><td>{ars(gastos)}</td></tr>
    <tr><td><strong>Ventas menos gastos</strong></td><td><strong class:err={resultado < 0}>{ars(resultado)}</strong></td></tr>
  </tbody>
</table>

<h2>Por método de pago</h2>
{#if metodos.length === 0}<p class="muted">No hay ventas en este período.</p>{:else}
<table><tbody>{#each metodos as [m, t]}<tr><td>{m}</td><td>{ars(t)}</td></tr>{/each}</tbody></table>
{/if}

<h2>Ventas por día</h2>
{#if data.r.por_dia.length === 0}<p class="muted">No hay ventas en este período.</p>{:else}
<div style="position:relative;height:260px"><canvas bind:this={canvas}></canvas></div>
{/if}

<h2>Productos más vendidos</h2>
{#if data.r.top.length === 0}<p class="muted">No hay ventas en este período.</p>{:else}
<table>
  <thead><tr><th>Producto</th><th>Unidades</th><th>Facturado</th></tr></thead>
  <tbody>{#each data.r.top as t}<tr><td>{t.nombre}</td><td>{t.cantidad}</td><td>{ars(t.monto)}</td></tr>{/each}</tbody>
</table>
{/if}
<p class="muted">"Ventas menos gastos" resta solo lo cargado en Gastos; no descuenta el costo de los insumos de cada producto.</p>
