export const ars = (n: number | string) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(n));

const TZ = { timeZone: 'America/Argentina/Buenos_Aires' } as const;
// fecha y hora en horario argentino (el servidor de Vercel trabaja en UTC)
export const hora = (s: string) => new Date(s).toLocaleString('es-AR', TZ);
// 'AAAA-MM-DD' -> 'DD/MM/AAAA'
export const fechaCorta = (s: string) => s.split('-').reverse().join('/');
