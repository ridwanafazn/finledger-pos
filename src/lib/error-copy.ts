import type { ApiProblem } from "@/types/api";

type Copy = { title: string; description?: string };

/**
 * Human-readable copy per backend `errorCode`.
 * Only add entries for codes that have actually been observed from the API.
 */
const ERROR_COPY: Record<string, Copy> = {};

const STATUS_COPY: Record<number, Copy> = {
  400: {
    title: "Permintaan tidak valid",
    description: "Periksa kembali data yang dikirim.",
  },
  401: {
    title: "Sesi tidak valid",
    description: "Silakan masuk kembali untuk melanjutkan.",
  },
  403: {
    title: "Akses ditolak",
    description: "Akun ini tidak memiliki izin untuk aksi tersebut.",
  },
  404: {
    title: "Data tidak ditemukan",
    description: "Sumber daya yang diminta tidak tersedia.",
  },
  409: {
    title: "Konflik data",
    description: "Permintaan bertabrakan dengan data yang sudah ada.",
  },
  422: {
    title: "Data tidak dapat diproses",
    description: "Periksa kembali nilai yang dimasukkan.",
  },
  429: {
    title: "Terlalu banyak permintaan",
    description: "Tunggu sebentar sebelum mencoba lagi.",
  },
  500: {
    title: "Kesalahan pada server",
    description: "Backend gagal memproses permintaan.",
  },
  502: {
    title: "Backend tidak tersedia",
    description: "Gagal menghubungi FinLedger Engine.",
  },
  503: {
    title: "Layanan sedang sibuk",
    description: "Coba lagi dalam beberapa saat.",
  },
  504: {
    title: "Backend tidak merespons",
    description: "Permintaan melewati batas waktu.",
  },
};

export function defaultTitle(status: number): string {
  return STATUS_COPY[status]?.title ?? "Terjadi kesalahan";
}

export function humanizeProblem(problem: ApiProblem): Copy {
  const mapped = problem.errorCode ? ERROR_COPY[problem.errorCode] : undefined;
  if (mapped) {
    return {
      title: mapped.title,
      description: mapped.description ?? problem.detail,
    };
  }

  const byStatus = STATUS_COPY[problem.status];
  return {
    title: problem.title || byStatus?.title || "Terjadi kesalahan",
    description: problem.detail ?? byStatus?.description,
  };
}
