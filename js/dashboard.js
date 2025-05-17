// js/dashboard.js

// Pastikan Chart.js dan plugin datalabels sudah dimuat oleh index.html
// Variabel global chart instances (pieChartInstance, barChartInstance, priorityChartInstance, regionalPieChartInstance, categoryStatusChartInstance)
// STORAGE_KEYS, dan fungsi getDataFromStorage diharapkan sudah ada dari config.js
// Variabel state drilldown (currentDrillDownLevel, selectedKabupaten, selectedKecamatan, allGrievanceData) juga diharapkan dari config.js

/**
 * Fungsi untuk menginisialisasi atau memperbarui chart.
 * @param {string} canvasId ID elemen canvas.
 * @param {string} instanceVarName Nama variabel global untuk menyimpan instance chart.
 * @param {string} type Tipe chart ('doughnut', 'bar').
 * @param {string[]} labels Label untuk chart.
 * @param {Array<number>|Array<object>} dataOrDatasets Data (untuk pie/doughnut/bar tunggal) atau array datasets (untuk stacked/grouped bar).
 * @param {string[]} colors Array warna (hanya digunakan untuk pie/doughnut/bar tunggal).
 * @param {string} titleText Judul chart.
 * @param {function} onClickHandler Fungsi handler klik (opsional, untuk drilldown).
 * @param {boolean} isStacked Menandakan apakah ini stacked bar chart (opsional).
 */
