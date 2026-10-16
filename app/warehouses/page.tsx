"use client"

// "use client" wajib di baris pertama karena berkas ini memakai state, efek, dan hook
// pembaca alamat (useSearchParams). Semuanya hanya berjalan di peramban.

import Link from "next/link"
import { Plus } from "lucide-react"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DialogArsipGudang } from "@/components/ui/warehouses/dialog-arsip-gudang"
import { WarehouseTable } from "@/components/ui/warehouses/warehouse-table"
import {
  WarehouseToolbar,
  type StatusDaftar,
} from "@/components/ui/warehouses/warehouse-toolbar"
import { ambilDaftarGudang, arsipkanGudang } from "@/lib/api/warehouses"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { Warehouse } from "@/lib/types"

// Tiga kondisi data. Brief mensyaratkan empat tampilan: memuat, galat, kosong, dan
// berhasil. "Kosong" ditentukan dari daftar yang panjangnya nol saat kondisinya "berhasil".
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

// Membaca nilai status dari alamat. Nilai yang tidak dikenal dianggap "active",
// supaya alamat yang diketik sembarangan tidak merusak halaman.
function bacaStatus(nilai: string | null): StatusDaftar {
  if (nilai === "archived" || nilai === "all") return nilai
  return "active"
}

// Lima baris skeleton. Dipakai saat data dimuat, dan sebagai cadangan selagi Next.js
// membaca alamat (Suspense di bawah).
function KerangkaMemuat() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, indeks) => (
        <Skeleton key={indeks} className="h-10 w-full" />
      ))}
    </div>
  )
}

// Bagian yang mengambil dan menampilkan data. Menerima status dari alamat lewat props.
// Halaman induk memberinya "key" berisi status itu, jadi setiap status berubah,
// komponen ini dibuat ulang dari awal: state kembali ke "memuat", skeleton tampil,
// dan data diambil lagi.
function DataDaftar({ status }: { status: StatusDaftar }) {
  // Daftar gudang dari API. Awalnya kosong sampai data tiba.
  const [daftar, setDaftar] = useState<Warehouse[]>([])

  // Kondisi awal "memuat" supaya skeleton langsung tampil.
  const [kondisi, setKondisi] = useState<Kondisi>("memuat")

  // Pesan yang ditampilkan kalau pemuatan daftar gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung muat ulang. Setiap nilainya berubah, efek di bawah berjalan ulang.
  // Dipakai tombol "Coba lagi" dan setelah arsip berhasil.
  const [percobaan, setPercobaan] = useState(0)

  // Gudang yang sedang menunggu konfirmasi arsip. Null berarti dialog tertutup.
  const [gudangAkanDiarsipkan, setGudangAkanDiarsipkan] = useState<Warehouse | null>(null)

  // Id gudang yang sedang diarsipkan. Null kalau tidak ada.
  const [idSedangDiproses, setIdSedangDiproses] = useState<number | null>(null)

  useEffect(() => {
    // Penanda untuk menghentikan pembaruan state kalau komponen sudah ditinggalkan
    // atau efek berjalan ulang sebelum jawaban API tiba.
    let dibatalkan = false

    // Status dikirim ke API sebagai parameter alamat (?status=archived).
    ambilDaftarGudang({ status })
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

    // Fungsi pembersih: dijalankan saat efek diulang atau komponen ditutup.
    return () => {
      dibatalkan = true
    }
  }, [percobaan, status])

  // Dipanggil tombol "Coba lagi": tampilkan skeleton lagi, lalu picu efek ulang.
  function cobaLagi() {
    setKondisi("memuat")
    setPercobaan((nilai) => nilai + 1)
  }

  // Dipanggil saat pengguna menekan "Arsipkan" di dialog.
  async function konfirmasiArsip() {
    if (gudangAkanDiarsipkan === null) return
    const gudang = gudangAkanDiarsipkan

    setIdSedangDiproses(gudang.id)
    try {
      await arsipkanGudang(gudang.id)
      toast.success("Gudang berhasil diarsipkan")
      setGudangAkanDiarsipkan(null)

      // Muat ulang daftar tanpa menampilkan skeleton, supaya tabel tidak berkedip.
      setPercobaan((nilai) => nilai + 1)
    } catch (galat: unknown) {
      // Dialog dibiarkan terbuka supaya pengguna bisa mencoba lagi.
      toast.error(pesanDariGalat(galat))
    } finally {
      // Selalu dijalankan, berhasil atau gagal, supaya tombol aktif kembali.
      setIdSedangDiproses(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Kondisi memuat: skeleton menggantikan tabel. */}
      {kondisi === "memuat" && <KerangkaMemuat />}

      {/* Kondisi galat: pesan yang bisa dimengerti dan tombol untuk mengulang. */}
      {kondisi === "galat" && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          <p className="text-sm">{pesanGalat}</p>
          <Button variant="outline" onClick={cobaLagi}>
            Coba lagi
          </Button>
        </div>
      )}

      {/* Kondisi kosong. Dua keadaan berbeda: filter Arsip atau Semua yang tidak
          ada isinya, atau memang belum ada gudang aktif. */}
      {kondisi === "berhasil" && daftar.length === 0 && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          {status !== "active" ? (
            <p className="text-sm">Tidak ada gudang dengan status ini.</p>
          ) : (
            <>
              <p className="text-sm">Belum ada gudang.</p>
              <Link href="/warehouses/new" className={buttonVariants()}>
                <Plus />
                Tambah Gudang
              </Link>
            </>
          )}
        </div>
      )}

      {/* Kondisi berhasil dan ada data: tabel hanya menampilkan data dari props. */}
      {kondisi === "berhasil" && daftar.length > 0 && (
        <WarehouseTable
          warehouses={daftar}
          onArsipkan={setGudangAkanDiarsipkan}
          idSedangDiproses={idSedangDiproses}
        />
      )}

      {/* Dialog konfirmasi arsip. Terbuka selama ada gudang yang dipilih. */}
      <DialogArsipGudang
        gudang={gudangAkanDiarsipkan}
        sedangMemproses={idSedangDiproses !== null}
        onBatal={() => setGudangAkanDiarsipkan(null)}
        onKonfirmasi={konfirmasiArsip}
      />
    </div>
  )
}

