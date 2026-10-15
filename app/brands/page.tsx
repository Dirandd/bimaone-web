"use client"

// "use client" wajib di baris pertama karena berkas ini memakai state, efek, dan hook
// pembaca alamat (useSearchParams). Semuanya hanya berjalan di peramban.

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BrandTable } from "@/components/ui/brands/brand-table"
import { BrandToolbar, type StatusDaftar } from "@/components/ui/brands/brand-toolbar"
import { DialogArsipBrand } from "@/components/ui/brands/dialog-arsip-brand"
import { ambilDaftarBrand, arsipkanBrand, pulihkanBrand } from "@/lib/api/brands"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { Brand } from "@/lib/types"

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

// Lima baris skeleton. Dipakai di dua tempat: saat data dimuat, dan sebagai cadangan
// selagi Next.js membaca alamat (Suspense di bawah).
function KerangkaMemuat() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, indeks) => (
        <Skeleton key={indeks} className="h-10 w-full" />
      ))}
    </div>
  )
}

// Bagian yang mengambil dan menampilkan data. Menerima kata kunci dan status dari
// alamat lewat props. Halaman induk memberinya "key" berisi kedua nilai itu, jadi
// setiap pencarian atau filter berubah, komponen ini dibuat ulang dari awal: state
// kembali ke "memuat", skeleton tampil, dan data diambil lagi.
function DataDaftar({ search, status }: { search: string; status: StatusDaftar }) {
  // Daftar brand dari API. Awalnya kosong sampai data tiba.
  const [daftar, setDaftar] = useState<Brand[]>([])

  // Kondisi awal "memuat" supaya skeleton langsung tampil.
  const [kondisi, setKondisi] = useState<Kondisi>("memuat")

  // Pesan yang ditampilkan kalau pemuatan daftar gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung muat ulang. Setiap nilainya berubah, efek di bawah berjalan ulang.
  // Dipakai tombol "Coba lagi" dan setelah arsip atau pulihkan berhasil.
  const [percobaan, setPercobaan] = useState(0)

  // Brand yang sedang menunggu konfirmasi arsip. Null berarti dialog tertutup.
  const [brandAkanDiarsipkan, setBrandAkanDiarsipkan] = useState<Brand | null>(null)

  // Id brand yang sedang diarsipkan atau dipulihkan. Null kalau tidak ada.
  const [idSedangDiproses, setIdSedangDiproses] = useState<number | null>(null)

  useEffect(() => {
    // Penanda untuk menghentikan pembaruan state kalau komponen sudah ditinggalkan
    // atau efek berjalan ulang sebelum jawaban API tiba.
    let dibatalkan = false

    // Kata kunci dan status dikirim ke API sebagai parameter alamat.
    ambilDaftarBrand({ search, status })
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
  }, [percobaan, search, status])

  // Dipanggil tombol "Coba lagi": tampilkan skeleton lagi, lalu picu efek ulang.
  function cobaLagi() {
    setKondisi("memuat")
    setPercobaan((nilai) => nilai + 1)
  }

  // Dipanggil saat pengguna menekan "Arsipkan" di dialog.
  async function konfirmasiArsip() {
    if (brandAkanDiarsipkan === null) return
    const brand = brandAkanDiarsipkan

    setIdSedangDiproses(brand.id)
    try {
      await arsipkanBrand(brand.id)
      toast.success("Brand berhasil diarsipkan")
      setBrandAkanDiarsipkan(null)

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

      {/* Kondisi kosong. Brief meminta pesan berbeda untuk dua keadaan:
          hasil pencarian yang kosong, dan memang belum ada data sama sekali. */}
      {kondisi === "berhasil" && daftar.length === 0 && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          {search !== "" ? (
            <p className="text-sm">
              Tidak ada brand yang cocok dengan pencarian &quot;{search}&quot;.
            </p>
          ) : status !== "active" ? (
            <p className="text-sm">Tidak ada brand dengan status ini.</p>
          ) : (
            <>
              <p className="text-sm">Belum ada brand.</p>
              <Link href="/brands/new" className={buttonVariants()}>
                Tambah Brand
              </Link>
            </>
          )}
        </div>
      )}

      {/* Kondisi berhasil dan ada data: tabel hanya menampilkan data dari props. */}
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

// Bagian yang membaca alamat. Kata kunci dan status disimpan di alamat halaman
// (misalnya /brands?search=sam&status=archived) supaya tetap ada saat halaman
// dimuat ulang atau alamatnya dibagikan, sesuai brief.
function IsiHalaman() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") ?? ""
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
    // push menambah riwayat, jadi tombol Kembali di peramban kembali ke pencarian sebelumnya.
    router.push(teks === "" ? "/brands" : `/brands?${teks}`)
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

      {/* key berisi kata kunci: kalau alamat berubah (misalnya lewat tombol Kembali),
          kotak cari dibuat ulang dan teksnya mengikuti alamat. */}
      <BrandToolbar
        key={search}
        search={search}
        status={status}
        onCari={(kataKunci) => ubahParameter({ search: kataKunci })}
        // "active" adalah bawaan, jadi tidak perlu ditulis di alamat.
        onUbahStatus={(nilai) =>
          ubahParameter({ status: nilai === "active" ? null : nilai })
        }
      />

      {/* key berisi kata kunci dan status: setiap berubah, DataDaftar dimulai dari awal. */}
      <DataDaftar key={`${search}|${status}`} search={search} status={status} />
    </div>
  )
}

// Halaman. Komponen yang memakai useSearchParams harus dibungkus Suspense. Kalau tidak,
// npm run build gagal dengan galat "Missing Suspense boundary".
export default function HalamanDaftarBrand() {
  return (
    <Suspense fallback={<KerangkaMemuat />}>
      <IsiHalaman />
    </Suspense>
  )
}