# CLAUDE.md

Aturan untuk siapa pun, manusia maupun asisten AI, yang bekerja di repositori bimaone-web. Isinya disusun dari brief tugas CRUD end-to-end BIMAONE. Kalau ada saran yang bertentangan dengan berkas ini, ikuti berkas ini.

## Tentang proyek
Antarmuka web BIMAONE untuk mengelola data master Brand dan Gudang. Frontend ini hanya klien dari API Go di repositori bimaone-api.

## Bahasa
Semua label, pesan di layar, komentar kode, pesan commit, dan deskripsi Pull Request memakai Bahasa Indonesia.

## Teknologi yang dikunci
Pilihan ini tidak boleh diganti tanpa izin mentor, termasuk kalau asisten AI menyarankan pustaka lain.
- Next.js (App Router) dengan TypeScript
- Tailwind CSS dan komponen shadcn/ui untuk form, tabel, dialog, dan notifikasi
- Pemanggilan API memakai fetch lewat satu berkas, lib/apiclient.ts
- Alamat dasar API dibaca dari NEXT_PUBLIC_API_URL
- Git dan GitHub, dua repositori: bimaone-api dan bimaone-web

## Larangan
1. Tidak memakai Server Actions.
2. Tidak memakai Route Handlers (folder app/api).
3. Tidak terhubung langsung ke basis data. Semua data lewat API Go.
4. Tidak menambah pustaka tanpa izin mentor.
5. Tidak menulis alamat, kata sandi, atau kredensial langsung di kode. Pakai .env.local dan sediakan .env.example.
6. Tidak menghapus data. Data master diarsipkan lewat archived_at.

## Kontrak API
Prefiks /api/v1/brands dan /api/v1/warehouses.
- GET (daftar), GET /{id}, POST (201), PUT /{id}, PATCH /{id}/archive, PATCH /{id}/restore
- Query daftar: search, status (active, archived, all; bawaan active), page (mulai 1), per_page (bawaan 10, maksimal 100). Urutan bawaan nama A sampai Z.
- Respons sukses: { "data": ..., "meta": { page, per_page, total, total_pages } }. Meta hanya untuk daftar.
- Respons galat: { "error": { "code", "message", "fields" } }
- Kode galat: 400 BAD_REQUEST, 404 NOT_FOUND, 409 DUPLICATE, 422 VALIDATION_ERROR, 500 INTERNAL_ERROR
- Tanggal memakai ISO 8601 UTC. Nama field JSON memakai snake_case.
- Perubahan kontrak harus disepakati berdua dan ditulis ulang dulu, baru diubah di kode.

## Aturan data
- Brand: name wajib, 2 sampai 100 karakter, unik tanpa membedakan huruf besar kecil, spasi di awal dan akhir dibuang. description opsional, maksimal 500 karakter.
- Gudang: code wajib, unik, huruf besar, maksimal 20 karakter. name wajib, 2 sampai 100 karakter. phone hanya angka, tanda +, spasi, dan tanda hubung. address dan pic_name opsional.
- Validasi dilakukan di frontend dan backend. Frontend memberi pesan cepat, backend tetap memvalidasi ulang.

## Halaman
Daftar (/brands), tambah (/brands/new), ubah (/brands/[id]/edit), dan yang serupa untuk /warehouses. Kata kunci pencarian dan nomor halaman disimpan di alamat halaman. Arsip memakai dialog konfirmasi.

Setiap halaman yang memanggil API wajib menangani empat kondisi:
1. Memuat: penanda pemuatan, tombol Simpan nonaktif saat mengirim.
2. Kosong: pesan berbeda untuk data belum ada dan hasil pencarian kosong.
3. Galat: pesan yang dimengerti pengguna dan tombol Coba lagi. Galat 422 dan 409 tampil di bawah kolom yang salah.
4. Berhasil: notifikasi konfirmasi, lalu kembali ke daftar.

## Aturan memakai AI
1. Kalau tidak bisa menjelaskan kodenya, jangan digabung.
2. Minta penjelasan, bukan hanya jawaban.
3. Satu langkah kecil per permintaan.
4. Ikuti berkas ini.
5. Jangan menambah pustaka tanpa izin.
6. Jalankan dan uji sendiri kode dari AI sebelum Pull Request.
7. Jangan menempelkan kata sandi, token, atau isi .env ke AI.

## Kesepakatan tim sementara
Bagian ini kesepakatan kami, bukan isi brief, dan boleh diubah mentor.
- Perubahan masuk ke main lewat Pull Request kecil yang sudah ditinjau, digabung dengan Squash and merge.
- Satu branch per tugas kecil, dibuat dari main yang terbaru, dihapus setelah digabung.
- Format pesan commit: jenis: kalimat pendek berbahasa Indonesia. Jenis yang dipakai: fitur, perbaikan, dokumen, rapikan.
- Komponen shadcn dipasang oleh satu orang lewat Pull Request, lalu anggota lain menjalankan git pull dan npm install.
- Komponen form shadcn belum terpasang pada konfigurasi ini, jadi form dibuat dari input, label, dan textarea.