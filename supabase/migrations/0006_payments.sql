-- =====================================================================
-- 0006 — Paiements (Fedapay — compte unique, PAS de split en MVP)
-- =====================================================================

create table payments (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references profiles(id) on delete cascade,
  purpose               payment_purpose not null,
  amount_fcfa           integer not null,
  statut                payment_statut not null default 'pending',
  fedapay_transaction_id text,
  related_type          text,       -- 'plan_parcours' | 'consultation'
  related_id            uuid,
  created_at            timestamptz not null default now()
);
create index on payments(user_id);
-- Idempotence webhook Fedapay : une transaction ne peut être écrite qu'une fois.
create unique index on payments(fedapay_transaction_id) where fedapay_transaction_id is not null;
