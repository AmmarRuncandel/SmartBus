# SmartBus Analytics

SmartBus Analytics adalah aplikasi web interaktif untuk dokumentasi dan simulasi perbandingan algoritma pencarian rute pada jaringan terminal bus antarkota (Jawa Barat dan Jakarta). Fokus utama proyek ini adalah menunjukkan bagaimana algoritma membuat keputusan, bukan membangun sistem operasional transportasi real-time.

## Ringkasan

Proyek ini membandingkan dua algoritma pencarian jalur:

- A* Search
- Uniform Cost Search (UCS)

Keduanya diuji pada graf berbobot yang merepresentasikan koneksi antarterminal. Node terminal memakai lokasi nyata dari terminal bus publik, bobot sisi memakai jarak rute jalan nyata dari OSRM, dan heuristik A* memakai jarak garis lurus ke terminal tujuan. Hasil simulasi ditampilkan dalam bentuk jalur optimal, biaya total, waktu eksekusi, jumlah simpul yang dievaluasi, dan log langkah ekspansi.

## Tujuan Proyek

- Mendokumentasikan perilaku algoritma pencarian jalur pada graf berbobot.
- Menyediakan pembanding visual antara pendekatan heuristik (A*) dan non-heuristik (UCS).
- Menjadi media analisis untuk memahami trade-off efisiensi waktu, jumlah eksplorasi simpul, dan penggunaan memori frontier.
- Menggunakan data terminal nyata agar simulasi tidak lagi bergantung pada angka dummy.

## Dataset yang Dipakai

Dataset SmartBus sekarang dipisahkan ke file data tersendiri agar lebih rapi dan mudah dilacak:

- `app/lib/data/smartbus-dataset.json` sebagai sumber utama data terminal, koneksi, dan bobot rute.
- `app/lib/data/smartbus-terminal-sources.csv` sebagai ringkasan sumber lokasi terminal per entri.

### Sumber Data per Terminal

| Terminal internal | Nama terminal nyata | Sumber lokasi |
| --- | --- | --- |
| Tasikmalaya | Terminal Tipe A Tasikmalaya | https://nominatim.openstreetmap.org/search?q=Terminal%20Tipe%20A%20Tasikmalaya&format=jsonv2 |
| Garut | Terminal Guntur Melati | https://nominatim.openstreetmap.org/search?q=Terminal%20Guntur%20Garut&format=jsonv2 |
| Bandung | Terminal Leuwipanjang | https://nominatim.openstreetmap.org/search?q=Terminal%20Leuwipanjang%20Bandung&format=jsonv2 |
| Sumedang | Terminal Ciakar Sumedang | https://nominatim.openstreetmap.org/search?q=Terminal%20Sumedang&format=jsonv2 |
| Cirebon | Terminal Harjamukti | https://nominatim.openstreetmap.org/search?q=Terminal%20Harjamukti%20Cirebon&format=jsonv2 |
| Purwakarta | Terminal Purwakarta | https://nominatim.openstreetmap.org/search?q=Terminal%20Purwakarta&format=jsonv2 |
| Bekasi | Terminal Bus Bekasi | https://nominatim.openstreetmap.org/search?q=Terminal%20Bekasi&format=jsonv2 |
| Jakarta | Terminal Kampung Rambutan | https://nominatim.openstreetmap.org/search?q=Terminal%20Kampung%20Rambutan%20Jakarta&format=jsonv2 |

## Alasan Memilih Algoritma

Pemilihan A* dan UCS dilakukan karena keduanya relevan untuk studi rute optimal pada graf dengan bobot non-negatif.

### Mengapa UCS?

- UCS adalah baseline kuat untuk shortest path berbobot non-negatif.
- Menjamin solusi optimal karena selalu mengekspansi simpul dengan biaya akumulatif terkecil.
- Cocok sebagai titik pembanding "tanpa heuristik".

### Mengapa A*?

- A* menambahkan komponen heuristik untuk mengarahkan pencarian lebih fokus ke tujuan.
- Dalam banyak kasus, A* mengevaluasi lebih sedikit simpul dibanding UCS jika heuristik cukup baik.
- Tetap optimal jika heuristik admissible/consistent.

### Heuristik yang Dipakai

Pada SmartBus, heuristik `h(n)` dihitung menggunakan jarak garis lurus dari terminal `n` ke terminal tujuan di Jakarta, berdasarkan koordinat geografis terminal nyata.

