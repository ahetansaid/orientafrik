// Contrat de retour unique des Server Actions. On ne lève JAMAIS d'exception à
// travers la frontière serveur/client : on renvoie un résultat discriminé, que
// l'UI peut traiter de façon prévisible.
export type AppErrorCode =
  | 'validation'
  | 'non_authentifie'
  | 'non_autorise'
  | 'introuvable'
  | 'conflit'
  | 'paiement_requis'
  | 'externe' // échec d'un service tiers (Fedapay, Resend...)
  | 'inconnu';

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: AppErrorCode; message: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: AppErrorCode, message: string): ActionResult<never> {
  return { ok: false, error, message };
}
