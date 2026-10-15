"use client"

// "use client" wajib karena komponen ini memakai state dan menangani aksi klik.

import Link from "next/link"
import { useState, type FormEvent } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { DataGudang } from "@/lib/api/warehouses"
// cn menggabungkan kelas supaya kelas yang bertabrakan (border-transparent dan
// border-border) tidak keduanya terpasang. Tanpa ini bingkai tombol Batal tidak tampil.
import { cn } from "@/lib/utils"

// Props: data yang diberikan halaman induk ke form ini.
// - nilaiAwal: isi awal kolom. Kosong untuk form tambah, terisi untuk form ubah nanti.
// - teksTombol: tulisan di tombol kirim, misalnya "Simpan".
// - onKirim: fungsi dari halaman yang benar-benar memanggil API. Form ini sengaja
//   tidak memanggil API sendiri supaya bisa dipakai ulang untuk tambah dan ubah.
type WarehouseFormProps = {
  nilaiAwal?: DataGudang
  teksTombol: string
  onKirim: (data: DataGudang) => Promise<void>
}

// Telepon hanya boleh berisi angka, +, spasi, dan -
const POLA_TELEPON = /^[0-9+\- ]+$/

type IsianForm = {
  kode: string
  nama: string
  namaPic: string
  telepon: string
}

// Validasi cepat di sisi Frontend, sesuai aturan data Gudang di brief.
// Backend tetap memvalidasi ulang, karena Backend tidak boleh percaya data dari Frontend.
// Hasilnya berupa objek: kunci adalah nama kolom di API (code, name, pic_name, phone),
// nilai adalah pesan galatnya. Bentuknya sengaja sama dengan "fields" dari API,
// supaya cara menampilkannya satu.
function periksaData({ kode, nama, namaPic, telepon }: IsianForm): Record<string, string> {
  const hasil: Record<string, string> = {}
  const kodeBersih = kode.trim()
  const namaBersih = nama.trim()
  const namaPicBersih = namaPic.trim()
  const teleponBersih = telepon.trim()

  if (kodeBersih === "") {
    hasil.code = "Kode wajib diisi"
  } else if (kodeBersih.length > 20) {
    hasil.code = "Kode maksimal 20 karakter"
  }

  if (namaBersih === "") {
    hasil.name = "Nama wajib diisi"
  } else if (namaBersih.length < 2) {
    hasil.name = "Nama minimal 2 karakter"
  } else if (namaBersih.length > 100) {
    hasil.name = "Nama maksimal 100 karakter"
  }

  if (namaPicBersih.length > 100) {
    hasil.pic_name = "Nama PIC maksimal 100 karakter"
  }

  // Telepon boleh kosong, tapi kalau diisi harus sesuai aturan.
  if (teleponBersih !== "") {
    if (teleponBersih.length > 20) {
      hasil.phone = "Telepon maksimal 20 karakter"
    } else if (!POLA_TELEPON.test(teleponBersih)) {
      hasil.phone = "Telepon hanya boleh berisi angka, +, spasi, dan -"
    }
  }

  return hasil
}

// Isian opsional yang kosong dikirim sebagai null, sama seperti bentuk data dari API.
// Cara yang diharapkan Backend belum dijawab, jadi fungsi ini bisa berubah.
function kosongJadiNull(teks: string): string | null {
  const bersih = teks.trim()
  return bersih === "" ? null : bersih
}

