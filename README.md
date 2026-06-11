# Sistem Pakar Deteksi Dini Nomophobia

Sistem Pakar Deteksi Dini Nomophobia (*No Mobile Phone Phobia*) adalah sebuah aplikasi berbasis web yang dirancang untuk membantu pengguna mengidentifikasi tingkat kecemasan atau ketergantungan berlebih terhadap ponsel pintar. Sistem ini menggunakan metode **Certainty Factor (CF)** untuk menghitung nilai kepastian dari diagnosis berdasarkan gejala-gejala yang dipilih dan dirasakan oleh pengguna.

## Fitur Utama

* **Mesin Inferensi Certainty Factor (CF):** Menghitung kepastian diagnosis menggunakan metode *Similarly Concluded Rules* secara akurat.
* **Ambang Batas Dinamis (Dynamic Thresholds):** Penentuan tingkat keparahan (Ringan, Sedang, Berat, Akut) dikelola secara dinamis langsung dari MongoDB melalui panel admin.
* **Manajemen Data (Panel Admin):** CRUD untuk Gejala, Basis Pengetahuan, Opsi CF, Solusi, Tingkat Keparahan, dan Manajemen Pengguna.
* **Unduh Laporan PDF:** Hasil diagnosis dapat langsung diunduh dalam bentuk dokumen PDF.
* **Dukungan PWA (Progressive Web App):** Aplikasi dapat dipasang (*install*) di perangkat seluler maupun desktop untuk pengalaman pengguna yang lebih cepat dan responsif.
* **Keamanan Ketat:** Menggunakan `helmet` untuk proteksi *header*, pembatasan laju permintaan (`express-rate-limit`), enkripsi kata sandi dengan `bcryptjs`, dan autentikasi berbasis HTTP-only cookie JWT.

---

## Alur Perhitungan Certainty Factor

Perhitungan kalkulasi inferensi di dalam sistem ini mengikuti langkah-langkah berikut:

1. **CF Gejala Tunggal:** $CF(H,E) = CF_{user} \times CF_{pakar}$
2. **Kombinasi CF:** $CF_{combine} = CF_{old} + CF_{new} \times (1 - CF_{old})$
3. **Persentase Akhir:** Skor dikonversi menjadi persentase ($finalCF \times 100$).
4. **Klasifikasi:** Hasil dicocokkan dengan data tingkat keparahan yang tersimpan di MongoDB.

---

## Tech Stack

### Backend

* **Runtime:** Node.js
* **Framework:** Express.js (v5)
* **Database:** MongoDB & Mongoose
* **Keamanan & Utilitas:** JWT, Bcryptjs, Helmet, Cookie-Parser, Express Rate Limit, Express Validator, Morgan

### Frontend

* **Library & Build Tool:** React (v19) & Vite (v8)
* **State Management:** Zustand
* **Routing:** React Router DOM (v7)
* **Styling:** Tailwind CSS (v4), Framer Motion (Animasi), Shadcn UI, Lucide React
* **Fitur Tambahan:** Axios, Html2pdf.js, React Hot Toast, Vite Plugin PWA

---

## Cara Instalasi (Lokal)

Pastikan Anda sudah menginstal **Node.js** dan memiliki akun atau instansi database **MongoDB** yang aktif di perangkat Anda.

### 1. Clone Repositori

```bash
git clone https://github.com/Atheraf3/SistemPakarNomophobia/
cd sistempakarnomophobia

```

### 2. Konfigurasi & Jalankan Backend

1. Masuk ke direktori backend:
```bash
cd backend

```


2. Instal dependensi:
```bash
npm install

```


3. Buat berkas `.env` (bisa menyalin dari `.env.example`) dan sesuaikan konfigurasinya:
```env
PORT=5151
MONGO_URI=
JWT_SECRET=
NODE_ENV=

```


4. Jalankan server dalam mode pengembangan:
```bash
npm run dev

```



### 3. Konfigurasi & Jalankan Frontend

1. Buka terminal baru dan masuk ke direktori frontend:
```bash
cd ../frontend

```


2. Instal dependensi:
```bash
npm install

```


3. Jalankan aplikasi frontend:
```bash
npm run dev

```


4. Buka tautan lokal yang tertera pada terminal (biasanya `http://localhost:5173`) di peramban Anda.

---

## Cara Deployment

Proyek ini telah dilengkapi dengan berkas konfigurasi `vercel.json` baik pada sisi backend maupun frontend sehingga sangat siap di-deploy menggunakan platform **Vercel**.

### Deployment Backend ke Vercel

1. Pastikan Anda telah memasang Vercel CLI (`npm i -g vercel`).
2. Masuk ke direktori `backend` dan jalankan perintah:
```bash
vercel

```


3. Ikuti instruksi pada terminal untuk menghubungkan proyek.
4. Jangan lupa menambahkan **Environment Variables** (`MONGO_URI`, `JWT_SECRET`, dll.) di dashboard Vercel Anda sebelum melakukan tahap *production deployment* (`vercel --prod`).

### Deployment Frontend ke Vercel

1. Masuk ke direktori `frontend`.
2. Pastikan konfigurasi base URL API (Axios) Anda mengarah ke URL backend produksi Vercel yang telah dibuat sebelumnya.
3. Jalankan perintah:
```bash
vercel

```


4. Ikuti instruksi pendeploian hingga selesai, lalu lakukan rilis final menggunakan `vercel --prod`.

---
