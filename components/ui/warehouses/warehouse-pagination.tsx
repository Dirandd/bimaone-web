import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

// Props: data dan aksi yang diberikan halaman induk.
// - halaman: nomor halaman yang sedang tampil (mulai dari 1).
// - totalHalaman: jumlah seluruh halaman, dari meta.total_pages di jawaban API.
// - onUbahHalaman: dipanggil dengan nomor halaman tujuan. Komponen ini tidak mengubah
//   alamat sendiri, halaman induk yang memutuskan apa yang terjadi.
// Komponen ini ikut berjalan di peramban karena diimpor oleh halaman yang memakai
// "use client", jadi tidak perlu menulisnya lagi di sini.
type WarehousePaginationProps = {
  halaman: number
  totalHalaman: number
  onUbahHalaman: (halaman: number) => void
}

export function WarehousePagination({
  halaman,
  totalHalaman,
  onUbahHalaman,
}: WarehousePaginationProps) {
  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-end gap-3"
    >
      <span className="text-sm text-muted-foreground">
        Halaman {halaman} dari {totalHalaman}
      </span>

      {/* Di halaman pertama tidak ada yang "sebelumnya", di halaman terakhir
          tidak ada yang "berikutnya", jadi tombolnya dinonaktifkan. */}
      <Button
        variant="outline"
        size="sm"
        disabled={halaman <= 1}
        onClick={() => onUbahHalaman(halaman - 1)}
      >
        <ChevronLeft />
        Sebelumnya
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={halaman >= totalHalaman}
        onClick={() => onUbahHalaman(halaman + 1)}
      >
        Berikutnya
        <ChevronRight />
      </Button>
    </nav>
  )
}