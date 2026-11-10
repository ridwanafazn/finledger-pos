"use client";

import { useRouter } from "next/navigation";
import { BootScreen } from "@/components/layout/boot-screen";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { AuditPanel } from "./audit-panel";

export function LedgerPage() {
  const router = useRouter();
  const authenticated = useAuthGuard();

  if (authenticated !== true) {
    return <BootScreen />;
  }

  return (
    <WalletProvider>
      <div className="min-h-dvh bg-surface-muted">
        <AuditPanel onBack={() => router.push("/")} />
      </div>
    </WalletProvider>
  );
}
