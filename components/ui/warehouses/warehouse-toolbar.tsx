"use client"

// "use client" wajib karena toolbar ini menyimpan teks yang sedang diketik (useState).

import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Nilai status yang dikenal API: GET /api/v1/warehouses?status=...
export type StatusDaftar = "active" | "archived" | "all"

// Urutan dan tulisan tombol. Menambah pilihan cukup menambah satu baris di sini.
const PILIHAN_STATUS: { nilai: StatusDaftar; label: string }[] = [
  { nilai: "active", label: "Aktif" },
  { nilai: "archived", label: "Arsip" },
  { nilai: "all", label: "Semua" },
]

// Props: data dan aksi yang diberikan halaman induk.
// - search: kata kunci yang sedang berlaku, dibaca dari alamat. Dipakai sebagai isi
//   awal kotak cari dan untuk memutuskan perlu tidaknya tombol Reset.
// - status: pilihan filter yang sedang aktif. Tombolnya tampil terisi.
// - onCari: dipanggil saat pengguna menekan Cari atau Enter. Toolbar tidak mengubah
//   alamat sendiri, halaman yang memutuskan apa yang terjadi.
// - onUbahStatus: dipanggil saat tombol status lain diklik.
type WarehouseToolbarProps = {
  search: string
  status: StatusDaftar
  onCari: (kataKunci: string) => void
  onUbahStatus: (status: StatusDaftar) => void
}

export function WarehouseToolbar({
  search,
  status,
  onCari,
  onUbahStatus,
}: WarehouseToolbarProps) {
  // Teks yang sedang diketik. Nilai awalnya diambil dari alamat. Setelah itu berubah
  // setiap ketikan, tetapi alamat dan data baru berubah saat pengguna menekan Cari.
  // Supaya kotak ini mengikuti alamat (misalnya saat tombol Kembali ditekan), halaman
  // induk memberi komponen ini "key" berisi kata kunci, jadi dibuat ulang tiap berubah.
  const [teks, setTeks] = useState(search)

  function kirimPencarian(event: FormEvent<HTMLFormElement>) {
    // Mencegah peramban memuat ulang halaman saat form dikirim.
    event.preventDefault()
    // Spasi di awal dan akhir dibuang. Teks kosong berarti pencarian dihapus.
    onCari(teks.trim())
  }

  function hapusPencarian() {
    setTeks("")
    onCari("")
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Kiri: kotak cari. Dibungkus form supaya tombol Enter juga mengirim pencarian. */}
      <form
        onSubmit={kirimPencarian}
        role="search"
        className="flex w-full max-w-sm items-center gap-2"
      >
        <Input
          value={teks}
          onChange={(event) => setTeks(event.target.value)}
          placeholder="Cari kode atau nama gudang..."
          aria-label="Cari gudang"
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
      <div role="group" aria-label="Filter status gudang" className="flex gap-2">
        {PILIHAN_STATUS.map((pilihan) => {
          const terpilih = status === pilihan.nilai

          return (
            <Button
              key={pilihan.nilai}
              type="button"
              size="sm"
              // Pilihan aktif tampil terisi, yang lain hanya berbingkai.
              variant={terpilih ? "default" : "outline"}
              // Memberi tahu pembaca layar mana tombol yang sedang dipilih.
              aria-pressed={terpilih}
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