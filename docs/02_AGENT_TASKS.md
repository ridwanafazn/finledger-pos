# 02. Agent Execution Roadmap — zLedger

**Dear Frontend Agent,**

Kerjakan **satu fase per turn**. Setelah satu fase selesai, berhenti, laporkan hasilnya, dan
tunggu approval Architect sebelum lanjut ke fase berikutnya. Jangan pernah mengerjakan dua fase sekaligus.

Aturan tetap:
- Baca `docs/01_FE_SPEC.md` sebelum mulai. Dokumen itu menang atas file lain.
- **Jangan menambah endpoint** di luar daftar di `01_FE_SPEC.md §9`.
- **Jangan menebak** nama field response. Verifikasi dulu.
- Tanpa emoji di UI, tanpa `alert()`, tanpa `any` yang tidak perlu.
- Setiap akhir fase: `npm run lint` + `npm run build` harus bersih.

---

## Ringkasan Fase

| # | Fase | Fokus | Status |
|---|---|---|---|
| 1 | Fondasi & API Layer | Scaffold Next.js, font, token, `axios`, auth JWT, idempotency, toast | Selesai |
| 2 | Layout Shell & Design System | Split-screen, bottom tab, primitives | Selesai |
| 3 | Kiosk — Wallet & Checkout | Katalog, keranjang, saldo, checkout multi-tender | Selesai |
| 4 | Idempotency Stress Test | Fire 5x dengan satu key | Selesai (di `/proof`) |
| 5 | Ledger Audit | Tabel light, flash, refresh | Selesai |
| 6 | Redeem, Polish & QA | Redeem, state, responsif, README | Selesai (redeem di `/proof`) |

**Total: 6 fase inti.** Auth JWT sudah termasuk di Fase 1 karena seluruh endpoint ledger dilindungi `bearerAuth`.

---

## Fase 1 — Fondasi & API Layer

**Tujuan:** proyek bisa dijalankan, font & token terpasang, semua aturan HTTP terkunci di satu tempat.

