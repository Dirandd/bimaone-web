# BIMAONE Web

Repositori ini berisi antarmuka web (bagian depan) untuk aplikasi BIMAONE. Pada tahap latihan pertama, repositori ini memuat fitur kelola data master Brand dan Gudang yang berjalan dari tampilan layar sampai ke basis data, dengan data yang diambil dari repositori `bimaone-api` (bagian belakang).

## Cakupan Fitur

Setiap data master (Brand dan Gudang) memiliki kemampuan berikut:

- Melihat daftar data, dengan pencarian, penyaringan status (Aktif, Arsip, Semua), dan pembagian halaman
- Menambah data baru
- Mengubah data yang sudah ada
- Mengarsipkan data (data tidak dihapus, hanya ditandai sebagai arsip)
- Memulihkan data dari arsip

## Halaman

| Alamat | Fungsi |
|---|---|
| `/brands` | Daftar Brand |
| `/brands/new` | Form tambah Brand |
| `/brands/[id]/edit` | Form ubah Brand |
| `/warehouses` | Daftar Gudang |
| `/warehouses/new` | Form tambah Gudang |
| `/warehouses/[id]/edit` | Form ubah Gudang |

Seluruh label dan pesan di antarmuka memakai Bahasa Indonesia.

## Teknologi

- Next.js (App Router) dengan TypeScript
- Tailwind CSS dan shadcn/ui untuk tampilan
- `fetch` bawaan peramban untuk memanggil data, melalui satu berkas pusat di folder `lib`
- Git dan GitHub untuk pengelolaan versi

Alamat dasar layanan API dibaca dari variabel lingkungan `NEXT_PUBLIC_API_URL`.

## Aturan Penting

1. Semua data harus melalui API milik bagian belakang (Go). Tidak ada koneksi langsung ke basis data dari repositori ini.
2. Tidak memakai Server Actions maupun Route Handlers (folder `app/api`).
3. Tidak menambah pustaka baru tanpa izin mentor.
4. Tidak menulis alamat, kata sandi, atau kredensial langsung di dalam kode. Semuanya disimpan di berkas `.env.local`, dan contoh isinya disediakan di `.env.example`.
5. Data tidak dihapus, hanya diarsipkan.

## Kondisi Tampilan yang Wajib Ada

Setiap halaman yang memanggil API harus menangani empat kondisi:

1. **Memuat:** menampilkan penanda pemuatan, dan tombol Simpan nonaktif saat data dikirim.
2. **Kosong:** menampilkan pesan yang berbeda untuk data yang memang belum ada dan untuk hasil pencarian yang tidak ditemukan.
3. **Galat:** menampilkan pesan yang mudah dipahami beserta tombol Coba lagi. Galat validasi ditampilkan di bawah kolom yang bermasalah.
4. **Berhasil:** menampilkan notifikasi konfirmasi, lalu kembali ke daftar.

Kata kunci pencarian dan nomor halaman disimpan di alamat halaman (misalnya `?search=...&page=2`) agar tetap tersimpan saat halaman dimuat ulang atau dibagikan.

## Cara Menjalankan

Akan dilengkapi setelah fondasi proyek selesai dibuat dan dicoba.

## Pembagian Kerja

Pekerjaan dibagi dua pasangan, masing-masing terdiri dari satu pengembang bagian depan dan satu pengembang bagian belakang. Pasangan pertama mengerjakan Brand, pasangan kedua mengerjakan Gudang. Perubahan masuk ke cabang utama lewat Pull Request kecil yang ditinjau terlebih dahulu.