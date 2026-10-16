"use client"

// Halaman ubah brand. "use client" wajib karena memakai state, efek, useParams,
// useRouter, dan toast. Semuanya hanya berjalan di peramban.

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandForm } from "@/components/ui/brands/brand-form"
import { ambilBrand, ubahBrand, type DataBrand } from "@/lib/api/brands"
import { GalatApi, GalatJaringan } from "@/lib/api-client"
import type { Brand } from "@/lib/types"
// cn dipakai pada tautan bertampilan tombol supaya bingkai varian outline tampil,
// sama seperti tombol Batal di BrandForm.
import { cn } from "@/lib/utils"

// Empat kondisi halaman. Brief mensyaratkan memuat, galat, dan berhasil. "Tidak
// ditemukan" ditambahkan karena brand yang diminta bisa saja tidak ada.
type Kondisi = "memuat" | "berhasil" | "tidak-ditemukan" | "galat"

// Mengambil pesan yang aman ditampilkan dari sebuah galat. Galat lain diganti pesan
// umum supaya detail teknis tidak bocor ke layar. Fungsi yang sama ada di halaman
// daftar. Sengaja tidak dipindahkan ke berkas bersama di Pull Request ini.
function pesanDariGalat(galat: unknown): string {
  if (galat instanceof GalatJaringan || galat instanceof GalatApi) {
    return galat.message
  }
  return "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
}

export default function HalamanUbahBrand() {
  const router = useRouter()

  // Id diambil dari alamat. Untuk /brands/3/edit, params.id berisi teks "3".
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  // Id hanya sah kalau berupa bilangan bulat mulai dari 1. Alamat seperti
  // /brands/abc/edit tidak perlu memanggil API.
  const idSah = Number.isInteger(id) && id >= 1

  // Brand yang sedang diubah. Null sampai datanya tiba dari API.
  const [brand, setBrand] = useState<Brand | null>(null)

  // Kondisi awal "memuat". Untuk id yang tidak sah langsung "tidak-ditemukan".
  const [kondisi, setKondisi] = useState<Kondisi>(idSah ? "memuat" : "tidak-ditemukan")

  // Pesan yang ditampilkan kalau pemuatan gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung muat ulang. Setiap nilainya berubah, efek di bawah berjalan ulang.
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => {
    // Id yang tidak sah tidak memanggil API.
    if (!idSah) return

    // Penanda untuk menghentikan pembaruan state kalau halaman sudah ditinggalkan
    // sebelum jawaban API tiba.
    let dibatalkan = false

    ambilBrand(id)
      .then((respons) => {
        if (dibatalkan) return
        setBrand(respons.data)
        setKondisi("berhasil")
      })
      .catch((galat: unknown) => {
        if (dibatalkan) return

        // 404 berarti brand dengan id itu tidak ada. Itu bukan galat sistem,
        // jadi tampilannya dibedakan dari galat jaringan atau server.
        if (galat instanceof GalatApi && galat.status === 404) {
          setKondisi("tidak-ditemukan")
        } else {
          setPesanGalat(pesanDariGalat(galat))
          setKondisi("galat")
        }
      })

    // Fungsi pembersih: dijalankan saat efek diulang atau halaman ditutup.
    return () => {
      dibatalkan = true
    }
  }, [id, idSah, percobaan])

  // Dipanggil tombol "Coba lagi": tampilkan skeleton lagi, lalu picu efek ulang.
  function cobaLagi() {
    setKondisi("memuat")
    setPercobaan((nilai) => nilai + 1)
  }

  // Fungsi yang diberikan ke form. Kalau ubahBrand gagal, galatnya dilempar ke
  // form (tidak ditangkap di sini) supaya form yang menampilkan pesannya,
  // termasuk galat per kolom dari API.
  async function simpan(data: DataBrand) {
    await ubahBrand(id, data)

    // Hanya sampai sini kalau berhasil: tampilkan notifikasi lalu kembali ke daftar.
    toast.success("Brand berhasil diperbarui")
    router.push("/brands")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ubah Brand</h1>

      {/* Kondisi memuat: skeleton seukuran form (satu kolom nama dan satu deskripsi). */}
      {kondisi === "memuat" && (
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {/* Kondisi galat: pesan yang bisa dimengerti dan tombol untuk mengulang. */}
      {kondisi === "galat" && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">{pesanGalat}</p>
          <Button variant="outline" onClick={cobaLagi}>
            Coba lagi
          </Button>
        </div>
      )}

      {/* Kondisi tidak ditemukan: id tidak sah, atau API menjawab 404. */}
      {kondisi === "tidak-ditemukan" && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">Brand tidak ditemukan.</p>
          <Link href="/brands" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke daftar
          </Link>
        </div>
      )}

      {/* Kondisi berhasil: form baru dibuat setelah data tiba, karena BrandForm
          mengisi kolomnya hanya sekali dari nilaiAwal. */}
      {kondisi === "berhasil" && brand !== null && (
        <BrandForm
          nilaiAwal={{ name: brand.name, description: brand.description }}
          teksTombol="Simpan perubahan"
          onKirim={simpan}
        />
      )}
    </div>
  )
}