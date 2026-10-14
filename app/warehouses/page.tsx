import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { WarehouseTable } from "@/components/ui/warehouses/warehouse-table";
import { dummyWarehouses } from "@/lib/dummy-warehouses";

export default function WarehousesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gudang</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data master gudang BIMAONE.
          </p>
        </div>

        {/* Button shadcn di proyek ini tidak punya asChild, jadi tautan
            ditampilkan seperti tombol lewat buttonVariants */}
        <Link href="/warehouses/new" className={buttonVariants()}>
          <Plus />
          Tambah Gudang
        </Link>
      </div>

      <WarehouseTable warehouses={dummyWarehouses} />
    </div>
  );
}