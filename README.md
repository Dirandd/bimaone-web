## Cara Menjalankan

### Prasyarat
- Node.js versi 22 dan npm.
- API Backend (repositori bimaone-api) sudah berjalan, dan laptop ini berada di jaringan Wi-Fi yang sama dengan laptop Backend.

### Langkah
1. Ambil repositori dan pasang paket:

```bash
   git clone <alamat repositori bimaone-web>
   cd bimaone-web
   npm install
```

2. Salin contoh pengaturan, lalu isi alamat API milik Backend:

```bash
   cp .env.example .env.local
```

   Buka .env.local dan ubah nilai NEXT_PUBLIC_API_URL menjadi alamat API, misalnya http://192.168.1.23:8080 (tanpa garis miring di akhir). Berkas .env.local tidak ikut Git, jadi isinya tidak terkirim ke GitHub.

3. Jalankan server pengembangan:

```bash
   npm run dev
```

4. Buka http://localhost:3000/brands di peramban.

### Hal yang perlu diperhatikan
- Frontend harus berjalan di port 3000, karena Backend hanya mengizinkan asal http://localhost:3000. Kalau port 3000 terpakai, hentikan proses lamanya dulu.
- Nilai NEXT_PUBLIC_API_URL dibaca saat server dimulai. Setiap .env.local berubah, hentikan npm run dev lalu jalankan ulang.
- Alamat IP laptop Backend bisa berubah, jadi periksa ulang setiap pagi. Pastikan alamat itu bisa dibuka lebih dulu: http://[alamat API]/health harus menampilkan status ok.

### Perintah lain
- npm run lint: memeriksa kualitas kode.
- npx tsc --noEmit: memeriksa tipe TypeScript.
- npm run build: membangun versi produksi.

### Kalau galat
| Gejala | Kemungkinan penyebab |
|---|---|
| ERR_CONNECTION_REFUSED di Console | Tidak ada yang mendengarkan di alamat itu: API belum berjalan, atau .env.local masih localhost |
| ERR_CONNECTION_TIMED_OUT | Permintaan tidak sampai: beda jaringan Wi-Fi, atau firewall di laptop Backend |
| blocked by CORS policy | API menyala, tetapi belum mengizinkan asal http://localhost:3000 atau belum menjawab permintaan OPTIONS dengan status sukses |