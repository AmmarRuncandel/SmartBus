# A. Methodology

Dokumen ini menjelaskan metodologi pengembangan simulasi pencarian rute SmartBus menggunakan A* dan Uniform Cost Search (UCS), serta desain penggabungan visualisasi keduanya.

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

### 1. Bagaimana algoritma digabungkan

Penggabungan dilakukan pada level orkestrasi dan visualisasi, bukan mencampur rumus inti pencarian.

- A* dan UCS dieksekusi sebagai dua proses terpisah dengan input graph yang sama.
- Hasil masing-masing proses disimpan sebagai output independen:
  - path terbaik
  - total cost
  - expansion log
  - metrik benchmark
- Mode visualisasi menampilkan dua bentuk:
  - Mode comparasi: panel A* dan UCS dipisah.
  - Mode penggabungan: overlay jalur dan timeline sinkron langkah eksplorasi.

### 2. Alur integrasi metode

Alur integrasi:

1. User memilih start dan destination.
2. Sistem validasi input (start != destination).
3. Sistem menjalankan A* dan UCS pada graph yang sama.
4. Sistem menyimpan hasil ke state simulasi.
5. Visualisasi dirender berdasarkan mode:
   - comparasi: side-by-side route dan log.
   - penggabungan: gabungan node jalur + sinkronisasi langkah.
6. Jika benchmark dijalankan, sistem melakukan warm-up lalu multi-run untuk masing-masing algoritma.
7. Statistik benchmark ditampilkan untuk analisis performa.

### 3. Prinsip desain hybrid

- Fairness: kedua algoritma memakai dataset, titik awal, dan tujuan yang identik.
- Reproducibility: benchmark dilakukan berulang untuk mengurangi noise.
- Explainability: output mencakup jalur final dan jejak ekspansi node.
- Non-intrusive integration: integrasi tidak mengubah sifat optimalitas algoritma dasar.

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
