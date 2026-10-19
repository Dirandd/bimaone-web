"use client"

// Baris alat di atas daftar: kotak cari dan tiga tombol filter status.
// "use client" wajib karena komponen ini menyimpan teks yang sedang diketik (state)
// dan menangani aksi klik.

import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ParameterDaftarBrand } from "@/lib/api/brands"

// Tipe status diambil dari tipe parameter daftar di lib/api/brands.ts supaya
// nilainya tidak ditulis dua kali: "active" | "archived" | "all".
// NonNullable membuang kemungkinan undefined, karena parameter itu bersifat opsional.
export type StatusDaftar = NonNullable<ParameterDaftarBrand["status"]>

// Pilihan filter yang ditampilkan. Nilai dikirim ke API, label dibaca pengguna.
const PILIHAN_STATUS: { nilai: StatusDaftar; label: string }[] = [
  { nilai: "active", label: "Aktif" },
  { nilai: "archived", label: "Arsip" },
  { nilai: "all", label: "Semua" },
]

// Props:
// - search dan status: nilai yang sedang berlaku, dibaca halaman dari alamat.
//   search juga dipakai untuk memutuskan perlu tidaknya tombol Reset.
// - onCari dan onUbahStatus: dipanggil saat pengguna mencari atau memilih status.
//   Komponen ini tidak mengubah alamat sendiri. Halaman yang memutuskannya.
type BrandToolbarProps = {
  search: string
  status: StatusDaftar
  onCari: (kataKunci: string) => void
  onUbahStatus: (status: StatusDaftar) => void
}

export function BrandToolbar({
  search,
  status,
  onCari,
  onUbahStatus,
}: BrandToolbarProps) {
  // Teks yang sedang diketik. Nilai awalnya diambil dari alamat. Halaman memberi
  // "key" berisi kata kunci, jadi komponen ini dibuat ulang saat alamat berubah
  // (misalnya setelah tombol Kembali) dan teksnya ikut disesuaikan.
  const [teks, setTeks] = useState(search)

  function kirim(event: FormEvent<HTMLFormElement>) {
    // Mencegah peramban memuat ulang halaman saat form dikirim.
    event.preventDefault()
    // Spasi di awal dan akhir dibuang sebelum dikirim ke halaman.
    onCari(teks.trim())
  }

  // Mengosongkan kotak cari dan menghapus kata kunci dari alamat.
  function hapusPencarian() {
    setTeks("")
    onCari("")
  }

  return (
    // flex-wrap supaya kotak cari dan tombol status turun ke baris baru di layar sempit.
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Kiri: kotak cari. Dibungkus form supaya tombol Enter juga mengirim pencarian.
          Lebarnya dibatasi max-w-sm, sama dengan toolbar Gudang. */}
      <form
        onSubmit={kirim}
        role="search"
        className="flex w-full max-w-sm items-center gap-2"
      >
        <Input
          value={teks}
          onChange={(event) => setTeks(event.target.value)}
          placeholder="Cari nama brand..."
          aria-label="Cari nama brand"
        />
        <Button type="submit">
          <Search />
          Cari
        </Button>
        {/* Reset hanya tampil kalau ada pencarian yang sedang berlaku. */}
        {search !== "" && (
          <Button type="button" variant="ghost" onClick={hapusPencarian}>
            Reset
          </Button>
        )}
      </form>

      {/* Kanan: tombol filter status. */}
      <div role="group" aria-label="Filter status brand" className="flex gap-2">
        {PILIHAN_STATUS.map((pilihan) => {
          const aktif = status === pilihan.nilai
          return (
            <Button
              key={pilihan.nilai}
              type="button"
              size="sm"
              // Tombol yang sedang berlaku tampil pekat, yang lain berbingkai.
              variant={aktif ? "default" : "outline"}
              // aria-pressed memberi tahu pembaca layar tombol mana yang sedang dipilih.
              aria-pressed={aktif}
              onClick={() => onUbahStatus(pilihan.nilai)}
            >
              {pilihan.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}