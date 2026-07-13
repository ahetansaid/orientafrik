// Formatage au bord (UI uniquement). Les montants circulent en entiers FCFA
// partout ailleurs. Locale fr-FR, fuseau Bénin.

const TZ_BENIN = 'Africa/Porto-Novo';

export function fcfa(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' F';
}

export function fourchetteFcfa(min: number, max: number): string {
  return `${fcfa(min)} – ${fcfa(max)}`;
}

export function dateBenin(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeZone: TZ_BENIN,
  }).format(d);
}
