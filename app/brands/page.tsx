"use client"

// "use client" wajib di baris pertama karena halaman ini memakai state dan efek.
// Keduanya hanya berjalan di peramban, bukan di server.

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandTable } from "@/components/ui/brands/brand-table"
import { DialogArsipBrand } from "@/components/ui/brands/dialog-arsip-brand"
import { ambilDaftarBrand, arsipkanBrand, pulihkanBrand } from "@/lib/api/brands"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { Brand } from "@/lib/types"

// Tiga kondisi halaman. Brief mensyaratkan empat tampilan: memuat, galat, kosong,
// dan berhasil. "Kosong" tidak dijadikan kondisi tersendiri karena ditentukan
// dari daftar yang panjangnya nol saat kondisinya "berhasil".
type Kondisi = "memuat" | "berhasil" | "galat"

// Mengambil pesan yang aman ditampilkan dari sebuah galat. GalatJaringan dan GalatApi
// membawa pesan berbahasa Indonesia. Galat lain diganti pesan umum supaya detail
// teknis tidak bocor ke layar.
function pesanDariGalat(galat: unknown): string {
  if (galat instanceof GalatJaringan || galat instanceof GalatApi) {
    return galat.message
  }
  return "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
}

export default function HalamanDaftarBrand() {
  // Daftar brand dari API. Awalnya kosong sampai data tiba.
  const [daftar, setDaftar] = useState<Brand[]>([])

  // Kondisi awal "memuat" supaya skeleton langsung tampil saat halaman dibuka.
  const [kondisi, setKondisi] = useState<Kondisi>("memuat")

  // Pesan yang ditampilkan ke pengguna kalau pemuatan daftar gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung muat ulang. Setiap nilainya berubah, efek di bawah berjalan ulang.
  // Dipakai tombol "Coba lagi" dan juga setelah arsip atau pulihkan berhasil.
  const [percobaan, setPercobaan] = useState(0)

  // Brand yang sedang menunggu konfirmasi arsip. Null berarti dialog tertutup.
  const [brandAkanDiarsipkan, setBrandAkanDiarsipkan] = useState<Brand | null>(null)

  // Id brand yang sedang diarsipkan atau dipulihkan. Null kalau tidak ada.
  const [idSedangDiproses, setIdSedangDiproses] = useState<number | null>(null)

  useEffect(() => {
    // Penanda untuk menghentikan pembaruan state kalau halaman sudah ditinggalkan
    // atau efek berjalan ulang sebelum jawaban API tiba.
    let dibatalkan = false

    ambilDaftarBrand()
      .then((respons) => {
        if (dibatalkan) return

        // "?? []" berarti pakai daftar kosong kalau data bernilai null atau tidak ada.
        setDaftar(respons.data ?? [])
        setKondisi("berhasil")
      })
      .catch((galat: unknown) => {
        if (dibatalkan) return
        setPesanGalat(pesanDariGalat(galat))
        setKondisi("galat")
      })

    // Fungsi pembersih: dijalankan saat efek diulang atau halaman ditutup.
    return () => {
      dibatalkan = true
    }
  }, [percobaan])

  // Dipanggil tombol "Coba lagi": tampilkan skeleton lagi, lalu picu efek ulang.
  function cobaLagi() {
    setKondisi("memuat")
    setPercobaan((nilai) => nilai + 1)
  }

  // Dipanggil saat pengguna menekan "Ya, arsipkan" di dialog.
  async function konfirmasiArsip() {
    if (brandAkanDiarsipkan === null) return
    const brand = brandAkanDiarsipkan

    setIdSedangDiproses(brand.id)
    try {
      await arsipkanBrand(brand.id)
      toast.success("Brand berhasil diarsipkan")
      setBrandAkanDiarsipkan(null)

      // Muat ulang daftar tanpa menampilkan skeleton (kondisi tidak diubah ke "memuat"),
      // supaya tabel tidak berkedip.
      setPercobaan((nilai) => nilai + 1)
    } catch (galat: unknown) {
      // Dialog dibiarkan terbuka supaya pengguna bisa mencoba lagi.
      toast.error(pesanDariGalat(galat))
    } finally {
      // Selalu dijalankan, berhasil atau gagal, supaya tombol aktif kembali.
      setIdSedangDiproses(null)
    }
  }

  // Dipanggil tombol "Pulihkan" di tabel. Brief hanya mewajibkan konfirmasi untuk
  // arsip, jadi pulihkan langsung berjalan.
  async function pulihkan(brand: Brand) {
    setIdSedangDiproses(brand.id)
    try {
      await pulihkanBrand(brand.id)
      toast.success("Brand berhasil dipulihkan")
      setPercobaan((nilai) => nilai + 1)
    } catch (galat: unknown) {
      toast.error(pesanDariGalat(galat))
    } finally {
      setIdSedangDiproses(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Judul di kiri, tombol tambah di kanan. Tetap tampil di semua kondisi. */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand</h1>

        {/* Button shadcn di proyek ini tidak punya asChild, jadi tautan dibuat
            tampak seperti tombol lewat buttonVariants. */}
        <Link href="/brands/new" className={buttonVariants()}>
          Tambah Brand
        </Link>
      </div>

      {/* Kondisi memuat: lima baris skeleton menggantikan tabel. */}
      {kondisi === "memuat" && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, indeks) => (
            <Skeleton key={indeks} className="h-10 w-full" />
          ))}
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

      {/* Kondisi kosong: API berhasil menjawab, tetapi belum ada data. */}
      {kondisi === "berhasil" && daftar.length === 0 && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">Belum ada brand.</p>
          <Link href="/brands/new" className={buttonVariants()}>
            Tambah Brand
          </Link>
        </div>
      )}

      {/* Kondisi berhasil dan ada data: tabel menampilkan data dan melaporkan klik
          tombol lewat props, tanpa memanggil API sendiri. */}
      {kondisi === "berhasil" && daftar.length > 0 && (
        <BrandTable
          brands={daftar}
          onArsipkan={setBrandAkanDiarsipkan}
          onPulihkan={pulihkan}
          idSedangDiproses={idSedangDiproses}
        />
      )}

      {/* Dialog konfirmasi arsip. Terbuka selama ada brand yang dipilih. */}
      <DialogArsipBrand
        brand={brandAkanDiarsipkan}
        sedangMemproses={idSedangDiproses !== null}
        onBatal={() => setBrandAkanDiarsipkan(null)}
        onKonfirmasi={konfirmasiArsip}
      />
    </div>
  )
}