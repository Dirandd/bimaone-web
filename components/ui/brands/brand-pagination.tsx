// Navigasi halaman di bawah tabel: tombol Sebelumnya, keterangan halaman, dan
// tombol Berikutnya. Komponen ini hanya melaporkan halaman yang dipilih lewat props.
// Alamat diubah oleh halaman, bukan di sini. Tidak perlu "use client" sendiri karena
// diimpor oleh halaman yang sudah berjalan di peramban.

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
      {/* Di halaman pertama tombol Sebelumnya nonaktif, di halaman terakhir
          tombol Berikutnya nonaktif. */}
      <Button
        variant="outline"
        size="sm"
        disabled={halaman <= 1}
        onClick={() => onUbahHalaman(halaman - 1)}
      >
        Sebelumnya
      </Button>

      <span className="text-sm">
        Halaman {halaman} dari {totalHalaman}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={halaman >= totalHalaman}
        onClick={() => onUbahHalaman(halaman + 1)}
      >
        Berikutnya
      </Button>
    </nav>
  )
}