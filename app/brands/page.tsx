// Impor komponen tombol dari shadcn/ui. Dipakai untuk tombol "Tambah Brand".
import { Button } from "@/components/ui/button"

// Impor komponen tabel yang sudah dipisah. Halaman ini tidak lagi menulis
// tabelnya sendiri, hanya memberi data lewat props.
import { BrandTable } from "@/components/ui/brands/brand-table"

// Data tiruan sementara. Nanti diganti data asli dari API lewat lib/api/brands.ts.
import { dataTiruan } from "@/lib/dummy-brands"

// "export default" wajib untuk page.tsx: Next.js mencari satu komponen bawaan
// di berkas ini dan menampilkannya di alamat /brands.
// Berkas ini belum memakai "use client" karena belum ada state, hook, atau
// aksi klik. Komponen server cukup untuk sekarang.
export default function HalamanDaftarBrand() {
  return (
    // space-y-6 memberi jarak vertikal antar anak langsung di dalamnya.
    <div className="space-y-6">
      {/* Judul halaman di kiri dan tombol tambah di kanan */}
      {/* flex menjajarkan ke samping, justify-between mendorong keduanya ke ujung */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand</h1>

        {/* Tombol belum berfungsi. Halaman /brands/new dibuat di Pull Request lain,
            dan tombol ini nanti menjadi tautan ke sana. */}
        <Button>Tambah Brand</Button>
      </div>

      {/* Tabel daftar brand. "brands" adalah props: data yang dikirim dari halaman
          ke komponen BrandTable supaya tabel hanya menampilkan, tidak mengambil data. */}
      <BrandTable brands={dataTiruan} />
    </div>
  )
}