// Bagian yang membaca alamat. Status disimpan di alamat (misalnya
// /warehouses?status=archived) supaya tetap ada saat halaman dimuat ulang atau
// alamatnya dibagikan, sesuai brief.
function IsiHalaman() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = bacaStatus(searchParams.get("status"))

  // Mengubah parameter alamat. Nilai null atau teks kosong berarti parameter itu
  // dihapus dari alamat, jadi alamat tetap bersih. Parameter lain dibiarkan.
  function ubahParameter(perubahan: Record<string, string | null>) {
    const baru = new URLSearchParams(searchParams.toString())

    for (const [kunci, nilai] of Object.entries(perubahan)) {
      if (nilai === null || nilai === "") {
        baru.delete(kunci)
      } else {
        baru.set(kunci, nilai)
      }
    }

    const teks = baru.toString()
    // push menambah riwayat, jadi tombol Kembali di peramban kembali ke keadaan sebelumnya.
    router.push(teks === "" ? "/warehouses" : `/warehouses?${teks}`)
  }

  return (
    <div className="space-y-6">
      {/* Judul di kiri, tombol tambah di kanan. Tetap tampil di semua kondisi. */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gudang</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data master gudang BIMAONE.
          </p>
        </div>

        {/* Button shadcn di proyek ini tidak punya asChild, jadi tautan dibuat
            tampak seperti tombol lewat buttonVariants. */}
        <Link href="/warehouses/new" className={buttonVariants()}>
          <Plus />
          Tambah Gudang
        </Link>
      </div>

      {/* Tombol filter di atas tabel. "active" adalah bawaan, jadi tidak ditulis
          di alamat supaya alamat tetap bersih. */}
      <WarehouseToolbar
        status={status}
        onUbahStatus={(nilai) =>
          ubahParameter({ status: nilai === "active" ? null : nilai })
        }
      />

      {/* key berisi status: setiap status berubah, DataDaftar dimulai dari awal. */}
      <DataDaftar key={status} status={status} />
    </div>
  )
}

// Halaman. Komponen yang memakai useSearchParams harus dibungkus Suspense. Kalau tidak,
// npm run build gagal dengan galat "Missing Suspense boundary".
export default function HalamanDaftarGudang() {
  return (
    <Suspense fallback={<KerangkaMemuat />}>
      <IsiHalaman />
    </Suspense>
  )
}