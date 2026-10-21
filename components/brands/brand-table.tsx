import Link from "next/link"
import type { Brand } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Props: data dan aksi yang diberikan halaman induk.
// - brands: daftar brand yang ditampilkan.
// - onArsipkan dan onPulihkan: dipanggil saat tombolnya diklik. Tabel tidak memanggil
//   API sendiri. Halaman yang memutuskan apa yang terjadi (membuka dialog, memanggil API).
// - idSedangDiproses: id brand yang sedang diarsipkan atau dipulihkan, supaya tombol
//   di baris itu nonaktif dan tidak terklik dua kali. Null kalau tidak ada yang diproses.
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
    // Bingkai bulat di sekeliling tabel, sama dengan tabel Gudang.
    <div className="rounded-lg border">
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
                    {/* Brand aktif: tombol Ubah dan Arsipkan. Brand diarsipkan: hanya
                        Pulihkan, karena data arsip tidak boleh diubah sebelum dipulihkan.
                        Ubah berupa tautan. Button shadcn di proyek ini tidak punya
                        asChild, jadi tautan dibuat tampak seperti tombol lewat
                        buttonVariants, dibungkus cn supaya bingkainya tampil. */}
                    {brand.archived_at === null ? (
                      <>
                        <Link
                          href={`/brands/${brand.id}/edit`}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                        >
                          Ubah
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={sedangDiproses}
                          onClick={() => onArsipkan(brand)}
                        >
                          Arsipkan
                        </Button>
                      </>
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
    </div>
  )
}