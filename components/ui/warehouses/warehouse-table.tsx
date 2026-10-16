import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Warehouse } from "@/lib/types"

// Props: data dan aksi yang diberikan halaman induk.
// - warehouses: daftar gudang yang ditampilkan.
// - onArsipkan: dipanggil saat tombol Arsipkan diklik. Tabel tidak memanggil API
//   sendiri. Halaman yang memutuskan apa yang terjadi (membuka dialog, memanggil API).
// - idSedangDiproses: id gudang yang sedang diarsipkan, supaya tombol di baris itu
//   nonaktif dan tidak terklik dua kali. Null kalau tidak ada yang diproses.
// Komponen ini ikut berjalan di peramban karena diimpor oleh halaman yang memakai
// "use client", jadi tidak perlu menulisnya lagi di sini.
type WarehouseTableProps = {
  warehouses: Warehouse[]
  onArsipkan: (gudang: Warehouse) => void
  idSedangDiproses: number | null
}

export function WarehouseTable({
  warehouses,
  onArsipkan,
  idSedangDiproses,
}: WarehouseTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead>PIC</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {warehouses.map((gudang) => {
            // archived_at terisi berarti gudang sudah diarsipkan
            const diarsipkan = gudang.archived_at !== null
            // Baris ini sedang diproses kalau id-nya sama dengan idSedangDiproses.
            const sedangDiproses = idSedangDiproses === gudang.id

            return (
              <TableRow key={gudang.id}>
                <TableCell className="font-mono">{gudang.code}</TableCell>
                <TableCell className="font-medium">{gudang.name}</TableCell>
                <TableCell>{gudang.address ?? "-"}</TableCell>
                <TableCell>{gudang.pic_name ?? "-"}</TableCell>
                <TableCell>{gudang.phone ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={diarsipkan ? "secondary" : "default"}>
                    {diarsipkan ? "Arsip" : "Aktif"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {/* Aktif: tombol Ubah dan Arsipkan. Arsip: tombol Pulihkan. */}
                    {diarsipkan ? (
                      // Belum berfungsi. Pulihkan dibuat di langkah berikutnya.
                      <Button variant="outline" size="sm">
                        Pulihkan
                      </Button>
                    ) : (
                      <>
                        {/* Belum berfungsi. Halaman ubah dibuat di Pull Request lain. */}
                        <Button variant="outline" size="sm">
                          Ubah
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={sedangDiproses}
                          onClick={() => onArsipkan(gudang)}
                        >
                          Arsipkan
                        </Button>
                      </>
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