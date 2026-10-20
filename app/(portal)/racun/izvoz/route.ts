import { requireCustomer } from "@/features/auth/session";
import { rpc } from "@/lib/db";

// GDPR access and portability: the customer's own data as a file.
export async function GET() {
  const customer = await requireCustomer("/racun/profil");
  const data = await rpc("mormo_export_data", { p_customer: customer.id });
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mormo-moji-podatki.json"',
      "Cache-Control": "no-store",
    },
  });
}
