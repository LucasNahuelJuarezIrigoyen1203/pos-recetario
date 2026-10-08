// Arma un link para abrir un chat de WhatsApp. El teléfono se guarda con código de área, sin 0 ni 15.
export function waLink(tel: string | null | undefined, texto = ''): string | null {
  if (!tel) return null;
  let d = tel.replace(/\D/g, '').replace(/^0+/, '');
  if (!d) return null;
  if (!d.startsWith('54')) d = '549' + d;
  return `https://wa.me/${d}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
}
