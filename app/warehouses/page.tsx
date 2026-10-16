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
import { WarehousePagination } from "@/components/ui/warehouses/warehouse-pagination"
import { WarehouseTable } from "@/components/ui/warehouses/warehouse-table"
import {
  WarehouseToolbar,
  type StatusDaftar,
} from "@/components/ui/warehouses/warehouse-toolbar"
import {
  ambilDaftarGudang,
  arsipkanGudang,
  pulihkanGudang,
} from "@/lib/api/warehouses"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { Warehouse } from "@/lib/types"

// Jumlah gudang per halaman. Bawaan di Kontrak API adalah 10, maksimal 100.
const BARIS_PER_HALAMAN = 10

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

// Membaca nomor halaman dari alamat. Hanya bilangan bulat mulai dari 1 yang
// diterima. Number(null) hasilnya 0 dan Number("abc") hasilnya NaN, keduanya ditolak
// dan dianggap halaman 1.
function bacaHalaman(nilai: string | null): number {
  const angka = Number(nilai)
  return Number.isInteger(angka) && angka >= 1 ? angka : 1
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

// Bagian yang mengambil dan menampilkan data. Menerima kata kunci, status, dan halaman
// dari alamat lewat props. Halaman induk memberinya "key" berisi ketiganya, jadi
// setiap salah satunya berubah, komponen ini dibuat ulang dari awal: state kembali
// ke "memuat", skeleton tampil, dan data diambil lagi.
function DataDaftar({
  search,
  status,
  halaman,
  onUbahHalaman,
}: {
  search: string
  status: StatusDaftar
  halaman: number
  onUbahHalaman: (halaman: number) => void
}) {
  // Daftar gudang dari API. Awalnya kosong sampai data tiba.
  const [daftar, setDaftar] = useState<Warehouse[]>([])

  // Jumlah halaman dari meta API. Null berarti API belum mengirim meta, jadi
  // jumlah halaman tidak diketahui dan tombol halaman tidak ditampilkan.
  const [totalHalaman, setTotalHalaman] = useState<number | null>(null)

  // Kondisi awal "memuat" supaya skeleton langsung tampil.
  const [kondisi, setKondisi] = useState<Kondisi>("memuat")

  // Pesan yang ditampilkan kalau pemuatan daftar gagal.
  const [pesanGalat, setPesanGalat] = useState("")

  // Penghitung muat ulang. Setiap nilainya berubah, efek di bawah berjalan ulang.
  // Dipakai tombol "Coba lagi" dan setelah arsip berhasil.
  const [percobaan, setPercobaan] = useState(0)

  // Gudang yang sedang menunggu konfirmasi arsip. Null berarti dialog tertutup.
  const [gudangAkanDiarsipkan, setGudangAkanDiarsipkan] = useState<Warehouse | null>(null)

  // Id gudang yang sedang diarsipkan atau dipulihkan. Null kalau tidak ada.
  const [idSedangDiproses, setIdSedangDiproses] = useState<number | null>(null)

  useEffect(() => {
    // Penanda untuk menghentikan pembaruan state kalau komponen sudah ditinggalkan
    // atau efek berjalan ulang sebelum jawaban API tiba.
    let dibatalkan = false

    // Kata kunci, status, dan halaman dikirim ke API sebagai parameter alamat
    // (?search=...&status=archived&page=2&per_page=10).
    // Backend mencari di kolom code dan name.
    ambilDaftarGudang({
      search,
      status,
      page: halaman,
      per_page: BARIS_PER_HALAMAN,
    })
      .then((respons) => {
        if (dibatalkan) return

        // "?? []" berarti pakai daftar kosong kalau data bernilai null atau tidak ada.
        setDaftar(respons.data ?? [])

        // "?." membaca meta dengan aman. Tipe kita menjanjikan meta selalu ada,
        // tetapi TypeScript tidak memeriksa isi jawaban saat berjalan. Tanpa meta
        // hasilnya null.
        setTotalHalaman(respons.meta?.total_pages ?? null)
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
  }, [percobaan, search, status, halaman])

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

  // Dipanggil tombol "Pulihkan" di tabel. Brief hanya mewajibkan konfirmasi untuk
  // arsip, jadi pulihkan langsung berjalan tanpa dialog.
  async function pulihkan(gudang: Warehouse) {
    setIdSedangDiproses(gudang.id)
    try {
      await pulihkanGudang(gudang.id)
      toast.success("Gudang berhasil dipulihkan")

      // Muat ulang daftar tanpa menampilkan skeleton, supaya tabel tidak berkedip.
      setPercobaan((nilai) => nilai + 1)
    } catch (galat: unknown) {
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

      {/* Kondisi kosong. Empat keadaan berbeda, dari yang paling khusus: halaman
          di luar jangkauan, hasil pencarian kosong, filter Arsip atau Semua yang
          tidak ada isinya, atau memang belum ada gudang aktif. */}
      {kondisi === "berhasil" && daftar.length === 0 && (
        <div className="space-y-4 rounded-md border p-6 text-center">
          {totalHalaman !== null && halaman > Math.max(totalHalaman, 1) ? (
            // Hanya berlaku kalau jumlah halaman diketahui (meta ada). Terjadi kalau
            // alamat diketik sembarangan, atau setelah mengarsipkan data terakhir
            // di halaman terakhir.
            <>
              <p className="text-sm">
                Halaman {halaman} tidak ada. Hanya ada {Math.max(totalHalaman, 1)} halaman.
              </p>
              <Button variant="outline" onClick={() => onUbahHalaman(1)}>
                Kembali ke halaman 1
              </Button>
            </>
          ) : search !== "" ? (
            <p className="text-sm">
              Tidak ada gudang yang cocok dengan pencarian &quot;{search}&quot;.
            </p>
          ) : status !== "active" ? (
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
          onPulihkan={pulihkan}
          idSedangDiproses={idSedangDiproses}
        />
      )}

      {/* Navigasi halaman. Hanya tampil kalau jumlah halaman diketahui dan lebih
          dari satu. Selama API belum mengirim meta, bagian ini tidak tampil. */}
      {kondisi === "berhasil" &&
        daftar.length > 0 &&
        totalHalaman !== null &&
        totalHalaman > 1 && (
          <WarehousePagination
            halaman={halaman}
            totalHalaman={totalHalaman}
            onUbahHalaman={onUbahHalaman}
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

// Bagian yang membaca alamat. Kata kunci, status, dan halaman disimpan di alamat
// (misalnya /warehouses?search=gdg&status=archived&page=2) supaya tetap ada saat
// halaman dimuat ulang atau alamatnya dibagikan, sesuai brief.
function IsiHalaman() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") ?? ""
  const status = bacaStatus(searchParams.get("status"))
  const halaman = bacaHalaman(searchParams.get("page"))

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

  // Pindah halaman. Halaman 1 adalah bawaan, jadi tidak ditulis di alamat.
  function pindahHalaman(tujuan: number) {
    ubahParameter({ page: tujuan === 1 ? null : String(tujuan) })
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

      {/* Kotak cari dan tombol filter di atas tabel. Kata kunci kosong dan status
          "active" dihapus dari alamat supaya alamat tetap bersih (lihat ubahParameter).
          Mencari atau mengganti status juga menghapus page, supaya kembali ke halaman 1.
          key berisi kata kunci: kalau alamat berubah (misalnya lewat tombol Kembali),
          kotak cari dibuat ulang dan teksnya mengikuti alamat. */}
      <WarehouseToolbar
        key={search}
        search={search}
        status={status}
        onCari={(kataKunci) => ubahParameter({ search: kataKunci, page: null })}
        onUbahStatus={(nilai) =>
          ubahParameter({ status: nilai === "active" ? null : nilai, page: null })
        }
      />

      {/* key berisi kata kunci, status, dan halaman: setiap salah satunya berubah,
          DataDaftar dimulai dari awal. */}
      <DataDaftar
        key={`${search}|${status}|${halaman}`}
        search={search}
        status={status}
        halaman={halaman}
        onUbahHalaman={pindahHalaman}
      />
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