Secara akademik, pendekatan ini dipilih karena:

- merupakan estimasi biaya sisa yang sederhana dan dapat dihitung cepat,
- cenderung menjadi batas bawah dari jarak rute jalan aktual,
- dan karena itu sesuai untuk A* selama bobot sisi tidak negatif.

Dengan kata lain, fungsi evaluasi yang dipakai adalah:

```text
f(n) = g(n) + h(n)
```

di mana:

- `g(n)` = biaya aktual dari titik awal ke simpul `n`,
- `h(n)` = estimasi jarak sisa ke tujuan,
- `f(n)` = estimasi total biaya jalur jika melewati simpul `n`.

Untuk dataset ini, `g(n)` berasal dari jarak rute jalan nyata yang diambil dari OSRM, sedangkan `h(n)` berasal dari jarak garis lurus. Kombinasi ini membuat A* tetap terarah, tetapi masih dapat dibandingkan dengan UCS secara fair karena keduanya berjalan pada graf yang sama.

### Nilai Analitis Perbandingan

Dengan membandingkan A* vs UCS pada data graf yang sama, proyek ini bisa menunjukkan:

- kapan heuristik memberikan percepatan,
- kapan hasil biaya rute tetap sama,
- dampak terhadap ukuran frontier (memori),
- dan konsekuensi komputasi pada skenario graf kecil-menengah.

### Hasil Pengamatan Formal

Berdasarkan hasil simulasi pada dataset SmartBus, A* dan UCS dapat menghasilkan jalur optimal dengan total biaya yang sama, tetapi urutan simpul yang dikunjungi tidak selalu identik. Hal ini terjadi karena kedua algoritma memiliki tujuan yang sama, yaitu menemukan jalur berbiaya minimum pada graf berbobot non-negatif. Namun, mekanisme penelusurannya berbeda.

UCS memilih simpul murni berdasarkan biaya akumulatif terendah dari titik awal, sehingga proses ekspansi cenderung menyebar ke beberapa cabang yang masih mungkin menghasilkan jalur murah. Sebaliknya, A* menggunakan fungsi evaluasi `f(n) = g(n) + h(n)`, sehingga pencariannya lebih terarah menuju tujuan dengan mempertimbangkan estimasi sisa biaya. Akibatnya, A* sering kali mengekspansi simpul lebih sedikit atau dalam urutan yang berbeda, meskipun jalur akhirnya tetap sama dengan UCS.

Dengan demikian, perbedaan utama antara A* dan UCS pada proyek ini bukan terletak pada kualitas jalur akhir, melainkan pada efisiensi proses pencarian. Jalur optimal yang sama menunjukkan bahwa heuristik A* yang digunakan tetap konsisten terhadap tujuan optimasi, sedangkan perbedaan urutan kunjungan mencerminkan pengaruh heuristik terhadap strategi eksplorasi.

## Arsitektur Aplikasi

Arsitektur mengikuti Next.js App Router dengan pemisahan sederhana antara UI, logika algoritma, dan data graf.

### Lapisan Utama

- Presentasi/UI: komponen React pada folder `app/components`.
- Logika algoritma: `app/lib/algorithms.ts`.
- Sumber data graf: `app/lib/graphData.ts`.
- Routing halaman: `app/page.tsx` (dashboard) dan `app/PetaRute/page.tsx` (peta graf).

### Alur Data Singkat

1. Pengguna memilih terminal asal dan tujuan pada Control Panel.
2. Komponen Dashboard memanggil `runAStar` dan `runUCS`.
3. Hasil kedua algoritma disimpan ke state.
4. Hasil divisualisasikan melalui panel rute, log ekspansi, dan kartu analitik.

## Fitur yang Tersedia

- Dashboard simulasi interaktif.
- Pemilihan terminal asal dan tujuan.
- Eksekusi A* dan UCS secara berdampingan.
- Mode benchmark multi-run untuk menampilkan median, deviasi standar, mean, dan rentang waktu eksekusi.
- Visualisasi jalur terbaik per algoritma.
- Log urutan ekspansi simpul.
- Kartu analitik (waktu, biaya, simpul dievaluasi, puncak antrian).
- Halaman peta graf untuk sorotan jalur pada node-edge jaringan terminal.
- Skeleton loading dan animasi scroll reveal.

