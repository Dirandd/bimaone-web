"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const daftarMenu = [
  { nama: "Brand", alamat: "/brands" },
  { nama: "Gudang", alamat: "/warehouses" },
]

export function SidebarAplikasi() {
  const alamatSaatIni = usePathname()

  return (
     <aside className="min-h-screen w-56 border-r p-4">
      <nav className="space-y-2">
        {daftarMenu.map((menu) => {
          const aktif =
            alamatSaatIni === menu.alamat ||
            alamatSaatIni.startsWith(`${menu.alamat}/`)

          return (
            <Link
              key={menu.alamat}
              href={menu.alamat}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                aktif
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {menu.nama}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
