"use client"

// "use client" wajib karena komponen ini memakai state dan menangani aksi klik.

import Link from "next/link"
import { useState, type FormEvent } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GalatApi, GalatJaringan } from "@/lib/apiclient"
import type { DataBrand } from "@/lib/api/brands"
// DIPERBAIKI: cn dipakai untuk menggabungkan kelas supaya kelas yang bertabrakan
// (border-transparent dan border-border) tidak keduanya terpasang.
import { cn } from "@/lib/utils"

// Props: data yang diberikan halaman induk ke form ini.
// - nilaiAwal: isi awal kolom. Kosong untuk form tambah, terisi untuk form ubah nanti.
// - teksTombol: tulisan di tombol kirim, misalnya "Simpan".
// - onKirim: fungsi dari halaman yang benar-benar memanggil API. Form ini sengaja
//   tidak memanggil API sendiri supaya bisa dipakai ulang untuk tambah dan ubah.
type BrandFormProps = {
  nilaiAwal?: DataBrand
  teksTombol: string
  onKirim: (data: DataBrand) => Promise<void>
}

// Validasi cepat di sisi Frontend, sesuai aturan data Brand di brief.
// Backend tetap memvalidasi ulang, karena Backend tidak boleh percaya data dari Frontend.
// Hasilnya berupa objek: kunci adalah nama kolom, nilai adalah pesan galatnya.
// Bentuknya sengaja sama dengan "fields" dari API, supaya cara menampilkannya satu.
function periksaData(nama: string, deskripsi: string): Record<string, string> {
  const hasil: Record<string, string> = {}
  const namaBersih = nama.trim()

  if (namaBersih === "") {
    hasil.name = "Nama wajib diisi"
  } else if (namaBersih.length < 2) {
    hasil.name = "Nama minimal 2 karakter"
  } else if (namaBersih.length > 100) {
    hasil.name = "Nama maksimal 100 karakter"
  }

  if (deskripsi.length > 500) {
    hasil.description = "Deskripsi maksimal 500 karakter"
  }

  return hasil
}

export function BrandForm({ nilaiAwal, teksTombol, onKirim }: BrandFormProps) {
  // Isi kolom. Kolom deskripsi memakai teks kosong, bukan null, karena kolom
  // teks di layar selalu berisi teks.
  const [nama, setNama] = useState(nilaiAwal?.name ?? "")
  const [deskripsi, setDeskripsi] = useState(nilaiAwal?.description ?? "")

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
    const hasilPeriksa = periksaData(nama, deskripsi)
    setGalatKolom(hasilPeriksa)
    setGalatUmum("")
    if (Object.keys(hasilPeriksa).length > 0) return

    // Langkah 2: kirim lewat fungsi dari halaman induk.
    setSedangMengirim(true)
    try {
      await onKirim({
        name: nama.trim(),
        // Deskripsi kosong dikirim sebagai null. Cara yang diharapkan Backend
        // belum dijawab, jadi baris ini bisa berubah.
        description: deskripsi.trim() === "" ? null : deskripsi.trim(),
      })
    } catch (galat: unknown) {
      if (galat instanceof GalatApi && (galat.status === 409 || galat.status === 422)) {
        // 409 (nama sudah dipakai) dan 422 (data tidak valid) membawa "fields":
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
    } finally {
      // Selalu dijalankan, berhasil atau gagal, supaya tombol aktif kembali.
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
        <Label htmlFor="nama">Nama</Label>
        <Input
          id="nama"
          value={nama}
          onChange={(event) => setNama(event.target.value)}
          aria-invalid={galatKolom.name ? true : undefined}
          disabled={sedangMengirim}
        />
        {/* Pesan galat tepat di bawah kolom yang salah. */}
        {galatKolom.name && (
          <p className="text-sm text-destructive">{galatKolom.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi (opsional)</Label>
        <Textarea
          id="deskripsi"
          value={deskripsi}
          onChange={(event) => setDeskripsi(event.target.value)}
          aria-invalid={galatKolom.description ? true : undefined}
          disabled={sedangMengirim}
        />
        {galatKolom.description && (
          <p className="text-sm text-destructive">{galatKolom.description}</p>
        )}
      </div>

      <div className="flex gap-2">
        {/* type="submit" memicu fungsi kirim. Nonaktif saat sedang mengirim. */}
        <Button type="submit" disabled={sedangMengirim}>
          {sedangMengirim ? "Menyimpan..." : teksTombol}
        </Button>

        {/* Button shadcn di proyek ini tidak punya asChild, jadi tautan dibuat
            tampak seperti tombol lewat buttonVariants.
            DIPERBAIKI: dibungkus cn(...) supaya bingkai varian outline tampil. */}
        <Link
          href="/brands"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Batal
        </Link>
      </div>
    </form>
  )
}