- [x] Inisialisasi Next.js App Router + TypeScript + Tailwind CSS + ESLint, folder `src/`, alias `@/*`.
- [x] Pasang `Plus Jakarta Sans` via `next/font/google`, ekspos `--font-sans`, terapkan di `<html lang="id">`.
- [x] Tulis token desain di `src/app/globals.css` (warna, radius, shadow) sesuai `01_FE_SPEC.md §4–5`.
- [x] Install: `axios`, `sonner`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`.
- [x] `.env.local` berisi `NEXT_PUBLIC_API_URL`; buat `.env.example`; pastikan `.env.local` masuk `.gitignore`.
- [x] `src/lib/utils.ts` — helper `cn()`.
- [x] `src/lib/idempotency.ts` — `newIdempotencyKey()` berbasis `crypto.randomUUID()`.
- [x] `src/lib/api.ts`:
  - instance `axios` dengan `baseURL` same-origin `/api/backend` (proxy) + fallback upstream,
  - request interceptor: auto-inject `X-Idempotency-Key` untuk `POST`/`PATCH` (bisa di-override agar 5 request stress test memakai key yang sama),
  - response interceptor: parse `application/problem+json` **dan** `application/json` → `ApiProblem` → toast Sonner,
  - `timeout` 15s.
- [x] `src/lib/error-copy.ts` — peta `errorCode` → pesan manusiawi (diisi saat kode ditemukan).
- [x] `src/lib/auth.ts` — simpan/ambil/hapus sesi (`accessToken`, `refreshToken`, `username`) di `localStorage`.
- [x] `src/app/login/page.tsx` — form login premium, memanggil `POST /auth/login`, redirect ke `/` saat sukses.
- [x] Guard sesi di shell: tanpa token → `/login`; `401` dari endpoint lain → hapus sesi + redirect.
- [x] `src/types/api.ts` — tipe **berdasarkan schema OpenAPI nyata**, bukan tebakan.
- [x] `<Toaster />` Sonner terpasang di root layout.
- [x] Proxy same-origin `src/app/api/backend/[...path]/route.ts` untuk melewati CORS backend.

**Deliverable:** `package.json`, `src/app/layout.tsx`, `src/app/login/page.tsx`, `src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/idempotency.ts`, `.env.example`.
**DoD:** `npm run dev` jalan, tidak ada error TS, login berhasil menyimpan token, `GET /ledger/accounts` mengembalikan `200`, dan error buatan memunculkan toast RFC 7807.

---

## Fase 2 — Layout Shell & Design System

**Tujuan:** kerangka responsif selesai sebelum isi data masuk.

- [x] `src/app/page.tsx` dengan state panel dari URL (`?panel=belanja|akun`).
- [x] Desktop: kiosk satu kolom di tengah; audit dipindah ke halaman `/ledger` terpisah.
- [x] Mobile: bottom tab bar glassmorphism (2 tab) + safe-area padding.
- [x] Primitives shadcn-style: `Button`, `Card`, `Input`, `Label`, `Badge`, `Skeleton`, `Separator`, `Dialog`.
- [x] State kosong/loading/error dasar untuk semua panel.
- [x] Metadata halaman, favicon, dan `viewport` yang benar.

**Deliverable:** `src/components/layout/*`, `src/components/ui/*`, `src/app/page.tsx`.
**DoD:** 375 / 768 / 1024 / 1440px rapi tanpa horizontal scroll, tab bisa di-share via URL, navigasi keyboard jalan.

---

## Fase 3 — Kiosk: Wallet & Checkout (Alfagift flow)

**Tujuan:** alur belanja utama bisa dipakai end-to-end.

- [x] `GET /ledger/accounts?ownerId=` → kartu saldo `IDR` & `A_POIN` dengan skeleton loader.
- [x] Header kiosk: brand, lokasi, avatar, pencarian produk.
- [x] Banner promo + chip kategori + grid produk (katalog statis).
- [x] Keranjang: tambah/kurangi/hapus item, bar total mengambang.
- [x] Checkout bottom sheet: input A-Poin, IDR otomatis, validasi saldo.
- [x] Submit `POST /ledger/checkout` dengan `idempotencyKey` di body **dan** header `X-Idempotency-Key` (UUID sama).
- [x] Sukses: toast, kosongkan keranjang, refresh saldo, picu refresh ledger.
- [x] Gagal: pesan inline dari RFC 7807, sheet tetap terbuka.
- [x] Panel Akun: profil `GET /auth/me`, saldo, konfigurasi, logout.

**Deliverable:** `src/components/kiosk/*`, `src/components/account/*`, `src/components/providers/wallet-provider.tsx`, `src/hooks/use-profile.ts`.
**DoD:** checkout sukses mengubah saldo; checkout gagal menampilkan `title`/`detail`/`errorCode`; double-submit tidak mungkin terjadi.

---

## Fase 4 — Idempotency Stress Test

**Tujuan:** membuktikan backend tidak double-charge.

- [ ] Tombol `Simulate Bad Network (Fire 5x)`.
- [ ] Satu `X-Idempotency-Key` dibuat sekali, dipakai untuk 5 request identik via `Promise.allSettled`.
- [ ] Panel hasil: index, status, durasi (ms), `errorCode` bila gagal.
- [ ] Tombol terkunci selama proses; tidak bisa di-spam.
- [ ] Setelah selesai: refetch saldo **sekali**, refetch audit **sekali**, verifikasi tidak ada duplikat.
- [ ] Tidak ada klaim "cached" kecuali backend memberi penanda replay.

**Deliverable:** `src/components/kiosk/StressTestPanel.tsx`, `src/lib/stress-test.ts`.
**DoD:** 5 request terkirim, saldo berubah tepat satu kali, audit tidak duplikat, UI menampilkan kelima hasil.

---

## Fase 5 — Ledger Audit (halaman terpisah)

**Tujuan:** audit trail yang meyakinkan secara visual, tanpa mengganggu alur belanja.

- [x] Halaman `/ledger` terpisah, tidak muncul di bottom nav.
- [x] `GET /ledger/accounts/{accountId}/mutations` untuk akun pelanggan + merchant, difilter ke transaksi yang sama.
- [x] Angka `tabular-nums`; debit merah, kredit emerald; ID transaksi mono.
- [x] Flash baris baru (`1400ms`) sesuai tipe; hormati `prefers-reduced-motion`.
- [x] Mobile: list kartu, bukan tabel ter-squash.
- [x] Refresh setelah checkout + tombol refresh manual.
- [ ] Pagination/filter **hanya jika** query param didukung backend.
- [ ] Polling opsional yang bisa di-pause.

**Deliverable:** `src/app/ledger/page.tsx`, `src/components/audit/*`, `src/hooks/use-mutations.ts`.
**DoD:** data tampil akurat, baris baru ter-flash, layout mobile terbaca, tidak ada horizontal scroll.

---

## Fase 6 — Redeem, Polish & QA

**Tujuan:** menutup sisa fitur dan merapikan kualitas.

- [ ] `GET /vouchers?activeOnly=true` → daftar voucher dengan `remainingQuota`.
- [ ] `POST /vouchers/{voucherId}/redeem` (body `{ ownerId }` + header key) dengan dialog konfirmasi.
- [ ] Alternatif: `POST /ledger/redeem?ownerId=&voucherId=&points=&idempotencyKey=`.
- [ ] Hasil redeem jelas (sukses/gagal), saldo & audit ikut refresh.
- [ ] Audit semua state: skeleton, empty, error, retry, offline.
- [ ] Responsif final + cek `prefers-reduced-motion` + fokus keyboard + kontras.
- [ ] Hapus `console.log`, pastikan tidak ada emoji/`alert()`.
- [ ] Update `README.md` (cara run, env, fase) dan pastikan tidak menyebut endpoint fiktif.
- [ ] `npm run lint` & `npm run build` bersih.

**Deliverable:** komponen redeem, `README.md` final.
**DoD:** seluruh fitur di `01_FE_SPEC.md` bisa didemokan tanpa error konsol; build produksi sukses.

---

## Format Laporan Akhir Fase

Setiap selesai fase, laporkan:

1. File yang dibuat/diubah.
2. Perilaku yang sudah terbukti (dengan bukti request/response bila ada).
3. Yang belum dikerjakan / butuh keputusan Architect.
4. Status `lint` dan `build`.
