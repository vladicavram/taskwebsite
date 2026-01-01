# Hire System Spec (Rewrite)

**Summary**
- Conversion rate: **1 credit = 100 MDL**. When showing required credits for a task or counter-offer, compute: credits = max(1, Math.round(price / 100, 2)). (Use Float for fractional credits if needed, but ensure min 1.)
- Creators may create hires for any user regardless of credits. No credits are deducted at creation time.
- The *tasker* (applicant) must explicitly *accept* a hire to be charged; the system allows the tasker to accept only if they have enough credits at the moment of acceptance.
- If the task value is 0 MDL, the candidate must still have at least 1 credit to accept.
- Taskers may send counter-offers only if they currently have enough credits to cover the counter-offer amount (computed with the credit conversion rule above).
- Counter-offers and accept/decline messages generate `Notification` records for the counterpart user.

## High-level states & transitions
- An application (hire) has: status = `pending | offered | counter_proposed | offered_by_creator | accepted | declined | removed`
  - `pending`: initial application / hire request exists but no active offer
  - `offered` (or `offered_by_creator`): creator offered a hire at `proposedPrice`; awaiting applicant accept/decline
  - `counter_proposed`: applicant proposed a counter-offer at `proposedPrice`; awaiting creator accept/decline/counter
  - `accepted`: applicant accepted; credits have been charged and `creditTransaction` of type 'spent' created
  - `declined` / `removed`: ending states

## Data model changes (Prisma)
- Keep `Application` model and fields: `proposedPrice`, `lastProposedBy`, `chargedCredits` (Float?), `status` (string), `selectedAt` (DateTime?).
- Add `acceptedBy` String? to record the user id who performed the accept (audit). Already added.
- Add constraints/logic: chargedCredits records the actual credits that were debited upon acceptance.
- All `accept` operations must create a `CreditTransaction` of type `spent` tied to `relatedTaskId`.

## API contract
1. POST /api/hires
   - Body: { taskId, applicantId, offeredPrice? }
   - Behavior: create Application record with status `offered` (if offeredPrice present) or `pending` if not. No credits deducted.
   - Auth: creator (task owner) may create hires for any user.

2. PATCH /api/hires/[id]/counter-offer
   - Body: { proposedPrice }
   - Behavior:
     - If caller is applicant: verify applicant has at least required credits for proposedPrice; update `proposedPrice`, `lastProposedBy` = applicantId, set status `counter_proposed`; create notification for creator.
     - If caller is creator: update `proposedPrice`, `lastProposedBy` = creatorId; set status `offered_by_creator`; create notification for applicant.
   - No charges are performed on counter-offer except when applicant is increasing their counter and we decide to reserve funds (we do NOT pre-reserve by default per spec: applicant must have credits when accepting; exception: to avoid race, you may optionally reserve chargedCredits at applicant counter-offer time — but spec requires applicant have credits to propose, so reservation is not strictly necessary).

3. PATCH /api/hires/[id]/accept
   - Body: { confirm: true }
   - Caller must be applicant (tasker). Behavior:
     - Recompute required credits = max(1, (proposedPrice ?? task.price) / 100)
     - If requiredCredits === 0 -> treat as 1
     - If applicant.credits < requiredCredits -> return 400 with message and `buyCreditsUrl` suggestion
     - Use conditional DB update to deduct credits atomically: UPDATE "User" SET credits = credits - X WHERE id = applicantId AND credits >= X RETURNING credits
     - If update success: create `creditTransaction` of type 'spent' with amount = requiredCredits, set `chargedCredits = requiredCredits`, `status = 'accepted'`, `selectedAt = now()`, `acceptedBy = applicantId`.
     - If atomic deduct fails due to insufficient funds -> return 400 (insufficient)

4. PATCH /api/hires/[id]/decline or remove
   - Creator may decline or remove; if removing an accepted application, then do refunds according to business rules; creating `creditTransaction` of type 'refund' where appropriate.

5. GET /api/users/[id]/credits
   - Return current credits (Float) for client display and gating.

## UI behaviour (client)
- On `hire` page: creator can hire any user (no credit checks). When offering, include `proposedPrice` input.
- Applicant sees an Offer card showing `proposedPrice` (or task price). Show Accept button showing required credits (computed). If applicant credits cannot be determined, disable Accept and show 'Checking credits…'.
- When applicant has insufficient credits: show a prominent CTA `Buy Credits` linking to `/profile/credits/purchase` and disable Accept to avoid accidental action.
- Applicant can send a counter-offer only if they have enough credits for proposed price (client-side check backed by server verification).
- When creator receives an applicant counter-offer, show Accept/Decline/Counter actions. If creator clicks Accept, the application goes into `offered_by_creator` state (or remains `offered`), but **do not** charge the applicant automatically — the applicant must Accept to be charged.

## Invariants & safety
- Every accepted application must have a corresponding `CreditTransaction` of type `spent` and `chargedCredits` set to the amount charged.
- Accept process must be an atomic DB transaction performing: check credits, conditional decrement, create spent tx, update application to accepted and record `chargedCredits`, set `selectedAt`.
- Never allow a user to accept a price they could not afford at the instant of acceptance.
- Record `acceptedBy` on accept for audit.

## Reconciliation for historical data
- Provide scripts:
  - `scripts/find_missing_spent.js` (dry-run) — report accepted apps with `chargedCredits > 0` but no `spent` tx.
  - `scripts/backfill_spent.js` — dry-run mode: attempt to conditionally decrement user by `chargedCredits` and insert `spent` tx only if user has sufficient balance; otherwise flag for manual review. Optionally allow `--apply` to run the remediate changes.

## Testing & migration plan
- Add unit tests covering: applicant sending counters (insufficient credits), creator creating hires, applicant accepting successfully (successful charge), applicant acceptance failing due to insufficient funds, creator accepting counter-offer should not auto-charge applicant.
- Staging deployment: run migrations, exercise flows, run reconciliation scripts in dry-run to see the effect on staging DB, fix edge cases.

---

If this spec looks correct I will:
1. Implement the minimal Prisma schema changes (if any) and create a migration.
2. Implement new API endpoints under `src/app/api/hires/...` and server-side logic with atomic transactions.
3. Replace the old hire UI with the new `hire` pages and components and wire up client UI rules (Accept gating, buy credits CTA, counter-offer flow).
4. Add reconciliation scripts and smoke tests.

Please confirm and I will begin implementing the schema changes. If you'd like any alterations to the spec (status names, reservation behavior, or whether creator-accept auto-charges applicant), say so now.