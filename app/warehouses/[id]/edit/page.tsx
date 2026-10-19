"use client"

// Halaman ubah gudang. Komponen klien karena memakai state, efek, useParams,
// useRouter, dan toast.

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { WarehouseForm } from "@/components/warehouses/warehouse-form"
import { ambilGudang, ubahGudang, type DataGudang } from "@/lib/api/warehouses"
import { GalatApi, GalatJaringan } from "@/lib/api-client"
import type { Warehouse } from "@/lib/types"
import { cn } from "@/lib/utils"

// Empat kondisi halaman ini. "tidakAda" dipisah dari "galat" karena pesan dan
// tombolnya berbeda: data yang tidak ada tidak akan muncul walau dicoba lagi.
type Kondisi = "memuat" | "berhasil" | "tidakAda" | "galat"

// Mengambil pesan yang aman ditampilkan dari sebuah galat. GalatJaringan dan GalatApi
// membawa pesan berbahasa Indonesia. Galat lain diganti pesan umum supaya detail
// teknis tidak bocor ke layar.
function pesanDariGalat(galat: unknown): string {
  if (galat instanceof GalatJaringan || galat instanceof GalatApi) {
    return galat.message
  }
  return "Terjadi kesalahan yang tidak terduga. Silakan coba lagi."
}

// Membaca id dari alamat. Hanya bilangan bulat mulai dari 1 tanpa awalan nol yang
// diterima. Selain itu hasilnya null, dan halaman langsung menampilkan "tidak
// ditemukan" tanpa memanggil API.
function bacaId(nilai: string | undefined): number | null {
  if (nilai === undefined || !/^[1-9][0-9]*$/.test(nilai)) return null
  return Number(nilai)
}

// Kerangka form: lima kotak abu-abu selagi data gudang dimuat.
function KerangkaForm() {
  return (
    <div className="max-w-xl space-y-6">
      {Array.from({ length: 5 }).map((_, indeks) => (
        <Skeleton key={indeks} className="h-10 w-full" />
      ))}
    </div>
  )
}

// Tampilan kalau gudang dengan id itu tidak ada, atau id di alamat bukan angka.
function TidakDitemukan() {
  return (
    <div className="max-w-xl space-y-4 rounded-md border p-6 text-center">
      <p className="text-sm">
        Gudang tidak ditemukan. Alamatnya mungkin salah, atau datanya sudah tidak ada.
      </p>
      <Link
        href="/warehouses"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Kembali ke daftar
      </Link>
    </div>
  )
}

// Bagian yang mengambil data lama lalu menampilkan form. Halaman induk memberinya
// "key" berisi id, jadi kalau id di alamat berubah, komponen ini dibuat ulang dari
// awal dan form tidak tersisa berisi data gudang yang lama.
function IsiUbah({ id }: { id: number }) {
  const router = useRouter()

  // Data gudang dari API. Null sampai data tiba.
  const [gudang, setGudang] = useState<Warehouse | null>(null)

  // Kondisi awal "memuat" supaya skeleton langsung tampil.
  const [kondisi, setKondisi] = useState<Kondisi>("memuat")

  // Pesan yang ditampilkan kalau pemuatan gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung muat ulang. Setiap nilainya berubah, efek di bawah berjalan ulang.
  const [percobaan, setPercobaan] = useState(0)

  useEffect(() => {
    // Penanda untuk menghentikan pembaruan state kalau komponen sudah ditinggalkan
    // atau efek berjalan ulang sebelum jawaban API tiba.
    let dibatalkan = false

    // GET /api/v1/warehouses/{id}
    ambilGudang(id)
      .then((respons) => {
        if (dibatalkan) return
        setGudang(respons.data)
        setKondisi("berhasil")
      })
      .catch((galat: unknown) => {
        if (dibatalkan) return
        if (galat instanceof GalatApi && galat.status === 404) {
          // 404: data dengan id itu tidak ada.
          setKondisi("tidakAda")
        } else {
          setPesanGalat(pesanDariGalat(galat))
          setKondisi("galat")
        }
      })

    // Fungsi pembersih: dijalankan saat efek diulang atau komponen ditutup.
    return () => {
      dibatalkan = true
    }
  }, [id, percobaan])

  // Dipanggil tombol "Coba lagi": tampilkan skeleton lagi, lalu picu efek ulang.
  function cobaLagi() {
    setKondisi("memuat")
    setPercobaan((nilai) => nilai + 1)
  }

  // Fungsi yang diberikan ke form. Kalau ubahGudang gagal, galatnya dilempar ke form
  // (tidak ditangkap di sini) supaya form yang menampilkan pesannya.
  async function simpan(data: DataGudang) {
    // PUT /api/v1/warehouses/{id}
    await ubahGudang(id, data)

    // Hanya sampai sini kalau berhasil: tampilkan notifikasi lalu kembali ke daftar.
    toast.success("Gudang berhasil diperbarui")
    router.push("/warehouses")
  }

  return (
    <>
      {kondisi === "memuat" && <KerangkaForm />}

      {kondisi === "galat" && (
        <div className="max-w-xl space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">{pesanGalat}</p>
          <Button variant="outline" onClick={cobaLagi}>
            Coba lagi
          </Button>
        </div>
      )}

      {kondisi === "tidakAda" && <TidakDitemukan />}

      {/* Form hanya ditampilkan setelah data tiba. Form memakai nilaiAwal sekali saat
          pertama dibuat, jadi tidak boleh dibuat sebelum datanya ada. */}
      {kondisi === "berhasil" && gudang !== null && (
        <WarehouseForm
          teksTombol="Simpan"
          onKirim={simpan}
          nilaiAwal={{
            code: gudang.code,
            name: gudang.name,
            address: gudang.address,
            pic_name: gudang.pic_name,
            phone: gudang.phone,
          }}
        />
      )}
    </>
  )
}

export default function HalamanUbahGudang() {
  // useParams membaca bagian dinamis dari alamat: /warehouses/3/edit memberi id "3".
  const params = useParams<{ id: string }>()
  const id = bacaId(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ubah Gudang</h1>

      {id === null ? <TidakDitemukan /> : <IsiUbah key={id} id={id} />}
    </div>
  )
}