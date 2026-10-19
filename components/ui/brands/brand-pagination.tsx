// Navigasi halaman di bawah tabel: keterangan halaman, tombol Sebelumnya, dan
// tombol Berikutnya. Komponen ini hanya melaporkan halaman yang dipilih lewat props.
// Alamat diubah oleh halaman, bukan di sini. Tidak perlu "use client" sendiri karena
// diimpor oleh halaman yang sudah berjalan di peramban.

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

// Props:
// - halaman: nomor halaman yang sedang tampil (mulai dari 1).
// - totalHalaman: jumlah seluruh halaman, dari meta API.
// - onUbahHalaman: dipanggil dengan nomor halaman tujuan.
type BrandPaginationProps = {
  halaman: number
  totalHalaman: number
  onUbahHalaman: (halaman: number) => void
}

export function BrandPagination({
  halaman,
  totalHalaman,
  onUbahHalaman,
}: BrandPaginationProps) {
  return (
    // nav dengan aria-label memberi tahu pembaca layar bahwa ini navigasi halaman.
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-end gap-3"
    >
      {/* Keterangan halaman di kiri, berwarna redup seperti di Gudang. */}
      <span className="text-sm text-muted-foreground">
        Halaman {halaman} dari {totalHalaman}
      </span>

      {/* Di halaman pertama tombol Sebelumnya nonaktif, di halaman terakhir
          tombol Berikutnya nonaktif. */}
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