function renderOrUpdateChart(canvasId, instanceVarName, type, labels, dataOrDatasets, colors, titleText, onClickHandler = null, isStacked = false) {
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (!ctx) {
        console.error(`[Dashboard:Render] Canvas element with id '${canvasId}' not found.`);
        return;
    }

    // Hancurkan chart lama jika ada
    if (window[instanceVarName]) {
        // console.log(`[Dashboard:Render] Menghancurkan instance chart lama '${instanceVarName}'...`);
        try { window[instanceVarName].destroy(); } catch (e) {}
        window[instanceVarName] = null;
    }

    // Opsi dasar chart
    const baseChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { padding: 15, boxWidth: 12, font: { size: 11 } } },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || context.label || ''; // Ambil label dataset atau label sumbu
                        if (label) { label += ': '; }
                        // Untuk stacked bar, tooltip perlu menampilkan nilai segmen
                        if (context.parsed.y !== null && isStacked) {
                             label += context.parsed.y;
                        }
                        // Untuk pie/doughnut, tampilkan nilai dan persentase
                        else if (context.parsed !== null && (type === 'pie' || type === 'doughnut')) {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = total === 0 ? '0.0%' : ((context.parsed / total) * 100).toFixed(1) + '%';
                            label += `${context.parsed} (${percentage})`;
                        }
                        // Untuk bar non-stacked
                        else if (context.parsed.y !== null && !isStacked && type === 'bar') {
                             label += context.parsed.y;
                        }
                         // Fallback jika format lain
                         else if (context.parsed !== null) {
                            label += context.parsed;
                         }
                        return label;
                    }
                }
            },
            title: { display: true, text: titleText, padding: { top: 10, bottom: 10 }, font: { size: 14, weight: 'bold' } },
            datalabels: { // Konfigurasi datalabels default
                display: true,
                color: '#fff',
                font: { weight: 'bold', size: 11 },
                formatter: (value, context) => { // Tampilkan nilai > 0
                    let valToShow = 0;
                     if (isStacked && context.dataset.data && typeof context.dataset.data[context.dataIndex] !== 'undefined') {
                         valToShow = context.dataset.data[context.dataIndex];
                     } else if (!isStacked && context.dataset.data && typeof context.dataset.data[context.dataIndex] !== 'undefined') {
                         valToShow = context.dataset.data[context.dataIndex];
                     } else if (type === 'pie' || type === 'doughnut') {
                         // Untuk pie/doughnut, format persentase
                         const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                         const percentage = total > 0 ? (value / total) * 100 : 0;
                         if (context.dataset.data.filter(d => d > 0).length === 1 && value > 0) return value; // Tampilkan nilai jika hanya 1 data
                         return percentage > 5 ? percentage.toFixed(0) + '%' : '';
                     }
                    return valToShow > 0 ? valToShow : '';
                },
                anchor: 'center',
                align: 'center'
            }
        },
        scales: {} // Inisialisasi scales
    };

    // Salin opsi dasar (hindari JSON.stringify untuk fungsi)
    let finalChartOptions = { ...baseChartOptions };
    finalChartOptions.plugins = { ...baseChartOptions.plugins }; // Salin plugins secara terpisah
    finalChartOptions.scales = { ...baseChartOptions.scales }; // Salin scales

    // Modifikasi untuk tipe 'bar'
    if (type === 'bar') {
        finalChartOptions.scales.y = { beginAtZero: true, ticks: { precision: 0 } };
        finalChartOptions.scales.x = {}; // Skala X default

        if (isStacked) {
            finalChartOptions.scales.x.stacked = true;
            finalChartOptions.scales.y.stacked = true;
            // console.log(`[Dashboard:Render] Opsi Stacked diaktifkan untuk chart '${instanceVarName}'.`);
            if (finalChartOptions.plugins.legend) finalChartOptions.plugins.legend.display = true; // Tampilkan legenda untuk stacked
            if (finalChartOptions.plugins.datalabels) {
                 finalChartOptions.plugins.datalabels.anchor = 'center';
                 finalChartOptions.plugins.datalabels.align = 'center';
                 finalChartOptions.plugins.datalabels.color = '#fff';
            }
        } else {
             if (finalChartOptions.plugins.datalabels) {
                 finalChartOptions.plugins.datalabels.anchor = 'end';
                 finalChartOptions.plugins.datalabels.align = 'top';
                 finalChartOptions.plugins.datalabels.color = '#495057';
                 finalChartOptions.plugins.datalabels.offset = -2;
             }
             if (finalChartOptions.plugins.legend) finalChartOptions.plugins.legend.display = false; // Sembunyikan legenda untuk bar tunggal
        }
    }

    // Tambahkan handler onClick jika ada
    if (onClickHandler) {
        finalChartOptions.onClick = (event, elements) => {
            // console.log(`[Dashboard:Render:onClickInternal] Klik terdeteksi pada chart '${instanceVarName}'.`);
            onClickHandler(event, elements);
        };
        // console.log(`[Dashboard:Render] Handler onClick ditambahkan untuk chart '${instanceVarName}'.`);
    }

    // Daftarkan plugin datalabels jika belum
    if (!Chart.registry.plugins.get('datalabels') && typeof ChartDataLabels !== 'undefined') {
        try {
            Chart.register(ChartDataLabels);
            console.log("[Dashboard] ChartDataLabels plugin registered.");
        } catch (e) {
             console.error("[Dashboard] Gagal mendaftarkan ChartDataLabels:", e);
             if (finalChartOptions.plugins.datalabels) finalChartOptions.plugins.datalabels.display = false;
        }
    } else if (typeof ChartDataLabels === 'undefined') {
         console.warn("[Dashboard] ChartDataLabels plugin is not loaded.");
         if (finalChartOptions.plugins.datalabels) finalChartOptions.plugins.datalabels.display = false;
    }


    // Tentukan struktur data berdasarkan tipe chart
    const chartData = { labels: labels };
    if (isStacked || (type === 'bar' && Array.isArray(dataOrDatasets) && typeof dataOrDatasets[0] === 'object')) {
        // Jika stacked atau data sudah berupa array of datasets
        chartData.datasets = dataOrDatasets;
    } else if (type === 'pie' || type === 'doughnut') {
        // Untuk pie/doughnut
        chartData.datasets = [{
            label: titleText,
            data: dataOrDatasets,
            backgroundColor: colors, // Gunakan array warna yang diteruskan
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 4
        }];
    } else {
        // Untuk bar tunggal
        chartData.datasets = [{
            label: titleText,
            data: dataOrDatasets,
            backgroundColor: colors, // Gunakan array warna yang diteruskan
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 5,
            hoverOffset: 4
        }];
    }

    // Buat instance chart baru
    try {
        window[instanceVarName] = new Chart(ctx, {
            type: type,
            data: chartData,
            options: finalChartOptions
        });
        // console.log(`[Dashboard:Render] Instance chart '${instanceVarName}' dibuat/diperbarui.`);
        // console.log(`[Dashboard:Render] Verifikasi Opsi onClick untuk '${instanceVarName}':`, window[instanceVarName]?.options?.onClick);
    } catch (e) {
        console.error(`[Dashboard:Render] Error saat membuat chart '${canvasId}' (${instanceVarName}):`, e);
    }
}

