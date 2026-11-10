# 01. Frontend Specification — zLedger

> Dokumen ini adalah **single source of truth** untuk UI/UX dan integrasi API.
> Jika ada konflik dengan `README.md` atau instruksi lain, dokumen ini yang menang.
> Jangan menambah endpoint, field response, atau fitur di luar dokumen ini.

---

## 1. Konteks & Tujuan

Web kiosk **zLedger** di atas **FinLedger Engine** (backend double-entry ledger berkonkurensi tinggi).
Tujuan utama: **demonstrasi ke tech recruiter** bahwa backend sanggup menangani idempotency,
multi-tender, dan konkurensi — lewat UI retail yang terasa seperti aplikasi Alfagift.

Bukan internal tool. Standar acuan visual: **Alfagift** untuk alur belanja, **Stripe/Vercel**
untuk kerapian komponen.

---

## 2. Prinsip Desain

1. **Premium, bukan "admin template".** Banyak whitespace, hierarki jelas, tanpa border berlebihan.
2. **Mobile-first.** Layout disusun dari 375px ke atas, bukan hasil mengecilkan desktop.
3. **Selalu light mode.** Tidak ada panel gelap, gradient, emoji, atau simbol dekoratif seperti `&`, `%`, `#`, `:` di dalam copy. Gunakan kata: "dan", "persen".
4. **Minimal noise.** Tanpa badge dekoratif yang tidak informatif.
5. **Jujur pada data.** Jangan mengklaim sesuatu (mis. "cached response") yang tidak dikirim backend.
6. **State lengkap.** Setiap data punya 4 kondisi: `loading` (skeleton), `empty`, `error`, `success`.

---

## 3. Tipografi

- Font tunggal: **Plus Jakarta Sans**, dimuat via `next/font/google` (`display: swap`, `subsets: ["latin"]`).
- Weight yang dipakai: `400`, `500`, `600`, `700`, `800`. Tidak ada font lain.
- Diekspos sebagai CSS variable `--font-sans` dan dipasang di `<html>`.
- Semua angka uang memakai `font-variant-numeric: tabular-nums` agar kolom ledger rata.
- Label nominal selalu menyertakan mata uang (`Rp`, `A-Poin`), bukan angka telanjang.

| Token | Size / Line-height | Weight | Pemakaian |
|---|---|---|---|
| `display` | 32 / 40 | 800 | Angka saldo utama |
| `h1` | 24 / 32 | 700 | Judul halaman |
| `h2` | 18 / 26 | 600 | Judul section / card |
| `body` | 14 / 22 | 400–500 | Teks umum |
| `label` | 13 / 18 | 500 | Label form, tabel header |
| `caption` | 12 / 16 | 500 | Metadata, timestamp |
| `mono` | 13 / 20 | 500 | ID transaksi, kode error (pakai `ui-monospace`) |

---

## 4. Warna & Token

| Token | Nilai | Pemakaian |
|---|---|---|
| `brand-500` | `#E31E24` | Aksen utama kiosk (tombol, harga, active tab) |
| `brand-600` | `#C8181E` | Hover / pressed |
| `brand-50` | `#FEF2F2` | Background lembut, highlight |
| `surface` | `#FFFFFF` | Card kiosk |
| `surface-muted` | `#F7F7F8` | Background halaman |
| `border` | `#E7E7EA` | Garis tipis, pemisah |
| `ink-900` | `#0A0A0B` | Teks utama |
| `ink-500` | `#71717A` | Teks sekunder |
| `audit-bg` | `#09090B` | Panel audit (dark) |
| `audit-surface` | `#111113` | Card/row panel audit |
| `audit-border` | `rgba(255,255,255,0.07)` | Garis panel audit |
| `credit` | `#10B981` | Mutasi kredit (emas) |
| `debit` | `#F43F5E` | Mutasi debit (merah) |
| `warning` | `#F59E0B` | Peringatan kuota / validasi lunak |

Aturan:
- Panel kiosk **selalu terang**; panel audit **selalu gelap**. Tidak ada theme toggle.
- Warna `credit`/`debit` hanya untuk angka & indikator mutasi, tidak untuk tombol.
- Kontras teks minimum WCAG AA (4.5:1).

