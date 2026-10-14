import { redirect } from "next/navigation";

// Halaman awal tidak punya isi sendiri, langsung arahkan ke daftar Gudang.
export default function Home() {
  redirect("/warehouses");
}