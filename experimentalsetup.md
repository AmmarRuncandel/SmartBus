# G. Experimental Setup

Bagian ini menjelaskan konfigurasi eksperimen yang digunakan untuk mengevaluasi performa algoritma pencarian rute pada proyek SmartBus.

## 1. Dataset yang Digunakan

Eksperimen menggunakan dataset terminal bus nyata dengan sumber publik berikut:

- OpenStreetMap Nominatim (geocoding terminal): https://nominatim.openstreetmap.org/
- OSRM public API (jarak rute jalan): https://router.project-osrm.org/
- Dokumentasi OSRM API: https://project-osrm.org/docs/v5.24.0/api/

Contoh link query terminal yang dipakai (Nominatim):

- Tasikmalaya: https://nominatim.openstreetmap.org/search?q=Terminal%20Tipe%20A%20Tasikmalaya&format=jsonv2
- Garut: https://nominatim.openstreetmap.org/search?q=Terminal%20Guntur%20Garut&format=jsonv2
- Bandung: https://nominatim.openstreetmap.org/search?q=Terminal%20Leuwipanjang%20Bandung&format=jsonv2
- Sumedang: https://nominatim.openstreetmap.org/search?q=Terminal%20Sumedang&format=jsonv2
- Cirebon: https://nominatim.openstreetmap.org/search?q=Terminal%20Harjamukti%20Cirebon&format=jsonv2
- Purwakarta: https://nominatim.openstreetmap.org/search?q=Terminal%20Purwakarta&format=jsonv2
- Bekasi: https://nominatim.openstreetmap.org/search?q=Terminal%20Bekasi&format=jsonv2
- Jakarta: https://nominatim.openstreetmap.org/search?q=Terminal%20Kampung%20Rambutan%20Jakarta&format=jsonv2

Lokasi file dataset pada repository (untuk reproduksi):

- app/lib/data/smartbus-dataset.json
- app/lib/data/smartbus-terminal-sources.csv

Sumber data:

- Lokasi terminal: OpenStreetMap Nominatim
- Jarak jalan antarterminal: OSRM (Open Source Routing Machine)
- Heuristic A*: jarak garis lurus geografis (straight-line / haversine) menuju Jakarta

Ruang lingkup wilayah:

- Koridor Jawa Barat - DKI Jakarta
- Terminal mencakup: Tasikmalaya, Garut, Bandung, Sumedang, Cirebon, Purwakarta, Bekasi, Jakarta

## 2. Ukuran Data

Dataset eksperimen memiliki karakteristik berikut:

- Jumlah node (terminal): 8
- Jumlah sisi berarah (directed edges): 20
- Jumlah sisi tak berarah unik (undirected unique edges): 10
- Bobot sisi: jarak jalan dalam kilometer (roadDistanceKm)

Representasi graf:

- Adjacency list (tetangga tiap terminal)
- Bobot non-negatif pada semua edge
- Struktur data cocok untuk UCS, A*, dan Hybrid A*-UCS

Catatan:

- Ukuran data saat ini termasuk small graph.
- Dampak eksperimen lebih terlihat pada pola eksplorasi node, stabilitas waktu, dan penggunaan frontier dibanding selisih waktu absolut yang besar.

## 3. Tools / Bahasa Pemrograman

Implementasi dan pengujian dilakukan dengan stack berikut:

- Bahasa pemrograman: TypeScript
- Framework aplikasi: Next.js 16.2.1 (App Router)
- Library UI: React 19.2.4, lucide-react
- Styling: Tailwind CSS v4
- Linting: ESLint v9
- Testing: Vitest v4.1.4
- Runtime pengembangan: Node.js + npm scripts

Script utama eksperimen:

- npm run dev: menjalankan aplikasi untuk simulasi interaktif
- npm run lint: validasi kualitas kode
- npm test: menjalankan unit test algoritma dan benchmark

## 4. Skenario Pengujian

Eksperimen dibagi ke beberapa skenario agar hasil dapat dianalisis secara komprehensif.

### 4.1 Skenario Komparasi Algoritma

Tujuan:

- Membandingkan UCS dan A* pada pasangan asal-tujuan yang sama.

Langkah:

1. Pilih mode simulasi Comparasi (A* vs UCS).
2. Pilih node asal dan tujuan.
3. Jalankan simulasi.
4. Catat metrik:
   - totalCost
   - nodesVisited
   - executionTime
   - maxQueueSize
5. Ulangi untuk beberapa pasangan rute.

### 4.2 Skenario Hybrid Algorithm

Tujuan:

- Mengevaluasi perilaku algoritma Hybrid A*-UCS sebagai satu pipeline pencarian.

Langkah:

1. Pilih mode simulasi Hybrid (A* + UCS menyatu).
2. Gunakan pasangan asal-tujuan yang sama seperti skenario komparasi.
3. Jalankan simulasi.
4. Catat metrik yang sama untuk membandingkan efisiensi praktis.

### 4.3 Skenario Benchmark Multi-Run

Tujuan:

- Mengurangi noise runtime dan memperoleh statistik yang lebih stabil.

Langkah:

1. Gunakan mode Comparasi.
2. Pilih jumlah run benchmark (10, 25, 50, atau 100).
3. Jalankan benchmark (dengan warm-up internal).
4. Analisis statistik:
   - mean
   - median
   - standard deviation
   - min-max range
   - stablePath

### 4.4 Skenario Validasi Kebenaran Solusi

Tujuan:

- Memastikan rute yang dihasilkan tetap optimal dan valid.

Langkah:

1. Jalankan npm test.
2. Verifikasi:
   - heuristic admissible dan consistent
   - biaya jalur A* setara UCS pada rute acuan
   - hasil Hybrid valid dan mencapai goal

## 5. Output Eksperimen yang Dilaporkan

Untuk tiap skenario, keluaran yang direkomendasikan dalam laporan penelitian:

- Rute final (urutan terminal)
- Total biaya rute (km)
- Jumlah node yang diekspansi
- Waktu eksekusi (ms)
- Puncak ukuran frontier (maxQueueSize)
- Ringkasan statistik benchmark multi-run

## 6. Catatan Reproducibility

Agar eksperimen mudah direproduksi:

1. Gunakan dataset yang sama (JSON/CSV pada repository).
2. Gunakan versi dependensi sesuai package.json.
3. Jalankan skenario pada mode yang sama (Comparasi atau Hybrid).
4. Laporkan jumlah run benchmark dan pasangan rute yang diuji.
