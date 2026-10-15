"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WarehouseTable } from "@/components/ui/warehouses/warehouse-table";
import { ambilDaftarGudang } from "@/lib/api/warehouses";
import type { Warehouse } from "@/lib/types";

// Halaman ini jadi client component karena mengambil data di peramban
// (memakai useState dan useEffect), bukan di server Next.js.
export default function WarehousesPage() {
  const [gudang, setGudang] = useState<Warehouse[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  // Bertambah 1 setiap "Coba lagi" ditekan, supaya useEffect jalan ulang
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    // Penanda agar hasil lama dibuang kalau halaman sudah ditutup
    // atau efek ini sudah dijalankan ulang
    let dibatalkan = false;

    // Tanpa parameter: server memakai bawaan (status aktif, halaman 1, 10 data)
    ambilDaftarGudang()
      .then((respons) => {
        if (!dibatalkan) setGudang(respons.data);
      })
      .catch((error: unknown) => {
        if (!dibatalkan) {
          setGalat(
            error instanceof Error
              ? error.message
              : "Terjadi kesalahan yang tidak diketahui."
          );
        }
      })
      .finally(() => {
        if (!dibatalkan) setMemuat(false);
      });

    return () => {
      dibatalkan = true;
    };
  }, [percobaan]);

  function cobaLagi() {
    setGalat(null);
    setMemuat(true);
    setPercobaan((n) => n + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gudang</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data master gudang BIMAONE.
          </p>
        </div>

        <Link href="/warehouses/new" className={buttonVariants()}>
          <Plus />
          Tambah Gudang
        </Link>
      </div>

      {/* Kondisi 1: sedang memuat */}
      {memuat && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {/* Kondisi 2: galat, tampilkan pesan dan tombol Coba lagi */}
      {!memuat && galat && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{galat}</p>
          <Button variant="outline" size="sm" onClick={cobaLagi}>
            Coba lagi
          </Button>
        </div>
      )}

      {/* Kondisi 3: berhasil */}
      {!memuat && !galat && <WarehouseTable warehouses={gudang} />}
    </div>
  );
}