import type { Brand } from "@/lib/types"
// impor Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type BrandTableProps = {
  brands: Brand[]
}

export function BrandTable({ brands }: BrandTableProps) {
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
        {brands.map((brand) => (
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
  )
}