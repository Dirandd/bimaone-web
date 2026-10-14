// Bentuk data Gudang dari API. Nama field snake_case, sama dengan kontrak API.
// Tanggal berupa teks ISO 8601 UTC. Kolom opsional bernilai null kalau kosong.
export type Warehouse = {
  id: number;
  code: string;
  name: string;
  address: string | null;
  pic_name: string | null;
  phone: string | null;
  archived_at: string | null; // null = aktif, terisi = diarsipkan
  created_at: string;
  updated_at: string;
};