---

## 5. Bentuk, Elevasi, Glassmorphism

- Radius: `rounded-2xl` untuk card & panel, `rounded-xl` untuk input/tombol, `rounded-full` untuk chip.
- Shadow: `shadow-sm` / `shadow-xs` saja. Hindari shadow besar dan gelap.
- Border: `1px` dengan opacity rendah (`ring-1 ring-black/5` di light, `ring-white/10` di dark).
- Glass: `bg-white/70 backdrop-blur-xl` (kiosk) dan `bg-zinc-950/70 backdrop-blur-xl` (audit),
  hanya untuk elemen sticky (header, bottom tab bar), bukan semua card.
- Ikon: `lucide-react`, ukuran `16 / 18 / 20`, `stroke-width 1.75`.

---

## 6. Responsif

| Breakpoint | Layout |
|---|---|
| `< 640px` | 1 kolom, stack penuh, **bottom tab bar** fixed (`Belanja` / `Akun`), header ringkas |
| `640–1023px` | 1 kolom, konten `max-w-xl` di tengah, bottom tab bar tetap |
| `≥ 1024px` (`lg`) | 1 kolom kiosk `max-w-2xl` di tengah; audit adalah halaman `/ledger` terpisah |
| `≥ 1536px` | Konten tidak melebar lebih dari `max-w-[1600px]` |

Larangan:
- Jangan pernah menampilkan dua kolom yang di-squash di mobile.
- Jangan memakai horizontal scroll pada tabel; di mobile tabel berubah menjadi **list kartu**.
- Bottom tab bar wajib memberi `padding-bottom: env(safe-area-inset-bottom)`.

---

## 7. Motion & Micro-Interaction

Gunakan **Framer Motion** untuk transisi masuk/keluar, **Tailwind transition** untuk hover/focus.

| Interaksi | Perilaku |
|---|---|
| Mount panel/card | `opacity 0→1`, `y 8→0`, durasi `200ms`, `easeOut` |
| Tab switch (mobile) | Cross-fade `150ms`, tanpa slide besar |
| Checkout sukses | Toast sukses + saldo ter-refresh + baris ledger baru **flash** |
| Flash baris kredit | Background `credit/20` → transparan, `1200ms` |
| Flash baris debit | Background `debit/20` → transparan, `1200ms` |
| Tombol submit | Spinner inline, tombol `disabled`, lebar tidak berubah |
| Skeleton | Shimmer halus, tanpa layout shift |

Wajib menghormati `prefers-reduced-motion`: matikan flash & transform, sisakan perubahan warna instan.

---

## 8. Struktur Halaman

Dua area terpisah:

- **Aplikasi belanja** di `/` — panel `belanja` dan `akun`, state di URL (`?panel=`).
- **Audit trail** di `/ledger` — halaman teknis terpisah, **tidak** muncul di bottom nav.

Alur belanja mengikuti aplikasi retail Alfagift: **cari produk → tambah ke keranjang →
checkout multi-tender**. Audit hanya dibuka lewat tautan eksplisit ("Audit trail" di panel
Akun atau "Lihat di ledger" setelah checkout), supaya pengguna non-teknis tidak tersesat.

### 8.1 Panel Belanja (terang, aksen merah)

1. **Header** — brand zLedger, lokasi, avatar akun, dan kolom pencarian produk.
2. **Kartu Dompet** — saldo `IDR` dan `A-Poin` dari `GET /ledger/accounts?ownerId=`.
   Skeleton saat loading; angka `tabular-nums`; tombol "Lihat mutasi" → `/ledger`.
3. **Promo** — banner horizontal (statis, konten demo).
4. **Katalog** — chip kategori + grid produk (katalog statis, harga IDR).
   Tombol `+` menambah ke keranjang.
5. **Keranjang** — bar mengambang berisi jumlah item dan total.
6. **Checkout** — bottom sheet: daftar item, input A-Poin, IDR otomatis, ringkasan,
   lalu `POST /ledger/checkout`.
7. **Stress Test** — tombol `Simulate Bad Network (Fire 5x)` (Fase 4).

### 8.2 Panel Akun (terang)

