"use client"

// Halaman tambah gudang. Komponen klien karena memakai useRouter dan toast.

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { WarehouseForm } from "@/components/warehouses/warehouse-form"
import { tambahGudang, type DataGudang } from "@/lib/api/warehouses"

export default function HalamanTambahGudang() {
  // useRouter dipakai untuk berpindah halaman lewat kode.
  const router = useRouter()

  // Fungsi yang diberikan ke form. Kalau tambahGudang gagal, galatnya dilempar
  // ke form (tidak ditangkap di sini) supaya form yang menampilkan pesannya.
  async function simpan(data: DataGudang) {
    await tambahGudang(data)

    // Hanya sampai sini kalau berhasil: tampilkan notifikasi lalu kembali ke daftar.
    toast.success("Gudang berhasil ditambahkan")
    router.push("/warehouses")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Gudang</h1>
      <WarehouseForm teksTombol="Simpan" onKirim={simpan} />
    </div>
  )
}