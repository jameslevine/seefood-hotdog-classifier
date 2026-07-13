// Lead-capture persistence. Stores demo/contact-sales submissions from the
// marketing site into the seefood-leads DynamoDB table.
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, LEADS_TABLE } from "./aws";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  message?: string;
  source: string; // e.g. "landing" | "contact"
  createdAt: string; // ISO
}

export async function saveLead(lead: Lead): Promise<void> {
  await ddb().send(new PutCommand({ TableName: LEADS_TABLE, Item: lead }));
}

// Minimal, dependency-free work-email validation. Rejects empty, malformed,
// and (softly) obvious free/personal domains are still accepted — we don't
// want to block legitimate leads, just catch typos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}
