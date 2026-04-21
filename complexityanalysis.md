# F. Complexity Analysis

Dokumen ini menjelaskan analisis kompleksitas algoritma pada proyek SmartBus untuk tiga mode pencarian:

- Uniform Cost Search (UCS)
- A* Search
- Hybrid A*-UCS (prioritas adaptif)

Analisis dibagi menjadi kompleksitas teoritis, kompleksitas praktis berdasarkan implementasi, serta implikasi terhadap performa aplikasi.

## 1. Time Complexity

### 1.1 Uniform Cost Search (UCS)

UCS menggunakan priority queue (min-heap) berdasarkan biaya kumulatif $g(n)$.

- Setiap operasi enqueue/dequeue pada heap: $O(\log |V|)$
- Relaksasi edge dilakukan hingga semua edge relevan diperiksa.

Sehingga:

- Worst-case: $O((|V| + |E|)\log |V|)$
- Pada graph sparse ($|E| \approx |V|$): mendekati $O(|V|\log |V|)$
- Pada graph dense ($|E| \approx |V|^2$): mendekati $O(|V|^2\log |V|)$

Intuisi: UCS tidak menggunakan heuristic, sehingga cenderung mengeksplorasi frontier lebih luas sebelum mencapai goal.

### 1.2 A* Search

A* juga memakai min-heap, tetapi prioritas menggunakan $f(n)=g(n)+h(n)$.

- Operasi heap tetap: $O(\log |V|)$
- Kompleksitas bergantung kualitas heuristic $h(n)$

Secara teoritis:

- Worst-case (heuristic buruk / mendekati nol): setara UCS, yaitu $O((|V| + |E|)\log |V|)$
- Best-case (heuristic sangat informatif): jumlah node diekspansi jauh lebih sedikit dari UCS

Jadi batas atas tetap sama, tetapi biaya efektif (jumlah ekspansi) biasanya lebih kecil pada data dengan heuristic yang baik.

### 1.3 Hybrid A*-UCS

Hybrid pada proyek ini memakai prioritas:

$$
f_{hybrid}(n) = g(n) + \alpha(n)\cdot h(n)
$$

dengan $\alpha(n)$ adaptif pada setiap langkah.

Karakteristik kompleksitas:

- Tetap memakai min-heap: operasi dasar $O(\log |V|)$
- Tambahan komputasi $\alpha(n)$ bersifat konstan per node: $O(1)$
- Proses relaksasi edge tetap dominan

Maka batas atas waktu:

- Worst-case: $O((|V| + |E|)\log |V|)$

Catatan penting: adaptasi $\alpha(n)$ mengubah urutan eksplorasi (konstanta performa), bukan orde asimtotik utama.

### 1.4 Benchmark Multi-Run

Jika satu algoritma dieksekusi sebanyak $r$ run:

- Kompleksitas total: $O(r\cdot T_{algo})$
- Dengan warm-up $w$: $O((w+r)\cdot T_{algo})$

Pada proyek ini, benchmark dipakai untuk stabilitas metrik (median/std dev), bukan mengubah kompleksitas algoritma inti.

## 2. Space Complexity

### 2.1 Uniform Cost Search (UCS)

Struktur data utama:

- Priority queue (frontier)
- Set visited
- Path state pada item antrian

Batas ruang dominan:

- Frontier + visited: $O(|V|)$ hingga $O(|V|+|E|)$ tergantung representasi state

Dalam praktik implementasi ini, metrik `maxQueueSize` dipakai sebagai proksi penggunaan memori frontier.

### 2.2 A* Search

Struktur data utama:

- Priority queue
- Set visited
- Map gScores

Batas ruang:

- $O(|V|)$ untuk visited + gScores
- Frontier dapat tumbuh hingga proporsional terhadap jumlah node yang dibuka

Sehingga secara praktis tetap di kelas ruang yang setara UCS, tetapi biasanya lebih hemat frontier bila heuristic efektif.

### 2.3 Hybrid A*-UCS

Struktur data serupa A*:

- Priority queue
- Set visited
- Map gScores
- Perhitungan adaptif $\alpha(n)$ tanpa struktur tambahan besar

Batas ruang:

- Tetap $O(|V|)$ secara asimtotik
- Overhead hybrid pada memori bersifat konstanta

## 3. Faktor Tambahan (Dll.)

### 3.1 Kompleksitas terhadap parameter branching

Jika memakai notasi branching factor $b$ dan depth solusi $d$:

- UCS (dan Dijkstra-like behavior): eksplorasi dapat mendekati eksponensial terhadap kedalaman efektif pada state-space tertentu
- A*: mendekati $O(b^d)$ pada kasus umum state-space search, tetapi koefisien sangat dipengaruhi kualitas heuristic
- Hybrid: pola eksplorasi berada di antara UCS dan A* bergantung dinamika $\alpha(n)$

### 3.2 Kualitas heuristic

Performa A* dan Hybrid sangat dipengaruhi heuristic:

- Heuristic admissible + konsisten menjaga optimalitas
- Heuristic lebih informatif menurunkan jumlah ekspansi
- Heuristic lemah membuat A*/Hybrid mendekati UCS dalam jumlah ekspansi

### 3.3 Dampak ukuran graph

Untuk graph kecil:

- Perbedaan waktu antar algoritma sering kecil
- Noise runtime (scheduler, cache, JIT) bisa menutupi perbedaan

Untuk graph lebih besar:

- Perbedaan jumlah node ekspansi lebih terlihat
- Dampak heuristic terhadap waktu dan memori cenderung makin jelas

### 3.4 Kompleksitas visualisasi

Visualisasi tidak mengubah kompleksitas algoritma pencarian, tetapi menambah biaya rendering UI:

- Render path/log umumnya linear terhadap panjang data: $O(k)$
- Pada mode komparasi, data dua algoritma dirender bersamaan
- Pada mode hybrid, hanya satu alur dirender sehingga biaya visual lebih kecil

## 4. Ringkasan Kompleksitas

| Algoritma | Time Complexity (Worst-case) | Space Complexity | Catatan Praktis |
|---|---|---|---|
| UCS | $O((|V|+|E|)\log |V|)$ | $O(|V|)$ | Stabil sebagai baseline optimal tanpa heuristic |
| A* | $O((|V|+|E|)\log |V|)$ | $O(|V|)$ | Lebih efisien jika heuristic informatif |
| Hybrid A*-UCS | $O((|V|+|E|)\log |V|)$ | $O(|V|)$ | Orde sama, konstanta performa dipengaruhi $\alpha(n)$ adaptif |

## 5. Kesimpulan

1. Secara asimtotik, UCS, A*, dan Hybrid berada pada kelas kompleksitas yang sama pada batas atas.
2. Perbedaan utama muncul pada efisiensi praktis: jumlah node diekspansi, ukuran frontier puncak, dan stabilitas waktu multi-run.
3. Hybrid memberikan kompromi antara eksplorasi aman ala UCS dan panduan heuristic ala A* tanpa menambah orde kompleksitas.
4. Untuk evaluasi penelitian, metrik empiris (median waktu, nodes visited, maxQueueSize) tetap diperlukan untuk melengkapi analisis teoritis.
