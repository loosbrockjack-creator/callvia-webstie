// Cascading archive for a client: archiving a business also archives every
// agreement (service + trial) and onboarding form tied to it, in one atomic
// request. Without this, deleting a client would leave its agreements/trials/
// onboarding forms still listed everywhere else, pointing at a client that no
// longer appears in Clients -- an orphaned-looking dashboard, not a clean one.
//
// Uses the Neon HTTP driver's transaction() rather than three sequential
// q() calls: the three tables are independent (no single WHERE covers all of
// them), so this is the one place worth reaching for a real multi-statement
// transaction instead of the compare-and-swap-per-call pattern the rest of
// lib/agreement/queries.ts uses.
//
// Deliberately does not touch a trial's converted_to_agreement_id: the paid
// agreement a trial converted to is a separate row and may belong to a real,
// still-active customer relationship.

import { db } from "../db";

export interface ArchiveClientResult {
  archived: boolean;
  agreementsArchived: number;
  onboardingArchived: number;
}

export async function archiveClientCascade(clientId: string): Promise<ArchiveClientResult> {
  const [clientRows, agreementRows, onboardingRows] = await db().transaction((sql) => [
    sql`update clients set archived_at = now()
        where id = ${clientId} and archived_at is null
        returning id`,
    sql`update agreements set archived_at = now()
        where client_id = ${clientId} and archived_at is null
        returning id`,
    sql`update onboarding_forms set archived_at = now()
        where client_id = ${clientId} and archived_at is null
        returning id`,
  ]);

  return {
    archived: clientRows.length > 0,
    agreementsArchived: agreementRows.length,
    onboardingArchived: onboardingRows.length,
  };
}
