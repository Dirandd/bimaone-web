import type { Brand } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Props: data dan aksi yang diberikan halaman induk.
// - brands: daftar brand yang ditampilkan.
// - onArsipkan dan onPulihkan: dipanggil saat tombolnya diklik. Tabel tidak memanggil
//   API sendiri. Halaman yang memutuskan apa yang terjadi (membuka dialog, memanggil API).
// - idSedangDiproses: id brand yang sedang diarsipkan atau dipulihkan, supaya tombol
//   di baris itu nonaktif dan tidak terklik dua kali. Null kalau tidak ada yang diproses.
// Komponen ini ikut berjalan di peramban karena diimpor oleh halaman yang memakai
// "use client", jadi tidak perlu menulisnya lagi di sini.
type BrandTableProps = {
  brands: Brand[]
  onArsipkan: (brand: Brand) => void
  onPulihkan: (brand: Brand) => void
  idSedangDiproses: number | null
}

export function BrandTable({
  brands,
  onArsipkan,
  onPulihkan,
  idSedangDiproses,
}: BrandTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Deskripsi</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {brands.map((brand) => {
          // Baris ini sedang diproses kalau id-nya sama dengan idSedangDiproses.
          const sedangDiproses = idSedangDiproses === brand.id

          return (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">{brand.name}</TableCell>
              <TableCell>{brand.description ?? "-"}</TableCell>
              <TableCell>
                <Badge variant={brand.archived_at === null ? "default" : "secondary"}>
                  {brand.archived_at === null ? "Aktif" : "Arsip"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {/* Belum berfungsi. Halaman ubah dibuat di Pull Request lain,
                      setelah endpoint detail dari API tersedia. */}
                  <Button variant="outline" size="sm">
                    Ubah
                  </Button>

                  {/* Aktif: tombol Arsipkan. Arsip: tombol Pulihkan. */}
                  {brand.archived_at === null ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={sedangDiproses}
                      onClick={() => onArsipkan(brand)}
                    >
                      Arsipkan
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={sedangDiproses}
                      onClick={() => onPulihkan(brand)}
                    >
                      {sedangDiproses ? "Memulihkan..." : "Pulihkan"}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}