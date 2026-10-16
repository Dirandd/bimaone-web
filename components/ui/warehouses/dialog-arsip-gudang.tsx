"use client"

// Dialog konfirmasi sebelum mengarsipkan. Brief mewajibkannya untuk arsip.
// "use client" wajib karena dialog menangani aksi klik dan penutupan.

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Warehouse } from "@/lib/types"

// Props:
// - gudang: gudang yang akan diarsipkan. Null berarti dialog tertutup.
// - sedangMemproses: benar selama permintaan ke API berjalan.
// - onBatal: dipanggil saat pengguna membatalkan.
// - onKonfirmasi: dipanggil saat pengguna menekan Arsipkan.
type DialogArsipGudangProps = {
  gudang: Warehouse | null
  sedangMemproses: boolean
  onBatal: () => void
  onKonfirmasi: () => void
}

export function DialogArsipGudang({
  gudang,
  sedangMemproses,
  onBatal,
  onKonfirmasi,
}: DialogArsipGudangProps) {
  return (
    <Dialog
      // Dialog terbuka selama ada gudang yang dipilih.
      open={gudang !== null}
      onOpenChange={(buka) => {
        // Dipanggil saat dialog ditutup lewat tombol Esc atau klik di luar kotak.
        // Selama permintaan berjalan, penutupan diabaikan supaya tidak membingungkan.
        if (!buka && !sedangMemproses) onBatal()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arsipkan gudang?</DialogTitle>
          <DialogDescription>
            Gudang <strong>{gudang?.name}</strong> ({gudang?.code}) akan dipindahkan
            ke arsip dan tidak tampil di daftar aktif. Data tidak dihapus dan bisa
            dipulihkan kapan saja.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onBatal} disabled={sedangMemproses}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onKonfirmasi}
            disabled={sedangMemproses}
          >
            {sedangMemproses ? "Mengarsipkan..." : "Arsipkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}