"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";

// Daftar menu sidebar. Menambah menu baru cukup menambah satu baris di sini.
const menu = [
  { label: "Brand", href: "/brands", icon: Tag },
  { label: "Gudang", href: "/warehouses", icon: Warehouse },
];

export function AppSidebar() {
  // Alamat halaman yang sedang dibuka, dipakai untuk menandai menu aktif
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-5 text-lg font-semibold">BIMAONE</div>

      <nav className="flex flex-col gap-1 px-2">
        {menu.map((item) => {
          const Icon = item.icon;
          // /warehouses/new dan /warehouses/1/edit tetap menyorot menu Gudang
          const aktif = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                aktif && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}