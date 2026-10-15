import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { dataTiruan } from "@/lib/dummy-brands"

export default function HalamanDaftarBrand() {
  return (
    <div className="space-y-6">
      {/* Judul dan tombol tambah */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand</h1>

        <Button>
          Tambah Brand
        </Button>
      </div>

      {/* Tabel daftar brand */}
      <div className="rounded-md border">
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
            {dataTiruan.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">
                  {brand.name}
                </TableCell>

                <TableCell>
                  {brand.description ?? "-"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      brand.archived_at === null
                        ? "default"
                        : "secondary"
                    }
                  >
                    {brand.archived_at === null ? "Aktif" : "Arsip"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                      Ubah
                    </Button>

                    {brand.archived_at === null ? (
                      <Button variant="destructive" size="sm">
                        Arsipkan
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm">
                        Pulihkan
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