1. Profil dari `GET /auth/me` (nama, email, role).
2. Ringkasan saldo IDR dan A-Poin.
3. Info konfigurasi: owner ID, merchant ID, URL backend.
4. Tautan **Audit trail** → `/ledger` (ditandai sebagai tampilan teknis).
5. Tombol keluar (hapus sesi → `/login`).

### 8.3 Halaman `/ledger` (terpisah, light)

1. **Header** — tombol kembali ke `/`, judul "Immutable Ledger", indikator live, refresh.
2. **Stat ringkas** — jumlah mutasi, total debit IDR, total kredit IDR, plus total A-Poin di footer.
3. **Daftar Mutasi**
   - Sumber: `GET /ledger/accounts/{accountId}/mutations` untuk akun pelanggan **dan**
     akun merchant, difilter ke transaksi yang sama agar terlihat pasangan debit/kredit.
   - Kolom: waktu, deskripsi, tipe (`DEBIT`/`CREDIT`), nominal.
   - Angka `tabular-nums`, debit merah, kredit emerald.
   - Baris baru dari checkout terakhir diberi flash 1.4 detik.
   - Mobile: list kartu, bukan tabel ter-squash.
4. **Error/empty state** tetap terbaca di light mode.

### 8.4 Halaman `/proof` (terpisah, light)

Halaman bukti teknis dengan empat tab:

1. **Idempotency** — lima request identik dengan satu key, ditambah satu replay
   setelah burst. Menampilkan status tiap request, jumlah transaksi unik, delta saldo,
   dan isi cache Redis lewat `GET /admin/idempotency`.
2. **Concurrency** — dua puluh pemilik menebas voucher berkuota lima secara bersamaan.
   Menampilkan jumlah berhasil, ditolak, dan sisa kuota.
3. **Integrity** — `POST /reconciliation/runs`, menampilkan `BALANCED`,
   jumlah akun, temuan saldo, jurnal tidak seimbang, dan total selisih.
4. **System** — metrik dari `/actuator/prometheus` lewat BFF `GET /api/metrics`:
   checkout, HTTP, connection pool, heap JVM, Kafka, dan selisih rekonsiliasi.

---

## 9. Integrasi API

Base URL: `process.env.NEXT_PUBLIC_API_URL` (fallback `http://localhost:8080/api/v1`).
Semua path di bawah **relatif terhadap base URL**. Sumber: `GET /v3/api-docs` (OpenAPI 3.0.1).

Transport: browser memanggil **same-origin** `/api/backend/*`, lalu route handler
`src/app/api/backend/[...path]/route.ts` meneruskan ke upstream. Ini menghindari CORS
(backend hanya mengizinkan origin tertentu) dan membuat app jalan di port berapa pun.
`NEXT_PUBLIC_API_DIRECT=true` memaksa panggilan langsung ke upstream.

Autentikasi: **JWT Bearer wajib** (`components.securitySchemes.bearerAuth`, global).
Token disimpan di `localStorage` dan dipasang oleh request interceptor.

| Method | Path | Idempotency Key | Fungsi |
|---|---|---|---|
| `POST` | `/auth/login` | header | Tukar username/password → access + refresh token |
| `GET` | `/auth/me` | tidak | Profil user aktif |
| `GET` | `/ledger/accounts` | tidak | Daftar akun (paginated, `page`/`size`/`sort`) |
| `POST` | `/ledger/accounts` | **header** | Buat akun |
| `GET` | `/ledger/accounts/{accountId}/balance` | tidak | Saldo terkini (lightweight) |
| `GET` | `/ledger/accounts/{accountId}/mutations` | tidak | Mutasi per akun (paginated) |
| `POST` | `/ledger/checkout` | **header + body** | Checkout multi-tender |
| `POST` | `/ledger/redeem` | **query + header** | Redeem voucher via ledger |
| `GET` | `/ledger/transactions` | tidak | Daftar transaksi jurnal (paginated) |
| `GET` | `/vouchers` | tidak | Daftar voucher (`activeOnly`, `status`) |
| `POST` | `/vouchers/{voucherId}/redeem` | **header** | Redeem voucher atomik (kuota + poin) |

Catatan kontrak yang **wajib** diikuti:

