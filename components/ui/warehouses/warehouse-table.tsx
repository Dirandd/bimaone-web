import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Warehouse } from "@/lib/types";

type WarehouseTableProps = {
  warehouses: Warehouse[];
};

// Komponen ini hanya menampilkan data yang diberikan lewat props.
// Dari mana datanya (dummy atau API) tidak ia ketahui, jadi hari Selasa
// berkas ini hampir tidak perlu diubah.
export function WarehouseTable({ warehouses }: WarehouseTableProps) {
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
            const diarsipkan = gudang.archived_at !== null;

            return (
              <TableRow key={gudang.id}>
                <TableCell className="font-mono">{gudang.code}</TableCell>
                <TableCell className="font-medium">{gudang.name}</TableCell>
                <TableCell>{gudang.address ?? "-"}</TableCell>
                <TableCell>{gudang.pic_name ?? "-"}</TableCell>
                <TableCell>{gudang.phone ?? "-"}</TableCell>
                <TableCell>
                  {diarsipkan ? (
                    <Badge variant="secondary">Arsip</Badge>
                  ) : (
                    <Badge>Aktif</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {/* Tombol belum berfungsi, diisi hari Kamis */}
                  <div className="flex justify-end gap-2">
                    {diarsipkan ? (
                      <Button variant="outline" size="sm">
                        Pulihkan
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm">
                          Ubah
                        </Button>
                        <Button variant="destructive" size="sm">
                          Arsipkan
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}