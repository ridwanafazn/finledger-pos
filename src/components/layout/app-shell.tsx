"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountPanel } from "@/components/account/account-panel";
import { KioskPanel } from "@/components/kiosk/kiosk-panel";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { BottomTabs, type Panel } from "./bottom-tabs";
import { BootScreen } from "./boot-screen";

export function AppShell({ initialPanel }: { initialPanel: Panel }) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(initialPanel);
  const authenticated = useAuthGuard();

  function changePanel(next: Panel) {
    setPanel(next);
    const url = new URL(window.location.href);
    url.searchParams.set("panel", next);
    window.history.replaceState(null, "", url);
  }

  if (authenticated !== true) {
    return <BootScreen />;
  }

  return (
    <WalletProvider>
      <div className="min-h-dvh">
        {panel === "akun" ? (
          <AccountPanel onBack={() => changePanel("belanja")} />
        ) : (
          <KioskPanel
            onOpenAccount={() => changePanel("akun")}
            onViewLedger={() => router.push("/ledger")}
          />
        )}

        <BottomTabs
          panel={panel}
          onChange={changePanel}
          className="lg:hidden"
        />
      </div>
    </WalletProvider>
  );
}
