# I. Performance Evaluation

Bagian ini mengevaluasi performa algoritma pada sistem SmartBus berdasarkan hasil simulasi dan benchmark yang telah dilakukan pada mode Comparasi (A* vs UCS) dan mode Hybrid (A* + UCS menyatu).

## 1. Perbandingan Algoritma

Evaluasi dilakukan terhadap tiga pendekatan:

- Uniform Cost Search (UCS)
- A* Search
- Hybrid A*-UCS (prioritas adaptif)

### 1.1 Kualitas Solusi

Pada skenario rute utama, A* dan UCS menghasilkan rute optimal yang sama dengan total biaya rute yang identik. Mode Hybrid juga menghasilkan biaya rute optimal pada pengujian acuan.

Implikasi:

- Ketiga pendekatan tetap menjaga validitas solusi pada graf saat ini.
- Perbedaan utama bukan pada biaya akhir, melainkan pada proses pencarian internal.

### 1.2 Pola Eksplorasi

Perbedaan paling jelas terlihat pada urutan dan jumlah simpul yang dievaluasi:

- UCS cenderung mengeksplorasi lebih luas karena hanya mengandalkan $g(n)$.
- A* lebih terarah karena memakai $f(n)=g(n)+h(n)$.
- Hybrid berada di tengah karena memakai $f_{hybrid}(n)=g(n)+\alpha(n)\cdot h(n)$.

### 1.3 Ringkasan Perbandingan

| Aspek | UCS | A* | Hybrid A*-UCS |
|---|---|---|---|
| Fungsi prioritas | $g(n)$ | $g(n)+h(n)$ | $g(n)+\alpha(n)\cdot h(n)$ |
| Sifat pencarian | Menyeluruh | Terarah heuristic | Adaptif |
| Solusi optimal | Ya (bobot non-negatif) | Ya (heuristic admissible-consistent) | Ya pada pengujian acuan |
| Fokus utama | Keamanan baseline | Efisiensi eksplorasi | Keseimbangan eksplorasi |

## 2. Efisiensi

Efisiensi dianalisis dari metrik:

- Waktu eksekusi
- Jumlah simpul dievaluasi
- Puncak ukuran antrian (maxQueueSize)

### 2.1 Efisiensi Waktu

Hasil benchmark menunjukkan waktu eksekusi berada pada orde milidetik sangat kecil. Pada kondisi ini:

- Perbedaan waktu absolut antar algoritma relatif kecil.
- Statistik multi-run (median dan std dev) lebih informatif daripada single run.

### 2.2 Efisiensi Eksplorasi

Pada rute uji utama:

- A* mengevaluasi simpul lebih sedikit dibanding UCS.
- UCS lebih banyak membuka frontier, sehingga potensi biaya memori lebih tinggi.
- Hybrid memperlihatkan pola menengah, tergantung dinamika nilai $\alpha(n)$.

### 2.3 Efisiensi Memori

Metrik maxQueueSize dipakai sebagai proksi penggunaan memori frontier:

- Nilai lebih kecil berarti antrian prioritas lebih terkendali.
- A* umumnya lebih hemat frontier ketika heuristic cukup informatif.
- Hybrid dapat mendekati A* atau UCS sesuai kondisi graf dan bobot adaptif.

## 3. Scalability

Scalability mengevaluasi kemampuan pendekatan saat ukuran masalah meningkat.

### 3.1 Kondisi Saat Ini

Graf eksperimen saat ini berukuran kecil:

- 8 node
- 20 sisi berarah

Dampaknya:

- Selisih waktu antar algoritma belum terlalu kontras.
- Metrik proses (nodesVisited, maxQueueSize) lebih representatif untuk melihat karakter algoritma.

### 3.2 Proyeksi Saat Data Membesar

Ketika jumlah terminal dan koneksi bertambah:

- UCS berpotensi meningkat paling besar dalam jumlah eksplorasi karena sifat pencarian menyeluruh.
- A* cenderung lebih skalabel jika heuristic tetap baik.
- Hybrid berpotensi menjaga kompromi antara ketahanan UCS dan arah pencarian A*.

### 3.3 Faktor Penentu Skalabilitas

Skalabilitas sangat dipengaruhi oleh:

- Kualitas heuristic
- Kerapatan graf (sparse vs dense)
- Distribusi bobot edge
- Konsistensi data rute jalan

## 4. Kelebihan dan Kekurangan

### 4.1 Uniform Cost Search (UCS)

Kelebihan:

- Sederhana dan kuat sebagai baseline optimal.
- Tidak bergantung kualitas heuristic.

Kekurangan:

- Cenderung mengeksplorasi lebih banyak simpul.
- Bisa kurang efisien pada graf besar.

### 4.2 A* Search

Kelebihan:

- Lebih efisien dalam eksplorasi ketika heuristic informatif.
- Tetap optimal jika heuristic admissible dan konsisten.

Kekurangan:

- Sensitif terhadap kualitas heuristic.
- Heuristic lemah membuat perilaku mendekati UCS.

### 4.3 Hybrid A*-UCS

Kelebihan:

- Menyatukan keunggulan biaya riil UCS dan arahan heuristic A*.
- Fleksibel untuk menyesuaikan perilaku pencarian melalui bobot adaptif.

Kekurangan:

- Lebih kompleks untuk dijelaskan dan dituning.
- Perlu validasi tambahan pada dataset lebih besar untuk menilai stabilitas skala besar.

## 5. Kesimpulan Evaluasi Kinerja

1. A*, UCS, dan Hybrid sama-sama mampu memberikan solusi optimal pada skenario uji utama.
2. Perbedaan paling bermakna terdapat pada efisiensi proses pencarian, bukan hanya nilai biaya akhir.
3. A* menunjukkan efisiensi eksplorasi yang baik pada graf saat ini.
4. Hybrid memberikan alternatif realistis untuk menyeimbangkan pendekatan UCS dan A* dalam satu pipeline.
5. Untuk menilai keunggulan final secara kuat, diperlukan eksperimen lanjutan pada graf yang lebih besar dan lebih kompleks.
