# SmartBus Analytics

SmartBus Analytics adalah aplikasi web interaktif untuk dokumentasi dan simulasi perbandingan algoritma pencarian rute pada jaringan terminal bus antarkota (Jawa Barat dan Jakarta). Fokus utama proyek ini adalah menunjukkan bagaimana algoritma membuat keputusan, bukan membangun sistem operasional transportasi real-time.

## Ringkasan

Proyek ini membandingkan dua algoritma pencarian jalur:

- A* Search
- Uniform Cost Search (UCS)

Keduanya diuji pada graf berbobot yang merepresentasikan koneksi antarterminal. Hasil simulasi ditampilkan dalam bentuk jalur optimal, biaya total, waktu eksekusi, jumlah simpul yang dievaluasi, dan log langkah ekspansi.

## Tujuan Proyek

- Mendokumentasikan perilaku algoritma pencarian jalur pada graf berbobot.
- Menyediakan pembanding visual antara pendekatan heuristik (A*) dan non-heuristik (UCS).
- Menjadi media analisis untuk memahami trade-off efisiensi waktu, jumlah eksplorasi simpul, dan penggunaan memori frontier.

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

### Nilai Analitis Perbandingan

Dengan membandingkan A* vs UCS pada data graf yang sama, proyek ini bisa menunjukkan:

- kapan heuristik memberikan percepatan,
- kapan hasil biaya rute tetap sama,
- dampak terhadap ukuran frontier (memori),
- dan konsekuensi komputasi pada skenario graf kecil-menengah.

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
5. Aplikasi menampilkan:
	 - jalur optimal,
	 - total biaya/jarak,
	 - waktu eksekusi,
	 - jumlah simpul dievaluasi,
	 - urutan ekspansi simpul,
	 - puncak ukuran antrian prioritas.
6. Pengguna dapat membuka halaman Peta Rute untuk melihat sorotan jalur pada graf SVG.

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

- Data graf masih statis (hardcoded), belum terhubung API eksternal.
- Biaya edge dimodelkan sebagai representasi jarak/biaya, bukan data lalu lintas real-time.
- Tujuan utama proyek adalah dokumentasi dan eksperimen perilaku algoritma.

## Kesimpulan Singkat

SmartBus Analytics digunakan sebagai media dokumentatif-analitis untuk memahami perbedaan strategi pencarian rute antara A* dan UCS pada graf berbobot. Dengan desain interaktif dan metrik yang ditampilkan, proyek ini membantu menjelaskan alasan praktis penggunaan heuristik serta dampaknya terhadap performa pencarian.
