import type { Metadata } from "next";
import { LedgerPage } from "@/components/audit/ledger-page";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  title: "Audit Trail",
  description:
    "Tampilan teknis mutasi double-entry FinLedger Engine untuk keperluan audit.",
};

export default function Page() {
  return (
    <PageTransition>
      <LedgerPage />
    </PageTransition>
  );
}
