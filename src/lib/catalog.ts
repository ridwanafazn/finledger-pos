export type ProductCategory =
  | "Sembako"
  | "Minuman"
  | "Makanan"
  | "Snack"
  | "Perawatan";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  badge?: string;
}

/**
 * Static demo catalog. The backend has no product endpoint, so the kiosk
 * uses a local shelf. Prices are in IDR.
 */
export const PRODUCTS: Product[] = [
  {
    id: "beras-pandan-5kg",
    name: "Beras Pandan Wangi 5 kg",
    category: "Sembako",
    price: 72_000,
    unit: "5 kg",
    badge: "Hemat",
  },
  {
    id: "minyak-goreng-2l",
    name: "Minyak Goreng Sawit 2 L",
    category: "Sembako",
    price: 38_500,
    unit: "2 L",
  },
  {
    id: "telur-ayam-1kg",
    name: "Telur Ayam Negeri 1 kg",
    category: "Sembako",
    price: 28_000,
    unit: "1 kg",
  },
  {
    id: "indomie-goreng-5",
    name: "Indomie Goreng 5 bungkus",
    category: "Makanan",
    price: 15_000,
    unit: "5 pcs",
    badge: "Favorit",
  },
  {
    id: "susu-ultra-1l",
    name: "Susu UHT Full Cream 1 L",
    category: "Minuman",
    price: 19_800,
    unit: "1 L",
  },
  {
    id: "teh-botol-6",
    name: "Teh Botol Sosro 6 botol",
    category: "Minuman",
    price: 24_000,
    unit: "6 pcs",
  },
  {
    id: "kopi-kapal-api",
    name: "Kopi Kapal Api 165 g",
    category: "Minuman",
    price: 21_000,
    unit: "165 g",
  },
  {
    id: "chitato-68g",
    name: "Chitato Sapi Panggang 68 g",
    category: "Snack",
    price: 12_500,
    unit: "68 g",
  },
  {
    id: "sabun-lifebuoy-4",
    name: "Sabun Lifebuoy 4 x 75 g",
    category: "Perawatan",
    price: 18_500,
    unit: "4 pcs",
  },
  {
    id: "pepsodent-190g",
    name: "Pepsodent Herbal 190 g",
    category: "Perawatan",
    price: 14_500,
    unit: "190 g",
  },
];

export const CATEGORIES: Array<ProductCategory | "Semua"> = [
  "Semua",
  "Sembako",
  "Minuman",
  "Makanan",
  "Snack",
  "Perawatan",
];