- `POST /ledger/checkout` membutuhkan `idempotencyKey` **di dalam body** (required) **dan**
  header `X-Idempotency-Key`. Kirim UUID yang sama di keduanya.
- `POST /ledger/redeem` memakai **query param**: `ownerId`, `voucherId`, `points`,
  `idempotencyKey` (opsional). Tetap kirim header `X-Idempotency-Key` dengan nilai sama.
- `POST /vouchers/{voucherId}/redeem` memakai body `{ ownerId }` + header `X-Idempotency-Key`.
- Pagination: `page` (0-based), `size` (maks 100), `sort` (`field,direction`).
  Response: `{ content, page, sort, filters }`.
- `GET /ledger/transactions` mendukung filter `referenceType`, `accountId`, `from`, `to`.

### 9.1 Idempotency

- Setiap `POST`/`PATCH` **wajib** mengirim header `X-Idempotency-Key` berisi UUID v4.
- Generator: `crypto.randomUUID()`.
- Key dibuat **sekali per aksi bisnis**, bukan per request. Untuk stress test 5x, kelima request memakai key yang sama.
- Key yang sudah terpakai tidak boleh dipakai ulang untuk aksi berbeda.

### 9.2 Error Handling (RFC 7807)

- Response error: `Content-Type: application/problem+json` (sesuai deskripsi API).
  Sebagian handler masih mengirim `application/json`, jadi interceptor **menerima keduanya**.
- Bentuk: `{ type, title, status, detail, instance, errorCode }`.
- Interceptor Axios wajib menormalkan error menjadi:
  ```ts
  type ApiProblem = {
    status: number;
    title: string;
    detail?: string;
    errorCode?: string;
    instance?: string;
  };
  ```
- Ditampilkan lewat **Sonner toast** (bukan `alert()`), dengan judul = `title`, deskripsi = `detail`,
  dan `errorCode` ditampilkan kecil/mono bila ada.
- Pemetaan pesan manusiawi per `errorCode` disimpan di `src/lib/error-copy.ts`.
  **Jangan mengarang kode**; tambahkan entri hanya setelah kode tersebut benar-benar muncul dari backend.
- Fallback bila body bukan problem+json: `title` = "Terjadi kesalahan", `detail` = pesan jaringan/status.
- `401` (selain dari `/auth/login`) → hapus sesi dan arahkan ke `/login`.
- Setiap response membawa `X-Request-ID`; boleh ditampilkan di detail error untuk penelusuran.

### 9.3 Kontrak Data

- Nama field mengikuti response backend apa adanya. **Jangan menebak.**
- Tipe didefinisikan di `src/types/api.ts`, diverifikasi lewat Swagger dan tab Network.
- Bila field opsional tidak ada, UI harus tetap aman (opsional chaining + fallback `—`).

Tipe inti yang sudah terverifikasi:

| Schema | Field |
|---|---|
| `AccountResponse` | `id, ownerId, accountName, accountType, currency, balance, openingBalance, status, version, createdAt, updatedAt` |
| `BalanceResponse` | `accountId, ownerId, currency, balance, status, asOf` |
| `MutationResponse` | `id, transactionId, accountId, entryType, amount, description, createdAt` |
| `TransactionSummaryResponse` | `id, idempotencyKey, referenceType, description, createdAt, entryCount, totalAmount` |
| `CheckoutRequest` | `ownerId, merchantId, totalAmount, tenders[], idempotencyKey, currency` |
| `TenderDetail` | `currency, amount, description` |
| `CheckoutResponse` | `transactionId, ownerId, merchantId, currency, totalAmount, balanceRemaining, processedAt, status` |
| `VoucherResponse` | `id, code, name, description, pointsCost, totalQuota, remainingQuota, startsAt, endsAt, status, version` |
| `VoucherRedemptionResponse` | `voucherId, voucherCode, ownerId, transactionId, pointsSpent, remainingQuota, redeemedAt, status` |
| `AuthLoginResponse` | `accessToken, tokenType, expiresInSeconds, refreshToken, username, roles[]` |

