import type { Warehouse } from "@/lib/types";

// DATA SEMENTARA untuk latihan Senin. Berkas ini dihapus hari Selasa,
// diganti data asli dari GET /api/v1/warehouses.
// Urutan mengikuti bawaan API: nama A sampai Z.
export const dummyWarehouses: Warehouse[] = [
  {
    id: 1,
    code: "GDG-BDG-01",
    name: "Gudang Badung",
    address: "Jl. Raya Kuta No. 88, Badung",
    pic_name: "Putu Arya",
    phone: "+62 361 765 432",
    archived_at: null,
    created_at: "2026-10-12T02:15:00Z",
    updated_at: "2026-10-12T02:15:00Z",
  },
  {
    id: 2,
    code: "GDG-GYR-01",
    name: "Gudang Gianyar",
    address: null, // contoh kolom opsional yang kosong
    pic_name: null,
    phone: null,
    archived_at: null,
    created_at: "2026-10-12T02:20:00Z",
    updated_at: "2026-10-12T02:20:00Z",
  },
  {
    id: 3,
    code: "GDG-DPS-02",
    name: "Gudang Sanur",
    address: "Jl. By Pass Ngurah Rai Km 5, Sanur",
    pic_name: "Ni Luh Ayu",
    phone: "0812-3456-7890",
    archived_at: null,
    created_at: "2026-10-12T02:30:00Z",
    updated_at: "2026-10-12T02:30:00Z",
  },
  {
    id: 4,
    code: "GDG-TBN-01",
    name: "Gudang Tabanan",
    address: "Jl. Gajah Mada No. 21, Tabanan",
    pic_name: "Kadek Dwi",
    phone: "+62 361 987 654",
    archived_at: "2026-10-13T08:00:00Z", // contoh gudang yang sudah diarsipkan
    created_at: "2026-10-12T02:40:00Z",
    updated_at: "2026-10-13T08:00:00Z",
  },
  {
    id: 5,
    code: "GDG-DPS-01",
    name: "Gudang Utama Denpasar",
    address: "Jl. Raya Sesetan No. 12, Denpasar",
    pic_name: "Made Wirawan",
    phone: "+62 361 123 456",
    archived_at: null,
    created_at: "2026-10-12T02:10:00Z",
    updated_at: "2026-10-12T02:10:00Z",
  },
];