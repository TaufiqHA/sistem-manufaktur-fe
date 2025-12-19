# Alur Kerja Aplikasi GondolaFlow MES (Manufacturing Execution System)

## Deskripsi Umum
GondolaFlow MES adalah aplikasi berbasis web untuk mengelola dan memonitor proses produksi manufaktur. Sistem ini dirancang untuk mengelola proyek produksi, material, mesin, serta pelaporan produksi secara real-time.

## Teknologi yang Digunakan
- **Frontend**: React 19 dengan TypeScript
- **Routing**: React Router DOM
- **State Management**: Zustand
- **UI Components**: React dan Lucide React Icons
- **Charts**: Recharts
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (tersirat)

## Struktur Proyek
'gondolaflow-mes/
├── App.tsx                 # Rute utama aplikasi
├── index.tsx               # Entry point aplikasi
├── types.ts                # Definisi tipe data utama
├── components/
│   └── Layout.tsx          # Komponen layout utama
├── pages/
│   ├── Dashboard.tsx       # Halaman dashboard
│   └── [Halaman lainnya]
├── store/
│   └── useStore.ts         # Store Zustand untuk state global
├── lib/
│   └── mockData.ts         # Data mock untuk pengembangan
'

## Arsitektur dan Alur Kerja

### 1. Arsitektur Aplikasi
- Aplikasi dibangun dengan pendekatan **Single Page Application (SPA)**
- State disimpan secara global menggunakan **Zustand**
- Data disimpan di dalam store (mock data saat ini, bisa dikembangkan ke API/DB sebenarnya)
- Routing dilakukan menggunakan React Router dengan hash routing

### 2. Proses dan Alur Produksi
Alur kerja sistem produksi mengikuti langkah-langkah berikut:

#### A. Pembuatan Proyek
1. Pengguna membuat proyek baru melalui modul Proyek
2. Proyek memiliki informasi seperti nama, klien, tanggal mulai, deadline, jumlah produksi, dll.
3. Proyek harus divalidasi untuk berpindah dari status "PLANNED" ke "IN_PROGRESS"

#### B. Pembuatan Item Proyek
1. Setiap proyek terdiri dari satu atau lebih item
2. Setiap item memiliki dimensi, ketebalan, dan jumlah yang akan diproduksi
3. Item memiliki Bom (Bill of Materials) yang menentukan material yang diperlukan

#### C. Manajemen BOM (Bill of Materials)
1. Pengguna menentukan material dan jumlah per unit untuk setiap item
2. BOM dikunci setelah diverifikasi
3. Jumlah material yang dibutuhkan dihitung otomatis berdasarkan jumlah produksi

#### D. Konfigurasi Workflow Produksi
1. Untuk setiap item, dibuat workflow yang menentukan proses produksi
2. Workflow terdiri dari serangkaian langkah proses (Potong, Plong, Press, Las, WT, Powder, QC)
3. Setiap langkah ditetapkan ke mesin tertentu dan jumlah target produksi
4. Workflow dikunci setiap kali diperbarui

#### E. Pembuatan Task Produksi
1. Berdasarkan workflow, sistem membuat task-task produksi
2. Setiap task terkait dengan item, langkah proses, dan mesin
3. Setiap task memiliki target jumlah produksi dan status

#### F. Pelaksanaan Produksi
1. Operator melaporkan output produksi (jumlah bagus dan cacat) untuk setiap task
2. Material dikonsumsi hanya pada langkah pertama (POTONG) berdasarkan jumlah yang diproses
3. Status task dan mesin diperbarui secara real-time
4. Log produksi dicatat termasuk shift, operator, dan waktu

#### G. Monitoring dan Pelaporan
1. Dashboard menampilkan KPI (KPI) produksi
2. Statistik mesin (berjalan, idle, maintenance)
3. Peringatan stok rendah
4. Laporan historis produksi

### 3. Manajemen Data
- **Proyek**: Informasi dasar tentang pesanan produksi
- **Material**: Stok bahan baku, finishing, hardware
- **Mesin**: Kapasitas, status, tugas shift
- **Pengguna**: Autorisasi berdasarkan role (Admin, Operator, Manager)
- **Task**: Tugas produksi spesifik
- **Log Produksi**: Catatan aktivitas produksi

### 4. Manajemen Otentikasi dan Otorisasi
1. Sistem login untuk otentikasi pengguna
2. Hak akses berbeda-beda tergantung role (Admin, Operator, Manager)
3. Otorisasi fitur berdasarkan perizinan per modul dan aksi (view, create, edit, delete)
4. Info user tersimpan di localStorage

### 5. Fitur-fitur Utama
- **Dashboard**: Ringkasan produksi real-time
- **Manajemen Proyek**: Buat, edit, validasi proyek
- **Master Material**: Kelola bahan baku dan stok
- **Master Mesin**: Kelola mesin dan kapasitas
- **Operator Board**: Antarmuka untuk operator produksi
- **Monitoring Produksi**: Pantau kemajuan task dan status mesin
- **Pelaporan**: Analisis dan riwayat produksi
- **Pengaturan Pengguna**: Manajemen akun dan izin

### 6. Alur UI/UX
1. Pengguna membuka aplikasi dan diarahkan ke halaman login jika belum login
2. Setelah login, tampilan utama dengan sidebar navigasi
3. Sidebar menyaring item menu berdasarkan izin pengguna
4. Setiap halaman menampilkan formulir atau tabel sesuai fungsinya
5. Semua interaksi meng-update store global secara real-time

### 7. Tipe Data Utama
- **Project**: Informasi proyek produksi
- **Material**: Informasi stok bahan baku
- **Machine**: Informasi mesin produksi
- **Task**: Tugas produksi spesifik
- **User**: Data pengguna dan hak akses
- **ProductionLog**: Catatan aktivitas produksi
- **ProcessStep**: Langkah-langkah produksi (Potong, Press, Las, dsb)

### 8. Pola Desain
- **Global State Management**: Zustand digunakan untuk menyimpan semua data aplikasi
- **Component-based Architecture**: UI dibagi menjadi komponen-komponen reusable
- **Mock Data Pattern**: Saat ini menggunakan data statis (akan mudah dikembangkan ke API)
- **Role-based Access Control**: Hak akses disesuaikan dengan role dan izin user
