import type { Metadata } from "next";
import { site } from "@/config/site";
import { SignupWizard } from "@/features/leads/SignupWizard";
import { backendEnabled, stripeEnabled } from "@/lib/env";

export const metadata: Metadata = {
  title: "Prijavi pranje",
  description: "Izberi vozilo, paket in prvi termin. Kontaktirali te bomo in termin potrdili.",
  alternates: { canonical: "/prijava" },
};

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ paket?: string; velikost?: string; nacin?: string }> }) {
  const { paket, velikost, nacin } = await searchParams;

  return (
    <section className="min-h-svh bg-fog pb-24 pt-[calc(var(--nav-h)+40px)] md:pt-[calc(var(--nav-h)+64px)]">
      <div className="wrap">
        <SignupWizard
          initialPlan={paket}
          initialSize={velikost}
          enquiry={nacin === "povprasevanje"}
          backend={backendEnabled}
          payOnline={stripeEnabled}
          contact={{ phone: site.phone, phoneDisplay: site.phoneDisplay, email: site.email }}
        />
      </div>
    </section>
  );
}
