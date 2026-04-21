# A. Methodology

Dokumen ini menjelaskan metodologi pengembangan simulasi pencarian rute SmartBus menggunakan A* dan Uniform Cost Search (UCS), termasuk dua skenario: mode komparasi (A* vs UCS) dan mode hybrid (penggabungan kedua pendekatan dalam satu pipeline pencarian).

## [1] Desain Algoritma

### 1. Penjelasan strategi algoritma

Sistem menggunakan pendekatan graph search pada jaringan terminal bus.

- Setiap terminal direpresentasikan sebagai node.
- Setiap koneksi antarterminal direpresentasikan sebagai edge berbobot jarak tempuh (km).
- Tujuan algoritma adalah mencari rute dengan total biaya minimum dari terminal asal ke terminal tujuan.

Strategi yang dipakai:

- UCS memprioritaskan node dengan biaya jalur terkecil dari titik awal (g-cost).
- A* memprioritaskan node berdasarkan nilai f-cost = g-cost + h-cost.
- h-cost menggunakan heuristic jarak garis lurus (haversine) menuju tujuan.

### 2. Alasan pemilihan metode

Metode dipilih karena:

- UCS menjadi baseline optimal tanpa heuristic, sehingga cocok sebagai pembanding.
- A* mempercepat pencarian pada banyak kasus karena dipandu heuristic.
- Keduanya menjamin solusi optimal jika bobot edge non-negatif, dan pada A* heuristic harus admissible serta konsisten.
- Kombinasi A* dan UCS relevan untuk studi komparasi efisiensi eksplorasi node.

### 3. Representasi data dan asumsi

- Data terminal menggunakan koordinat geospasial nyata.
- Bobot edge menggunakan estimasi jarak jalan (road distance).
- Graph diasumsikan terhubung untuk koridor utama pengujian.
- Bobot edge bernilai non-negatif.
- Heuristic A* dibuat konservatif agar tidak melebihi biaya sebenarnya.

### 4. Kriteria evaluasi

Evaluasi dilakukan berdasarkan:

- Optimalitas hasil: kesamaan total biaya jalur terbaik.
- Efisiensi eksplorasi: jumlah node yang dikunjungi.
- Waktu eksekusi: dianalisis dengan benchmark multi-run (median, mean, std dev).
- Stabilitas: variasi waktu antar run.

## [2] Pseudocode

### Pseudocode Uniform Cost Search (UCS)

```text
function UCS(graph, start, goal):
    priorityQueue <- min-heap ordered by gCost
    push (start, gCost=0)

    bestCost[start] <- 0
    parent[start] <- null
    visited <- empty set

    while priorityQueue not empty:
        current, currentCost <- pop minimum

        if current in visited:
            continue

        add current to visited

        if current == goal:
            return reconstructPath(parent, goal), currentCost, visited

        for each neighbor of current:
            newCost <- currentCost + weight(current, neighbor)

            if neighbor not in bestCost OR newCost < bestCost[neighbor]:
                bestCost[neighbor] <- newCost
                parent[neighbor] <- current
                push (neighbor, gCost=newCost)

    return failure
```

### Pseudocode A*

```text
function AStar(graph, start, goal, heuristic):
    priorityQueue <- min-heap ordered by fCost
    push (start, gCost=0, fCost=heuristic(start, goal))

    bestCost[start] <- 0
    parent[start] <- null
    visited <- empty set

    while priorityQueue not empty:
        current, currentG, currentF <- pop minimum

        if current in visited:
            continue

        add current to visited

        if current == goal:
            return reconstructPath(parent, goal), currentG, visited

        for each neighbor of current:
            tentativeG <- currentG + weight(current, neighbor)

            if neighbor not in bestCost OR tentativeG < bestCost[neighbor]:
                bestCost[neighbor] <- tentativeG
                parent[neighbor] <- current
                h <- heuristic(neighbor, goal)
                f <- tentativeG + h
                push (neighbor, gCost=tentativeG, fCost=f)

    return failure
```

### Pseudocode Benchmark Multi-run

