"use client"

// "use client" wajib di baris pertama karena halaman ini sekarang memakai state
// dan efek. Keduanya hanya berjalan di peramban, bukan di server.

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandTable } from "@/components/ui/brands/brand-table"
import { ambilDaftarBrand } from "@/lib/api/brands"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { Brand } from "@/lib/types"

// Tiga kondisi halaman. Brief mensyaratkan: memuat, kosong, galat, dan berhasil.
// "Kosong" tidak dijadikan kondisi tersendiri karena ditentukan dari daftar
// yang panjangnya nol saat kondisinya "berhasil".
type Kondisi = "memuat" | "berhasil" | "galat"

export default function HalamanDaftarBrand() {
  // Daftar brand dari API. Awalnya kosong sampai data tiba.
  const [daftar, setDaftar] = useState<Brand[]>([])

  // Kondisi awal "memuat" supaya skeleton langsung tampil saat halaman dibuka.
  const [kondisi, setKondisi] = useState<Kondisi>("memuat")

  // Pesan yang ditampilkan ke pengguna kalau pemanggilan gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung percobaan. Setiap nilainya berubah, efek di bawah berjalan ulang.
  // Dipakai oleh tombol "Coba lagi" supaya data dimuat ulang.
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => {
    // Penanda untuk menghentikan pembaruan state kalau halaman sudah ditinggalkan
    // atau efek berjalan ulang sebelum jawaban API tiba.
    let dibatalkan = false

    ambilDaftarBrand()
      .then((respons) => {
        if (dibatalkan) return
        setDaftar(respons.data)
        setKondisi("berhasil")
      })
      .catch((galat: unknown) => {
        if (dibatalkan) return

        // Galat jaringan dan galat API sama-sama membawa pesan yang sudah
        // berbahasa Indonesia dan aman ditampilkan. Selain keduanya, pakai
        // pesan umum supaya detail teknis tidak bocor ke layar.
        if (galat instanceof GalatJaringan || galat instanceof GalatApi) {
          setPesanGalat(galat.message)
        } else {
          setPesanGalat("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
        }
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

  return (
    <div className="space-y-6">
      {/* Judul di kiri, tombol tambah di kanan. Tetap tampil di semua kondisi. */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand</h1>

        {/* Belum berfungsi. Halaman /brands/new dibuat di Pull Request lain. */}
        <Button>Tambah Brand</Button>
      </div>

      {/* Kondisi 1: memuat. Lima baris skeleton menggantikan tabel. */}
      {kondisi === "memuat" && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, indeks) => (
            <Skeleton key={indeks} className="h-10 w-full" />
          ))}
        </div>
      )}

      {/* Kondisi 2: galat. Pesan yang bisa dimengerti dan tombol untuk mengulang. */}
      {kondisi === "galat" && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">{pesanGalat}</p>
          <Button variant="outline" onClick={cobaLagi}>
            Coba lagi
          </Button>
        </div>
      )}

      {/* Kondisi 3: kosong. Berhasil memanggil API, tetapi belum ada data. */}
      {kondisi === "berhasil" && daftar.length === 0 && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">Belum ada brand.</p>
          <Button>Tambah Brand</Button>
        </div>
      )}

      {/* Kondisi 4: berhasil dan ada data. Tabel hanya menampilkan data dari props. */}
      {kondisi === "berhasil" && daftar.length > 0 && (
        <BrandTable brands={daftar} />
      )}
    </div>
  )
}