## Alur Simulasi

1. Buka halaman utama dashboard.
2. Pilih terminal asal dan terminal tujuan.
3. Klik tombol "Jalankan Simulasi".
4. Sistem menghitung hasil dengan A* dan UCS pada graf yang sama.
5. Jika mode benchmark dipilih, sistem menjalankan simulasi berulang dan merangkum median, deviasi standar, mean, serta rentang waktu eksekusi.
6. Aplikasi menampilkan:
	 - jalur optimal,
	 - total biaya/jarak,
	 - waktu eksekusi,
	 - jumlah simpul dievaluasi,
	 - urutan ekspansi simpul,
	 - puncak ukuran antrian prioritas.
7. Pengguna dapat membuka halaman Peta Rute untuk melihat sorotan jalur pada graf SVG.

## Detail Algoritma

Implementasi algoritma berada di `app/lib/algorithms.ts` dan menggunakan min-priority queue (min-heap).

### 1) Uniform Cost Search (UCS)

- Fungsi prioritas:

```text
f(n) = g(n)
```

- `g(n)` adalah biaya akumulatif dari titik awal ke simpul `n`.
- Algoritma selalu memilih simpul dengan biaya akumulatif terendah di frontier.
- Menjamin jalur biaya minimum pada graf berbobot non-negatif.

### 2) A* Search

- Fungsi prioritas:

```text
f(n) = g(n) + h(n)
```

- `h(n)` adalah estimasi biaya dari simpul `n` ke tujuan.
- Pada proyek ini, `h(n)` disimpan sebagai properti node pada `graphData.ts`.
- A* memadukan biaya nyata (`g`) dan estimasi (`h`) untuk mengarahkan pencarian.

### Bentuk Hasil (Output) Algoritma

Setiap algoritma mengembalikan:

- `path`: urutan terminal hasil pencarian.
- `totalCost`: total biaya rute.
- `executionTime`: durasi komputasi (ms).
- `nodesVisited`: jumlah simpul yang diproses.
- `expansionLog`: catatan langkah ekspansi.
- `maxQueueSize`: ukuran maksimum frontier selama proses.

## Struktur Proyek (Inti)

```text
app/
	page.tsx
	layout.tsx
	globals.css
	PetaRute/
		page.tsx
	components/
		Navbar.tsx
		HeroSection.tsx
		Dashboard.tsx
		ControlPanel.tsx
		VisualizationPanel.tsx
		AnalyticsCards.tsx
		ControlPanel/
			TerminalSelect.tsx
			constants.ts
		dashboard/
			DashboardSkeleton.tsx
		ui/
			ScrollReveal.tsx
	lib/
		algorithms.ts
		graphData.ts
public/
	images/
```

## Cara Menjalankan

### Prasyarat

- Node.js 20 atau lebih baru (disarankan LTS).
- npm.

### Instalasi Dependensi

```bash
npm install
```

### Menjalankan Mode Development

```bash
npm run dev
```

Buka di browser:

```text
http://localhost:3000
```

### Build Production

```bash
npm run build
```

### Menjalankan Hasil Build

```bash
npm run start
```

### Linting

```bash
npm run lint
```

## Batasan dan Ruang Lingkup

- Data graf masih statis di dalam repo, tetapi dipisahkan ke file dataset JSON/CSV agar lebih mudah dirawat.
- Koordinat terminal diambil dari OpenStreetMap/Nominatim.
- Biaya edge diambil dari jarak rute jalan nyata melalui OSRM public routing service, bukan data lalu lintas real-time.
- Tujuan utama proyek adalah dokumentasi dan eksperimen perilaku algoritma.

## Pengujian Otomatis

Proyek ini sekarang memiliki unit test untuk:

- memverifikasi heuristik A* tetap admissible dan consistent,
- membandingkan hasil A* dan UCS,
- serta menguji statistik benchmark multi-run.

Jalankan dengan:

```bash
npm test
```

## Kesimpulan Singkat

SmartBus Analytics digunakan sebagai media dokumentatif-analitis untuk memahami perbedaan strategi pencarian rute antara A* dan UCS pada graf berbobot. Dengan desain interaktif dan metrik yang ditampilkan, proyek ini membantu menjelaskan alasan praktis penggunaan heuristik serta dampaknya terhadap performa pencarian.