export function WarehouseForm({ nilaiAwal, teksTombol, onKirim }: WarehouseFormProps) {
  // Isi kolom. Kolom opsional memakai teks kosong, bukan null, karena kolom
  // teks di layar selalu berisi teks.
  const [kode, setKode] = useState(nilaiAwal?.code ?? "")
  const [nama, setNama] = useState(nilaiAwal?.name ?? "")
  const [alamat, setAlamat] = useState(nilaiAwal?.address ?? "")
  const [namaPic, setNamaPic] = useState(nilaiAwal?.pic_name ?? "")
  const [telepon, setTelepon] = useState(nilaiAwal?.phone ?? "")

  // Pesan galat per kolom, dan satu pesan umum untuk galat yang bukan milik kolom.
  const [galatKolom, setGalatKolom] = useState<Record<string, string>>({})
  const [galatUmum, setGalatUmum] = useState("")

  // Benar selama data sedang dikirim. Dipakai untuk menonaktifkan tombol Simpan
  // supaya form tidak terkirim dua kali, sesuai brief.
  const [sedangMengirim, setSedangMengirim] = useState(false)

  async function kirim(event: FormEvent<HTMLFormElement>) {
    // Mencegah peramban memuat ulang halaman saat form dikirim.
    event.preventDefault()

    // Langkah 1: periksa di Frontend. Kalau ada yang salah, berhenti di sini
    // dan tampilkan pesan di bawah kolomnya, tanpa memanggil API.
    const hasilPeriksa = periksaData({ kode, nama, namaPic, telepon })
    setGalatKolom(hasilPeriksa)
    setGalatUmum("")
    if (Object.keys(hasilPeriksa).length > 0) return

    // Langkah 2: kirim lewat fungsi dari halaman induk.
    setSedangMengirim(true)
    try {
      await onKirim({
        code: kode.trim(),
        name: nama.trim(),
        address: kosongJadiNull(alamat),
        pic_name: kosongJadiNull(namaPic),
        phone: kosongJadiNull(telepon),
      })
      // Berhasil: halaman induk yang pindah halaman. Tombol sengaja dibiarkan
      // nonaktif sampai halaman berpindah, supaya form tidak terkirim dua kali.
    } catch (galat: unknown) {
      if (galat instanceof GalatApi && (galat.status === 409 || galat.status === 422)) {
        // 409 (kode sudah dipakai) dan 422 (data tidak valid) membawa "fields":
        // tampilkan di bawah kolom yang salah. Kalau "fields" kosong, pakai pesan umum.
        if (Object.keys(galat.fields).length > 0) {
          setGalatKolom(galat.fields)
        } else {
          setGalatUmum(galat.message)
        }
      } else if (galat instanceof GalatApi || galat instanceof GalatJaringan) {
        setGalatUmum(galat.message)
      } else {
        setGalatUmum("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
      }
      // Gagal: aktifkan tombol kembali supaya pengguna bisa memperbaiki dan mencoba lagi.
      setSedangMengirim(false)
    }
  }

  return (
    // max-w-xl membatasi lebar form supaya tidak melebar penuh di layar besar.
    <form onSubmit={kirim} className="max-w-xl space-y-6" noValidate>
      {/* Galat umum: tampil di atas form kalau galatnya bukan milik satu kolom. */}
      {galatUmum !== "" && (
        <p className="rounded-md border border-destructive/50 p-3 text-sm text-destructive">
          {galatUmum}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="kode">Kode Gudang</Label>
        <Input
          id="kode"
          value={kode}
          // Kode selalu huruf besar, sesuai aturan data Gudang.
          onChange={(event) => setKode(event.target.value.toUpperCase())}
          placeholder="Contoh: GDG-DPS-01"
          aria-invalid={galatKolom.code ? true : undefined}
          disabled={sedangMengirim}
        />
        {/* Pesan galat tepat di bawah kolom yang salah. */}
        {galatKolom.code && (
          <p className="text-sm text-destructive">{galatKolom.code}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama">Nama Gudang</Label>
        <Input
          id="nama"
          value={nama}
          onChange={(event) => setNama(event.target.value)}
          placeholder="Contoh: Gudang Utama Denpasar"
          aria-invalid={galatKolom.name ? true : undefined}
          disabled={sedangMengirim}
        />
        {galatKolom.name && (
          <p className="text-sm text-destructive">{galatKolom.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="alamat">Alamat (opsional)</Label>
        <Textarea
          id="alamat"
          value={alamat}
          onChange={(event) => setAlamat(event.target.value)}
          aria-invalid={galatKolom.address ? true : undefined}
          disabled={sedangMengirim}
        />
        {galatKolom.address && (
          <p className="text-sm text-destructive">{galatKolom.address}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nama-pic">Penanggung Jawab / PIC (opsional)</Label>
        <Input
          id="nama-pic"
          value={namaPic}
          onChange={(event) => setNamaPic(event.target.value)}
          aria-invalid={galatKolom.pic_name ? true : undefined}
          disabled={sedangMengirim}
        />
        {galatKolom.pic_name && (
          <p className="text-sm text-destructive">{galatKolom.pic_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="telepon">Telepon (opsional)</Label>
        <Input
          id="telepon"
          value={telepon}
          onChange={(event) => setTelepon(event.target.value)}
          placeholder="Contoh: +62 361 123 456"
          aria-invalid={galatKolom.phone ? true : undefined}
          disabled={sedangMengirim}
        />
        {galatKolom.phone && (
          <p className="text-sm text-destructive">{galatKolom.phone}</p>
        )}
      </div>

      <div className="flex gap-2">
        {/* type="submit" memicu fungsi kirim. Nonaktif saat sedang mengirim. */}
        <Button type="submit" disabled={sedangMengirim}>
          {sedangMengirim ? "Menyimpan..." : teksTombol}
        </Button>

        {/* Button shadcn di proyek ini tidak punya asChild, jadi tautan dibuat
            tampak seperti tombol lewat buttonVariants, dibungkus cn(...)
            supaya bingkai varian outline tampil. */}
        <Link
          href="/warehouses"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Batal
        </Link>
      </div>
    </form>
  )
}