import { redirect } from "next/navigation";

// Halaman awal tidak punya isi sendiri, langsung arahkan ke daftar Brand.
export default function Home() {
  redirect("/brands");
}