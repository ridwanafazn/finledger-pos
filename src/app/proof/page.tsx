import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { ProofPage } from "@/components/proof/proof-page";

export const metadata: Metadata = {
  title: "Proof Center",
  description:
    "Bukti idempotency, konkurensi, integritas ledger, dan metrik sistem FinLedger Engine.",
};

export default function Page() {
  return (
    <PageTransition>
      <ProofPage />
    </PageTransition>
  );
}