```text
function Benchmark(algorithmRunner, runs, warmupRuns):
    for i from 1 to warmupRuns:
        algorithmRunner()  // warm-up JIT/cache

    durations <- empty list
    results <- empty list

    for i from 1 to runs:
        t0 <- now()
        result <- algorithmRunner()
        t1 <- now()

        append (t1 - t0) to durations
        append result to results

    summary <- computeStatistics(durations)
    return summary, results
```

## [3] Hybrid Algoritma Design

Catatan penting: pada proyek ini, hybrid diimplementasikan sebagai **algoritma nyata**, bukan hanya overlay visualisasi.

### 1. Bagaimana algoritma digabungkan

Penggabungan dilakukan dengan menyatukan prinsip prioritas UCS dan A* pada satu fungsi evaluasi adaptif.

- Rumus hybrid: f_hybrid(n) = g(n) + alpha(n) * h(n).
- g(n) mewakili komponen UCS (biaya riil dari start).
- h(n) mewakili komponen A* (heuristic ke goal).
- alpha(n) bersifat dinamis (adaptive) sesuai progres pencarian.
- Saat alpha kecil, perilaku mendekati UCS.
- Saat alpha besar, perilaku mendekati A*.

Dengan demikian, istilah hybrid pada penelitian ini berarti:

- Hybrid-Metode: prinsip UCS dan A* dilebur dalam satu prioritas node adaptif.
- Hybrid-Visualisasi: keluaran hybrid disajikan sebagai satu jalur final dan satu log ekspansi.
- Komparasi tetap tersedia sebagai mode terpisah untuk evaluasi.

### 2. Alur integrasi metode

Alur integrasi:

1. User memilih start dan destination.
2. Sistem validasi input (start != destination).
3. Jika mode = comparasi, sistem menjalankan A* dan UCS secara terpisah.
4. Jika mode = hybrid, sistem menjalankan algoritma hybrid A*-UCS dalam satu proses pencarian.
5. Sistem menyimpan hasil sesuai mode aktif.
6. Visualisasi dirender berdasarkan mode:
    - comparasi: side-by-side route dan log A* vs UCS.
    - hybrid: satu route dan satu log dari algoritma gabungan.
7. Jika benchmark dijalankan (mode comparasi), sistem melakukan warm-up lalu multi-run untuk masing-masing algoritma.
8. Statistik benchmark ditampilkan untuk analisis performa.

Alur ini menegaskan bahwa sistem memiliki dua kapabilitas sekaligus: komparasi algoritma dan simulasi hybrid yang menyatukan keduanya.

### 3. Prinsip desain hybrid

- Fairness: semua mode memakai dataset, titik awal, dan tujuan yang identik.
- Reproducibility: benchmark dilakukan berulang untuk mengurangi noise.
- Explainability: output mencakup jalur final dan jejak ekspansi node.
- Safety of optimality: bobot heuristic pada hybrid dibatasi agar tetap konservatif.

Implikasi metodologis:

- Jika hasil jalur akhir sama namun urutan kunjungan berbeda, ini menunjukkan perbedaan strategi eksplorasi tetap terjadi meski biaya akhir sama.
- Jika performa waktu tidak berbeda signifikan pada graph kecil, hybrid benchmark tetap valid karena fokus utamanya adalah stabilitas metrik dan interpretasi pola eksplorasi.

### 4. Kelebihan dan batasan

Kelebihan:

- Perbedaan perilaku internal A* vs UCS lebih mudah dipahami.
- Analisis performa lebih kredibel melalui multi-run benchmark.
- Cocok untuk kebutuhan demonstrasi dan evaluasi akademik.

Batasan:

- Pada graph kecil, perbedaan waktu eksekusi bisa sangat kecil.
- Visualisasi lebih menonjolkan interpretasi proses, bukan percepatan komputasi besar.
- Kualitas heuristic sangat mempengaruhi keuntungan A*.

## Ringkasan Metodologi

Pendekatan metodologi proyek ini menggabungkan:

- desain graph search berbasis data terminal nyata,
- komparasi dua algoritma optimal (A* dan UCS),
- benchmarking berulang untuk validitas metrik,
- serta desain hybrid visualisasi untuk memperjelas perbedaan perilaku pencarian.

Dengan pendekatan tersebut, sistem tidak hanya menghasilkan rute terbaik, tetapi juga menyediakan landasan analitis yang kuat untuk evaluasi akademik maupun teknis.