/**
 * Menangani klik pada chart regional untuk drill-down.
 * @param {Event} event Event klik.
 * @param {Array} elements Array elemen yang diklik pada chart.
 */
function handleRegionalChartClick(event, elements) {
    // console.log("[Dashboard:Click] === handleRegionalChartClick Mulai ==="); // Komentari jika terlalu berisik
    if (!elements || elements.length === 0) return;

    const clickedElementIndex = elements[0].index;
    if (!window.regionalPieChartInstance || !window.regionalPieChartInstance.data || !window.regionalPieChartInstance.data.labels) {
        console.error("[Dashboard:Click] Instance chart regional atau datanya tidak valid saat klik.");
        return;
    }
     if (clickedElementIndex >= window.regionalPieChartInstance.data.labels.length) {
        console.error(`[Dashboard:Click] Index elemen yang diklik (${clickedElementIndex}) di luar batas label.`);
        return;
     }
    const clickedLabel = window.regionalPieChartInstance.data.labels[clickedElementIndex];

    // console.log(`[Dashboard:Click] State SEBELUM: Level=${currentDrillDownLevel}, Kab=${selectedKabupaten}, Kec=${selectedKecamatan}`);
    // console.log(`[Dashboard:Click] Label diklik: '${clickedLabel}' (index: ${clickedElementIndex})`);

    let needsUpdate = false;

    if (currentDrillDownLevel === 'kabupaten') {
        if (clickedLabel && clickedLabel !== 'Tidak Diketahui') {
            selectedKabupaten = clickedLabel;
            currentDrillDownLevel = 'kecamatan';
            needsUpdate = true;
        }
    } else if (currentDrillDownLevel === 'kecamatan') {
        if (clickedLabel && clickedLabel !== 'Tidak Diketahui') {
            selectedKecamatan = clickedLabel;
            currentDrillDownLevel = 'desa';
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        // console.log(`[Dashboard:Click] State SETELAH: Level=${currentDrillDownLevel}, Kab=${selectedKabupaten}, Kec=${selectedKecamatan}`);
        setTimeout(() => { updateRegionalChartDrilldown(); }, 0);
    }
    // console.log("[Dashboard:Click] === handleRegionalChartClick Selesai ==="); // Komentari jika terlalu berisik
}

/**
 * Memperbarui chart regional berdasarkan level drill-down saat ini.
 */
function updateRegionalChartDrilldown() {
    // console.log(`[Dashboard:UpdateDrilldown] === Mulai Pembaruan Chart Regional ===`); // Komentari jika terlalu berisik
    // console.log(`[Dashboard:UpdateDrilldown] Target Level: ${currentDrillDownLevel}, Kab Terpilih: ${selectedKabupaten}, Kec Terpilih: ${selectedKecamatan}`);
    let labels = [];
    let data = [];
    let titleText = '';
    let currentData = allGrievanceData;

    const backButton = document.getElementById('regionalChartBackButton');
    const regionalChartCardHeader = document.querySelector('#regionalPieChart').closest('.card')?.querySelector('.card-header');

    // --- Pemetaan Warna Kabupaten ---
    const kabupatenColorsMap = {
        "Bolaang Mongondow": 'rgba(52, 152, 219, 0.8)', // Biru
        "Bolaang Mongondow Selatan": 'rgba(231, 76, 60, 0.8)', // Merah
        // Tambahkan kabupaten lain dan warnanya di sini jika perlu
        "Kota Kotamobagu": 'rgba(155, 89, 182, 0.8)', // Ungu (contoh)
        "default": 'rgba(127, 140, 141, 0.7)', // Abu-abu untuk default/tidak diketahui
        "Tidak Diketahui": 'rgba(127, 140, 141, 0.7)' // Abu-abu untuk tidak diketahui
    };
    // Palet warna default untuk level kecamatan/desa
    const defaultPalette = ['#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d', '#d35400', '#2c3e50', '#8e44ad', '#c0392b'];


    let counts = {};
    let chartColors = []; // Array untuk menyimpan warna chart

    try {
        if (currentDrillDownLevel === 'kabupaten') {
            counts = currentData.reduce((acc, item) => {
                const key = (item.kabupaten && item.kabupaten.trim() !== "") ? item.kabupaten.trim() : 'Tidak Diketahui';
                acc[key] = (acc[key] || 0) + 1; return acc; }, {});
            titleText = 'Distribusi Pengaduan per Kabupaten';
            if (backButton) {
                 backButton.style.display = 'none';
                 // Reset kelas warna tombol kembali
                 backButton.className = 'btn btn-sm mb-2 btn-outline-secondary'; // Kembali ke abu-abu
            }
            selectedKabupaten = null; selectedKecamatan = null;
            // Tentukan warna berdasarkan nama kabupaten
            labels = Object.keys(counts);
            chartColors = labels.map(label => kabupatenColorsMap[label] || kabupatenColorsMap.default);

        } else if (currentDrillDownLevel === 'kecamatan' && selectedKabupaten) {
            currentData = currentData.filter(item => item.kabupaten === selectedKabupaten);
            counts = currentData.reduce((acc, item) => {
                const key = (item.kecamatan && item.kecamatan.trim() !== "") ? item.kecamatan.trim() : 'Tidak Diketahui';
                acc[key] = (acc[key] || 0) + 1; return acc; }, {});
            titleText = `Pengaduan di ${selectedKabupaten} (per Kecamatan)`;
            if (backButton) {
                backButton.style.display = 'inline-block';
                // Set warna tombol kembali berdasarkan kabupaten
                backButton.className = 'btn btn-sm mb-2'; // Reset kelas
                if (selectedKabupaten === "Bolaang Mongondow") {
                    backButton.classList.add('btn-outline-primary'); // Biru
                } else if (selectedKabupaten === "Bolaang Mongondow Selatan") {
                    backButton.classList.add('btn-outline-danger'); // Merah
                } else {
                    backButton.classList.add('btn-outline-secondary'); // Default
                }
            }
            selectedKecamatan = null;
            // Gunakan palet default untuk kecamatan
            labels = Object.keys(counts);
            chartColors = labels.map((_, index) => defaultPalette[index % defaultPalette.length]);

        } else if (currentDrillDownLevel === 'desa' && selectedKabupaten && selectedKecamatan) {
            currentData = currentData.filter(item => item.kabupaten === selectedKabupaten && item.kecamatan === selectedKecamatan);
            counts = currentData.reduce((acc, item) => {
                const key = (item.desa && item.desa.trim() !== "") ? item.desa.trim() : 'Tidak Diketahui';
                acc[key] = (acc[key] || 0) + 1; return acc; }, {});
            titleText = `Pengaduan di ${selectedKecamatan}, ${selectedKabupaten} (per Desa)`;
            if (backButton) {
                 backButton.style.display = 'inline-block';
                 // Warna tombol tetap sama seperti level kecamatan
                 backButton.className = 'btn btn-sm mb-2'; // Reset kelas
                 if (selectedKabupaten === "Bolaang Mongondow") {
                     backButton.classList.add('btn-outline-primary');
                 } else if (selectedKabupaten === "Bolaang Mongondow Selatan") {
                     backButton.classList.add('btn-outline-danger');
                 } else {
                     backButton.classList.add('btn-outline-secondary');
                 }
            }
            // Gunakan palet default untuk desa
            labels = Object.keys(counts);
            chartColors = labels.map((_, index) => defaultPalette[index % defaultPalette.length]);

        } else { // Fallback
            console.warn("[Dashboard:UpdateDrilldown] Kondisi drilldown tidak valid. Kembali ke level kabupaten.");
            currentDrillDownLevel = 'kabupaten'; selectedKabupaten = null; selectedKecamatan = null;
            counts = allGrievanceData.reduce((acc, item) => {
                const key = (item.kabupaten && item.kabupaten.trim() !== "") ? item.kabupaten.trim() : 'Tidak Diketahui';
                acc[key] = (acc[key] || 0) + 1; return acc; }, {});
            titleText = 'Distribusi Pengaduan per Kabupaten' + (allGrievanceData.length === 0 ? ' (Data Kosong)' : '');
            if (backButton) {
                 backButton.style.display = 'none';
                 backButton.className = 'btn btn-sm mb-2 btn-outline-secondary'; // Reset warna
            }
            labels = Object.keys(counts);
            chartColors = labels.map(label => kabupatenColorsMap[label] || kabupatenColorsMap.default);
        }
    } catch (e) {
        console.error("[Dashboard:UpdateDrilldown] Error saat memproses data:", e);
        titleText = 'Error Memproses Data Wilayah'; labels = ['Error']; data = [1]; counts = { Error: 1 };
        if (backButton) backButton.style.display = (currentDrillDownLevel !== 'kabupaten') ? 'inline-block' : 'none';
        chartColors = [kabupatenColorsMap.default]; // Warna default untuk error
    }

    labels = Object.keys(counts);
    data = Object.values(counts);

    // Penanganan jika tidak ada data
    if (labels.length === 0) {
        const parentLevelName = currentDrillDownLevel === 'desa' ? selectedKecamatan : (currentDrillDownLevel === 'kecamatan' ? selectedKabupaten : '');
        labels = [`Tidak ada data${parentLevelName ? ` di ${parentLevelName}` : ''}`];
        data = [0];
        chartColors = [kabupatenColorsMap.default]; // Warna default jika kosong
    }

    // Update judul kartu
    if (regionalChartCardHeader) {
        regionalChartCardHeader.innerHTML = `<i class="fas fa-map-marked-alt me-2"></i> ${titleText}`;
    }

    // Render chart dengan data baru, warna yang sesuai, dan handler klik
    renderOrUpdateChart('regionalPieChart', 'regionalPieChartInstance', 'doughnut', labels, data, chartColors, titleText, handleRegionalChartClick);
    // console.log(`[Dashboard:UpdateDrilldown] === Selesai Pembaruan Chart Regional ===`); // Komentari jika terlalu berisik
}

/**
 * Menangani aksi "kembali" pada grafik drill-down regional.
 */
function handleRegionalChartDrillUp() {
    // console.log(`[Dashboard:DrillUp] === Tombol Kembali Diklik ===`); // Komentari jika terlalu berisik
    // console.log(`[Dashboard:DrillUp] Level SEBELUM: ${currentDrillDownLevel}`);
    if (currentDrillDownLevel === 'desa') {
        currentDrillDownLevel = 'kecamatan';
        selectedKecamatan = null;
    } else if (currentDrillDownLevel === 'kecamatan') {
        currentDrillDownLevel = 'kabupaten';
        selectedKabupaten = null;
        selectedKecamatan = null;
    } else { return; } // Sudah di level teratas
    // console.log(`[Dashboard:DrillUp] Level SETELAH: ${currentDrillDownLevel}`);
    updateRegionalChartDrilldown();
    // console.log(`[Dashboard:DrillUp] === Selesai Aksi Kembali ===`); // Komentari jika terlalu berisik
}


/**
 * Menghitung statistik dan merender grafik di tab Dashboard.
 */
function updateDashboard() {
    console.log("[Dashboard] === Memulai Pembaruan Dashboard ===");

    if (typeof STORAGE_KEYS === 'undefined' || typeof getDataFromStorage !== 'function') {
        console.error("[Dashboard] STORAGE_KEYS or getDataFromStorage is not defined.");
        return;
    }

    try {
        allGrievanceData = getDataFromStorage(STORAGE_KEYS.grievances);
        if (!Array.isArray(allGrievanceData)) {
             console.warn("[Dashboard] Data pengaduan dari storage bukan array, diinisialisasi sebagai array kosong.");
             allGrievanceData = [];
        }
    } catch (e) {
        console.error("[Dashboard] Error mengambil data pengaduan:", e);
        allGrievanceData = [];
    }
    console.log(`[Dashboard] ${allGrievanceData.length} data pengaduan diambil.`);

    // 1. Hitung Statistik Dasar
    const totalPengaduan = allGrievanceData.length;
    const statusCounts = allGrievanceData.reduce((acc, item) => {
        const status = item.status || 'Unknown'; acc[status] = (acc[status] || 0) + 1; return acc;
    }, { 'On Progress': 0, 'Hold': 0, 'Done': 0 });
    const kategoriCounts = allGrievanceData.reduce((acc, item) => {
        if (item.kategori) acc[item.kategori] = (acc[item.kategori] || 0) + 1; return acc;
    }, {});
    const prioritasCounts = allGrievanceData.reduce((acc, item) => {
        if (item.prioritas) acc[item.prioritas] = (acc[item.prioritas] || 0) + 1; return acc;
    }, {});

    // 2. Tampilkan Statistik di Kartu
    const setStat = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setStat('totalPengaduan', totalPengaduan);
    setStat('totalOnprogress', statusCounts['On Progress'] || 0);
    setStat('totalHold', statusCounts['Hold'] || 0);
    setStat('totalDone', statusCounts['Done'] || 0);
    const kategoriListForStats = ['Lingkungan', 'Sosial', 'Infrastruktur', 'Ketenagakerjaan', 'Umum'];
    kategoriListForStats.forEach(kategori => { setStat(`total${kategori.replace(/\s+/g, '')}`, kategoriCounts[kategori] || 0); });

    // 3. Siapkan Data untuk Grafik Non-Regional & Kategori per Status
    const kategoriLabels = Object.keys(kategoriCounts);
    const kategoriValues = Object.values(kategoriCounts);
    const statusLabels = ['On Progress', 'Hold', 'Done'];
    const statusValues = statusLabels.map(label => statusCounts[label] || 0);
    const prioritasLabels = ['Low Risk', 'Medium Risk', 'High Risk'];
    const prioritasValues = prioritasLabels.map(label => prioritasCounts[label] || 0);

    // 3a. Hitung Kategori per Status
    const categoryStatusCounts = allGrievanceData.reduce((acc, item) => {
        const status = item.status || 'Unknown';
        const category = item.kategori || 'Unknown';
        if (status !== 'Unknown' && category !== 'Unknown') {
            if (!acc[status]) acc[status] = {};
            acc[status][category] = (acc[status][category] || 0) + 1;
        }
        return acc;
    }, { 'On Progress': {}, 'Hold': {}, 'Done': {} });
    // console.log("[Dashboard] Kategori per Status Counts:", categoryStatusCounts);

    // 3b. Siapkan Data untuk Grafik Stacked Bar Kategori per Status
    const allCategories = [...new Set(allGrievanceData.map(item => item.kategori).filter(Boolean))].sort();
    const statusOrder = ['On Progress', 'Hold', 'Done'];
    const categoryColors = {
        'Lingkungan': 'rgba(46, 204, 113, 0.7)', 'Sosial': 'rgba(52, 152, 219, 0.7)',
        'Infrastruktur': 'rgba(155, 89, 182, 0.7)', 'Ketenagakerjaan': 'rgba(230, 126, 34, 0.7)',
        'Umum': 'rgba(127, 140, 141, 0.7)', 'Unknown': 'rgba(52, 73, 94, 0.7)'
    };
    const categoryStatusDatasets = allCategories.map(category => ({
        label: category,
        data: statusOrder.map(status => categoryStatusCounts[status]?.[category] || 0),
        backgroundColor: categoryColors[category] || categoryColors['Unknown'],
    }));
    // console.log("[Dashboard] Datasets untuk Category Status Chart:", categoryStatusDatasets);


    // 4. Definisikan Warna Grafik Non-Regional
    const pieColors = ['#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f1c40f', '#1abc9c', '#34495e', '#7f8c8d', '#d35400', '#2c3e50'];
    const statusColors = ['rgba(52, 152, 219, 0.8)', 'rgba(243, 156, 18, 0.8)', 'rgba(46, 204, 113, 0.8)'];
    const prioritasColors = ['rgba(46, 204, 113, 0.8)', 'rgba(243, 156, 18, 0.8)', 'rgba(231, 76, 60, 0.8)'];

    // 5. Render Chart Non-Regional
    renderOrUpdateChart('pieChart', 'pieChartInstance', 'doughnut', kategoriLabels, kategoriValues, pieColors.slice(0, kategoriLabels.length), 'Distribusi Kategori Pengaduan');
    renderOrUpdateChart('barChart', 'barChartInstance', 'bar', statusLabels, statusValues, statusColors, 'Jumlah Pengaduan per Status');
    renderOrUpdateChart('priorityChart', 'priorityChartInstance', 'bar', prioritasLabels, prioritasValues, prioritasColors, 'Distribusi Prioritas Pengaduan');

    // 6. Render Grafik Kategori per Status (Stacked Bar)
    renderOrUpdateChart(
        'categoryStatusChart',          // ID Canvas baru
        'categoryStatusChartInstance',  // Nama instance baru
        'bar',                          // Tipe chart
        statusOrder,                    // Label sumbu X (Status)
        categoryStatusDatasets,         // Data (array of datasets per kategori)
        [],                             // Array warna tidak digunakan (sudah di datasets)
        'Distribusi Kategori Berdasarkan Status', // Judul
        null,                           // Tidak ada onClick handler
        true                            // isStacked = true
    );

    // 7. Inisialisasi Grafik Regional Drilldown
    currentDrillDownLevel = 'kabupaten'; // Reset state
    selectedKabupaten = null;
    selectedKecamatan = null;
    updateRegionalChartDrilldown(); // Render chart regional awal

    // Tambahkan event listener untuk tombol kembali HANYA SEKALI
    const backButton = document.getElementById('regionalChartBackButton');
    if (backButton) {
        if (!backButton.dataset.listenerAttached) {
            backButton.addEventListener('click', handleRegionalChartDrillUp);
            backButton.dataset.listenerAttached = 'true';
            console.log("[Dashboard] Event listener tombol kembali grafik regional ditambahkan.");
        }
    } else {
         console.error("[Dashboard] Tombol kembali #regionalChartBackButton tidak ditemukan!");
    }

    console.log("[Dashboard] === Pembaruan Dashboard Selesai ===");
}

// Pastikan fungsi dipanggil saat DOM siap atau saat tab dashboard aktif (diatur oleh main.js)
console.log("dashboard.js loaded (with dynamic regional colors).");

