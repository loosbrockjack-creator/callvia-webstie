// Plain CRUD on the clients table, outside the agreement lifecycle and outside
// auth. Used by the client dashboard to show and edit contact info.

import { q } from "../db";

export interface ClientRow {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  stripe_customer_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getClientById(id: string): Promise<ClientRow | null> {
  const rows = await q<ClientRow>(
    `select id, business_name, contact_name, email, phone,
            stripe_customer_id, created_at, updated_at
     from clients where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export interface ContactInfoInput {
  businessName: string;
  contactName: string;
  phone: string | null;
}

// Email is deliberately not editable here: it is the unique login identity and
// changing it needs its own verify-the-new-address flow. The updated_at trigger
// on clients handles the timestamp.
export async function updateClientContactInfo(id: string, input: ContactInfoInput): Promise<void> {
  await q(
    `update clients
       set business_name = $2, contact_name = $3, phone = $4
     where id = $1`,
    [id, input.businessName, input.contactName, input.phone],
  );
}