Enum: `currency` = `IDR | A_POIN`; `entryType` = `DEBIT | CREDIT`;
`referenceType` = `PAYMENT | REDEMPTION | REFUND | REWARD | SETTLEMENT`;
`accountType` = `ASSET | LIABILITY | REVENUE | EXPENSE`;
`status` akun = `ACTIVE | SUSPENDED | CLOSED`.

---

## 10. Spesifikasi Fitur Kunci

### 10.1 Wallet Balances
- Fetch awal saat mount, refetch setelah checkout/redeem sukses.
- Skeleton kartu saat loading; jangan menampilkan `0` palsu sebelum data datang.
- Sumber: `GET /ledger/accounts?ownerId={NEXT_PUBLIC_OWNER_ID}`.

### 10.2 Multi-Tender Checkout
- Keranjang berisi produk statis; total dihitung dari harga × qty.
- Input A-Poin dibatasi `min(total, saldo poin)`; IDR dihitung otomatis `total - poin`.
- Payload: `ownerId`, `merchantId`, `totalAmount`, `currency`, `tenders[]`, `idempotencyKey`.
- `currency` = mata uang tender terbesar; header `X-Idempotency-Key` = `idempotencyKey` body.
- Setelah sukses: toast sukses, kosongkan keranjang, refresh saldo, refresh audit, flash baris baru.
- Setelah gagal: sheet tetap terbuka, pesan error inline, key baru dibuat untuk percobaan berikutnya.

> Catatan backend: `processMultiTenderPayment` mendebit **satu** akun sesuai `currency`
> sebesar `totalAmount`; nilai `tenders[]` belum memecah saldo antar akun. UI tetap
> mengirim split sesuai kontrak dan menampilkan catatan kecil di sheet.

### 10.3 Stress Test "Simulate Bad Network (Fire 5x)"
- Satu key dibuat sekali; 5 request `POST /ledger/checkout` identik dikirim via `Promise.allSettled`.
- Panel hasil menampilkan per request: index, status, durasi, dan `errorCode` bila gagal.
- Verifikasi akhir: saldo hanya berubah **sekali** dan audit tidak menampilkan duplikat.
- Jangan menulis klaim "response di-cache" kecuali backend memang mengirim penanda replay.

### 10.4 Ledger Audit
- Dark theme, angka mono/tabular.
- Sumber: mutasi akun pelanggan + akun merchant, difilter ke transaksi yang sama.
- Auto-refresh: refetch setelah aksi sukses + tombol refresh manual.
- Baris baru di-flash sesuai tipe (kredit emerald, debit merah).

### 10.5 Redeem
- Tombol dengan konfirmasi ringan (dialog), loading state, dan hasil sukses/gagal yang jelas.
- Alur utama: `GET /vouchers?activeOnly=true` → pilih voucher → `POST /vouchers/{voucherId}/redeem`
  dengan body `{ ownerId }` dan header `X-Idempotency-Key`.
- Alternatif ledger: `POST /ledger/redeem?ownerId=&voucherId=&points=&idempotencyKey=`.
- Tampilkan `remainingQuota` setelah redeem agar efek kuota terlihat.

---

## 11. Kualitas & Definition of Done

- `npm run build` dan `npm run lint` bersih (tanpa `any` yang tidak perlu, tanpa warning hydration).
- Tidak ada emoji di UI, tidak ada `alert()`, tidak ada `console.log` di kode produksi.
- Semua angka uang terformat (`Intl.NumberFormat("id-ID")`).
- Semua tombol punya state `disabled` + spinner saat proses.
- Fokus keyboard terlihat; semua kontrol punya label/`aria-label`.
- Layout diuji pada 375px, 768px, 1024px, 1440px tanpa horizontal scroll.
- `prefers-reduced-motion` dihormati.

---

## 12. Di Luar Scope

- Payment gateway nyata, kartu kredit, atau integrasi pihak ketiga.
- Multi-role / RBAC (role hanya ditampilkan, tidak dipakai untuk gating UI).
- Theme toggle (panel audit memang selalu gelap).
- i18n multi-bahasa (copy UI: Bahasa Indonesia).
- Modul di luar kiosk & audit: settlement, reconciliation, payment proof, user management.
  Endpoint tersebut ada di backend tetapi tidak dipakai di dashboard ini.
