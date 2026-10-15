"use client"

// Halaman tambah brand. Komponen klien karena memakai useRouter dan toast.

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { BrandForm } from "@/components/ui/brands/brand-form"
import { tambahBrand, type DataBrand } from "@/lib/api/brands"

export default function HalamanTambahBrand() {
  // useRouter dipakai untuk berpindah halaman lewat kode.
  const router = useRouter()

  // Fungsi yang diberikan ke form. Kalau tambahBrand gagal, galatnya dilempar
  // ke form (tidak ditangkap di sini) supaya form yang menampilkan pesannya.
  async function simpan(data: DataBrand) {
    await tambahBrand(data)

    // Hanya sampai sini kalau berhasil: tampilkan notifikasi lalu kembali ke daftar.
    toast.success("Brand berhasil ditambahkan")
    router.push("/brands")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tambah Brand</h1>
      <BrandForm teksTombol="Simpan" onKirim={simpan} />
    </div>
  )
}