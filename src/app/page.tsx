import { AppShell } from "@/components/layout/app-shell";
import { PageTransition } from "@/components/layout/page-transition";
import type { Panel } from "@/components/layout/bottom-tabs";

const PANELS: Panel[] = ["belanja", "akun"];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ panel?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.panel) ? params.panel[0] : params.panel;
  const initialPanel = PANELS.includes(raw as Panel)
    ? (raw as Panel)
    : "belanja";

  return (
    <PageTransition>
      <AppShell initialPanel={initialPanel} />
    </PageTransition>
  );
}
