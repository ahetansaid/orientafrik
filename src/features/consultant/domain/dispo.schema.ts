import { z } from 'zod';

// Publication d'un créneau de disponibilité par un consultant.
// Accepte les valeurs `datetime-local` (sans fuseau) et les normalise en ISO.
export const creneauSchema = z
  .object({
    startAt: z.coerce.date({ message: 'Date de début invalide.' }),
    endAt: z.coerce.date({ message: 'Date de fin invalide.' }),
  })
  .refine((v) => v.endAt > v.startAt, {
    message: 'La fin doit être après le début.',
    path: ['endAt'],
  })
  .transform((v) => ({ startAt: v.startAt.toISOString(), endAt: v.endAt.toISOString() }));

export type CreneauValues = z.infer<typeof creneauSchema>;

// Réservation d'une consultation par un bachelier.
export const reservationSchema = z.object({
  consultantId: z.string().uuid(),
  typeId: z.string().uuid(),
  slotId: z.string().uuid().optional(),
});

export type ReservationValues = z.infer<typeof reservationSchema>;
