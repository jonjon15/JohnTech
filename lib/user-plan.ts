import { sql } from "@/lib/db";

export async function hasActivePlan(email: string): Promise<boolean> {
  const { rows } = await sql`SELECT active_plan FROM users WHERE email = ${email}`;
  if (rows.length === 0) return false;
  const plan = rows[0].active_plan;
  return !!plan && plan !== "" && plan !== null && plan !== "Starter";
}

export async function getUserPlan(email: string): Promise<string | null> {
  const { rows } = await sql`SELECT active_plan FROM users WHERE email = ${email}`;
  if (rows.length === 0) return null;
  return rows[0].active_plan;
}
