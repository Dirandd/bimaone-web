import { Button } from "@/components/ui/button"

// Nilai status yang dikenal API: GET /api/v1/warehouses?status=...
export type StatusDaftar = "active" | "archived" | "all"

// Urutan dan tulisan tombol. Menambah pilihan cukup menambah satu baris di sini.
const PILIHAN_STATUS: { nilai: StatusDaftar; label: string }[] = [
  { nilai: "active", label: "Aktif" },
  { nilai: "archived", label: "Arsip" },
  { nilai: "all", label: "Semua" },
]

// Props: data dan aksi yang diberikan halaman induk.
// - status: pilihan yang sedang aktif. Tombolnya tampil terisi.
// - onUbahStatus: dipanggil saat tombol lain diklik. Toolbar tidak mengubah alamat
//   sendiri, halaman yang memutuskan apa yang terjadi.
// Toolbar ini dibuat terpisah supaya kotak cari bisa ditambahkan di sini nanti.
type WarehouseToolbarProps = {
  status: StatusDaftar
  onUbahStatus: (status: StatusDaftar) => void
}

export function WarehouseToolbar({ status, onUbahStatus }: WarehouseToolbarProps) {
  return (
    <div role="group" aria-label="Filter status gudang" className="flex gap-2">
      {PILIHAN_STATUS.map((pilihan) => {
        const terpilih = status === pilihan.nilai

        return (
          <Button
            key={pilihan.nilai}
            type="button"
            size="sm"
            // Pilihan aktif tampil terisi, yang lain hanya berbingkai.
            variant={terpilih ? "default" : "outline"}
            // Memberi tahu pembaca layar mana tombol yang sedang dipilih.
            aria-pressed={terpilih}
            onClick={() => onUbahStatus(pilihan.nilai)}
          >
            {pilihan.label}
          </Button>
        )
      })}
    </div>
  )
}