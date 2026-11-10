"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  ScrollText,
  ShieldCheck,
  Split,
} from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_UPSTREAM_URL, ApiProblemError, api } from "@/lib/api";
import { hasSession, setSession } from "@/lib/auth";
import type { AuthLoginResponse } from "@/types/api";

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Idempotency di setiap POST",
    description: "Satu kunci per aksi bisnis, bukan per percobaan jaringan.",
  },
  {
    icon: Split,
    title: "Double-entry yang seimbang",
    description: "Setiap debit selalu punya kredit pasangannya.",
  },
  {
    icon: ScrollText,
    title: "Audit trail immutable",
    description: "Riwayat mutasi tidak dapat diubah setelah tercatat.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasSession()) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { data } = await api.post<AuthLoginResponse>(
        "/auth/login",
        { username, password },
        { skipErrorToast: true, skipAuthRedirect: true },
      );
      setSession(data);
      router.replace("/");
    } catch (caught) {
      if (caught instanceof ApiProblemError) {
        setError(
          caught.problem.status === 401
            ? "Username atau password salah."
            : (caught.problem.detail ?? caught.problem.title),
        );
      } else {
        setError("Tidak dapat masuk. Periksa koneksi ke backend.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between border-r border-border bg-surface-muted p-10 lg:flex">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-[15px] font-bold leading-tight text-ink-900">
              zLedger
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-400">
              Belanja dan Poin
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-[34px] font-extrabold leading-[1.15] tracking-tight text-ink-900">
            Belanja hemat, poin tetap utuh.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Kiosk zLedger di atas FinLedger Engine. Bayar dengan saldo IDR dan
            A-Poin sekaligus, lalu lihat setiap mutasi tercatat permanen.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-surface text-brand-500">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="font-mono text-[11px] text-ink-400">
          {API_UPSTREAM_URL}
        </p>
      </aside>

      <main className="flex flex-col bg-surface">
        <div className="flex items-center gap-3 p-5 lg:hidden">
          <BrandMark />
          <div>
            <p className="text-[15px] font-bold leading-tight">zLedger</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-400">
              Belanja dan Poin
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 pt-4 sm:px-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold tracking-tight">
              Masuk ke zLedger
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
              Gunakan akun FinLedger Engine untuk mulai belanja.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-debit/20 bg-debit/5 px-3 py-2.5 text-[12px] font-medium leading-relaxed text-debit"
                >
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memverifikasi
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-400">
              Sesi disimpan di perangkat ini. Keluar kapan saja dari bilah atas.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
