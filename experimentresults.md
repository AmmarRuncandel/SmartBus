# H. Experiment Results

Bagian ini membahas hasil eksperimen yang diperoleh dari implementasi SmartBus berdasarkan screenshot program. Fokus utama hasil adalah perbandingan performa A* dan UCS, hasil mode Hybrid, serta bukti visual dari tabel dataset graf dan ringkasan benchmark.

## 1. Hasil Simulasi Mode Comparasi

Pada mode comparasi, aplikasi menampilkan dua algoritma secara berdampingan, yaitu A* Search dan Uniform Cost Search (UCS). Dari screenshot hasil simulasi, keduanya menghasilkan rute optimal yang sama dari Terminal Tipe A Tasikmalaya menuju Terminal Kampung Rambutan dengan total biaya 273 km.

Walaupun total biaya dan rute akhir sama, urutan ekspansi simpul berbeda. A* mengevaluasi lebih sedikit simpul dibanding UCS, sehingga secara praktik A* terlihat lebih efisien pada rute ini. Hal ini menunjukkan bahwa heuristic yang digunakan membantu mempersempit ruang pencarian tanpa mengubah optimalitas hasil.

Screenshot yang merepresentasikan hasil ini:

- [Tampilan hasil simulasi comparasi](screenshot/Screenshot%202026-04-21%20124626.png)

## 2. Hasil Benchmark Multi-Run

Benchmark multi-run digunakan untuk melihat stabilitas performa dalam beberapa kali pengukuran. Dari screenshot benchmark, A* dan UCS tetap menghasilkan biaya rute yang sama, tetapi statistik waktunya menunjukkan variasi kecil antar run akibat noise runtime.

Secara umum, nilai waktu eksekusi berada pada skala milidetik yang sangat kecil. Pada data eksperimen ini, A* cenderung lebih efisien dalam jumlah simpul yang dievaluasi, sedangkan UCS memperlihatkan frontier yang sedikit lebih besar. Karena ukuran graf masih kecil, perbedaan waktu absolut tidak terlalu besar, tetapi pola efisiensi tetap bisa diamati melalui median, mean, dan standard deviation.

Screenshot yang merepresentasikan hasil benchmark:

- [Benchmark multi-run](screenshot/Screenshot%202026-04-21%20125005.png)

## 3. Hasil Simulasi Mode Hybrid

Pada mode Hybrid, sistem menampilkan satu jalur hasil pencarian gabungan A*-UCS. Hasil hybrid tetap menemukan rute optimal dengan total biaya 273 km. Jalur akhir yang dihasilkan tetap sama dengan mode comparasi, tetapi metrik internalnya berbeda karena proses pencarian dilakukan melalui satu pipeline adaptif.

Dari screenshot hybrid, jumlah simpul yang dievaluasi dan ukuran frontier berada di antara karakteristik A* dan UCS. Ini sesuai dengan desain hybrid yang menggabungkan komponen biaya riil $g(n)$ dan heuristic $h(n)$ dengan bobot adaptif $\alpha(n)$.

Screenshot yang merepresentasikan hasil hybrid:

- [Tampilan hasil simulasi hybrid](screenshot/Screenshot%202026-04-21%20125931.png)

## 4. Interpretasi Umum Hasil

Berdasarkan hasil pada screenshot, terdapat tiga temuan utama:

1. A* dan UCS menghasilkan jalur optimal yang sama, sehingga validitas solusi tetap terjaga.
2. A* menunjukkan efisiensi pencarian yang lebih baik karena jumlah simpul yang dievaluasi lebih sedikit.
3. Mode Hybrid tetap mencapai solusi optimal, tetapi dengan pendekatan pencarian gabungan yang menekankan keseimbangan antara panduan heuristic dan biaya riil.

Dengan kondisi graf yang masih kecil, perbedaan waktu eksekusi antar algoritma tidak terlalu besar. Oleh karena itu, hasil yang paling informatif bukan hanya waktu, tetapi juga urutan ekspansi, jumlah simpul yang diproses, dan ukuran frontier.

## 5. Bukti Visual Dataset dan Tabel Adjacency

Screenshot tabel adjacency menunjukkan struktur graf yang digunakan oleh sistem, termasuk bobot antar terminal dan nilai heuristic $h(n)$ menuju Jakarta. Tabel ini memperjelas bahwa data yang dipakai bukan dummy, melainkan data terminal nyata dengan koneksi dan bobot yang telah disiapkan untuk eksperimen.

Screenshot yang merepresentasikan tabel adjacency dataset graf:

- [Tabel adjacency dataset graf](screenshot/image.png)

## 6. Tabel Adjacency / Dataset Graf

Tabel berikut adalah ringkasan dataset graf yang digunakan pada eksperimen. Bagian ini diletakkan paling terakhir sesuai kebutuhan penulisan laporan.

| Terminal | Terhubung ke | Bobot Jarak (km) | h(n) ke Jakarta |
|---|---|---:|---:|
| Terminal Tipe A Tasikmalaya | Garut, Bandung | 60, 103 | 180 |
| Terminal Guntur Melati | Tasikmalaya, Bandung | 60, 63 | 150 |
| Terminal Leuwipanjang | Tasikmalaya, Garut, Sumedang, Purwakarta, Cirebon | 103, 63, 48, 76, 129 | 105 |
| Terminal Ciakar Sumedang | Bandung, Cirebon | 48, 84 | 128 |
| Terminal Harjamukti | Bandung, Sumedang, Purwakarta | 129, 84, 161 | 190 |
| Terminal Purwakarta | Bandung, Cirebon, Bekasi | 76, 161, 74 | 61 |
| Terminal Bus Bekasi | Purwakarta, Jakarta | 74, 20 | 15 |
| Terminal Kampung Rambutan | Bekasi | 20 | 0 |

### Ringkasan Struktur Graf

- Jumlah node: 8 terminal
- Jumlah sisi berarah: 20
- Jumlah sisi tak berarah unik: 10
- Bobot sisi: jarak jalan dalam kilometer
- Heuristic: jarak garis lurus ke Jakarta

### Keterangan Dataset

- Lokasi terminal diambil dari OpenStreetMap Nominatim
- Bobot jalan menggunakan OSRM public routing service
- Heuristic menggunakan estimasi jarak garis lurus (haversine)

### Catatan Akhir

Tabel adjacency di atas sengaja ditempatkan pada bagian paling akhir agar isi hasil eksperimen terlebih dahulu menjelaskan hasil simulasi, benchmark, dan interpretasi visual, kemudian ditutup dengan dataset graf sebagai dasar eksperimen.
