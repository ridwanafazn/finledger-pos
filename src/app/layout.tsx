import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "zLedger",
    template: "%s - zLedger",
  },
  description:
    "zLedger — kiosk belanja dengan checkout multi-tender, idempotency, dan audit trail double-entry dari FinLedger Engine.",
  applicationName: "zLedger",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e31e24",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-dvh bg-surface-muted font-sans text-ink-900 antialiased">
        {children}
        <Toaster
          position="top-center"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-2xl border border-border shadow-sm",
            },
          }}
        />
      </body>
    </html>
  );
}
