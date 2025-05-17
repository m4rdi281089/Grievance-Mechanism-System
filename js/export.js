// js/export.js

/**
 * Mengekspor data pengaduan yang ditampilkan saat ini (setelah filter) ke file Excel (.xlsx).
 */
function exportFilteredDataToExcel() {
    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances); // Ambil semua data
    // Terapkan filter yang sama seperti di tabel
    const searchInput = document.getElementById("searchInput");
    const filterStatusSelect = document.getElementById("filterStatus");
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterStatus = filterStatusSelect ? filterStatusSelect.value : 'all';

    const filteredData = dataPengaduan.filter(item => {
         const matchesSearch = !searchTerm || (
            (item.noReferensi && item.noReferensi.toLowerCase().includes(searchTerm)) ||
            (item.pelapor && item.pelapor.toLowerCase().includes(searchTerm)) ||
            (item.kategori && item.kategori.toLowerCase().includes(searchTerm)) ||
            (item.desa && item.desa.toLowerCase().includes(searchTerm)) ||
            (item.kecamatan && item.kecamatan.toLowerCase().includes(searchTerm)) ||
            (item.kabupaten && item.kabupaten.toLowerCase().includes(searchTerm)) ||
            (item.pic && item.pic.toLowerCase().includes(searchTerm))
        );
        const matchesStatus = filterStatus === 'all' || (item.status && item.status === filterStatus);
        return matchesSearch && matchesStatus;
    });


    if (filteredData.length === 0) {
        tampilkanNotifikasi('Info', 'Tidak ada data (sesuai filter saat ini) untuk diekspor ke Excel.', 'info');
        return;
    }

     // Cek apakah library XLSX tersedia
    if (typeof XLSX === 'undefined') {
        tampilkanNotifikasi('Error', 'Library Excel (SheetJS/XLSX) tidak ditemukan. Gagal mengekspor.', 'danger');
        console.error("XLSX library is not loaded.");
        return;
    }

    // Definisikan header kolom untuk Excel
    const headers = [
        'No', 'No Referensi', 'Tanggal', 'Kategori', 'Nama Pelapor', 'Kontak',
        'Kabupaten', 'Kecamatan', 'Desa', 'Aksi', 'Status', 'PIC', 'Prioritas',
        'Deskripsi', 'Tenggat Waktu'
    ];
    // Siapkan data untuk sheet (header + data baris)
    const ws_data = [ headers ];
    filteredData.forEach((item, index) => {
        ws_data.push([
            index + 1, // Nomor urut
            item.noReferensi || '', item.tanggal || '', item.kategori || '', item.pelapor || '',
            item.kontak || '', // Pastikan kontak ada
            item.kabupaten || '', item.kecamatan || '', item.desa || '',
            item.aksi || '', item.status || '', item.pic || '', item.prioritas || '',
            item.deskripsi || '', item.tenggat || ''
        ]);
    });

    // Buat workbook dan worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Atur lebar kolom (opsional, sesuaikan sesuai kebutuhan)
    // Format: { wch: character_width }
    ws['!cols'] = [
        { wch: 5 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
        { wch: 12 }, { wch: 40 }, { wch: 12 }
    ];

    // Tambahkan worksheet ke workbook
    XLSX.utils.book_append_sheet(wb, ws, "Data Pengaduan");

    // Buat nama file dengan tanggal
    const tanggal = new Date().toISOString().split('T')[0];
    const filename = `Data_Pengaduan_${tanggal}.xlsx`;

    // Unduh file Excel
    XLSX.writeFile(wb, filename);
    tampilkanNotifikasi('Sukses', 'Ekspor data ke Excel berhasil!', 'success');
}

/**
 * Mengekspor data pengaduan yang ditampilkan saat ini (setelah filter) ke file PDF (.pdf).
 */
function exportFilteredDataToPDF() {
    // Cek ketersediaan jsPDF dan autoTable
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined' || typeof window.jspdf.jsPDF.API?.autoTable === 'undefined') {
        tampilkanNotifikasi('Error', 'Library PDF (jsPDF / autoTable) tidak ditemukan. Gagal mengekspor.', 'danger');
        console.error("jsPDF or jsPDF.autoTable is not loaded.");
        return;
    }
    const { jsPDF } = window.jspdf; // Ambil konstruktor jsPDF

    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances); // Ambil semua data
    // Terapkan filter yang sama seperti di tabel
    const searchInput = document.getElementById("searchInput");
    const filterStatusSelect = document.getElementById("filterStatus");
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filterStatus = filterStatusSelect ? filterStatusSelect.value : 'all';

    const filteredData = dataPengaduan.filter(item => {
         const matchesSearch = !searchTerm || (
            (item.noReferensi && item.noReferensi.toLowerCase().includes(searchTerm)) ||
            (item.pelapor && item.pelapor.toLowerCase().includes(searchTerm)) ||
            (item.kategori && item.kategori.toLowerCase().includes(searchTerm)) ||
            (item.desa && item.desa.toLowerCase().includes(searchTerm)) ||
            (item.kecamatan && item.kecamatan.toLowerCase().includes(searchTerm)) ||
            (item.kabupaten && item.kabupaten.toLowerCase().includes(searchTerm)) ||
            (item.pic && item.pic.toLowerCase().includes(searchTerm))
        );
        const matchesStatus = filterStatus === 'all' || (item.status && item.status === filterStatus);
        return matchesSearch && matchesStatus;
    });

    if (filteredData.length === 0) {
        tampilkanNotifikasi('Info', 'Tidak ada data (sesuai filter saat ini) untuk diekspor ke PDF.', 'info');
        return;
    }

    // Buat dokumen PDF baru (orientasi landscape)
    const doc = new jsPDF({ orientation: 'landscape' });

    // Tambahkan judul laporan
    doc.setFontSize(16);
    doc.text('Laporan Data Pengaduan', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Filter: ${searchTerm ? `"${searchTerm}"` : 'Tidak ada'} | Status: ${filterStatus === 'all' ? 'Semua' : filterStatus}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, doc.internal.pageSize.getWidth() / 2, 27, { align: 'center' });


    // Definisikan header kolom untuk tabel PDF
    const headers = [ "No", "No. Ref", "Tanggal", "Kategori", "Pelapor", "Lokasi", "Status", "Prioritas", "PIC" ];
    // Siapkan data body tabel PDF
    const body = filteredData.map((item, index) => [
        index + 1,
        item.noReferensi || '-',
        item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}) : '-', // Format tgl: 01 Jan 2024
        item.kategori || '-',
        item.pelapor || '-',
        `${item.desa || ''}, ${item.kecamatan || ''}`, // Gabungkan lokasi
        item.status || '-',
        item.prioritas || '-',
        item.pic || '-'
    ]);

    // Buat tabel menggunakan autoTable
    doc.autoTable({
        head: [headers],
        body: body,
        startY: 35, // Posisi awal tabel setelah judul
        theme: 'grid', // Tema tabel (grid, striped, plain)
        styles: { fontSize: 8, cellPadding: 2, halign: 'center', valign: 'middle' },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', halign: 'center' }, // Header gelap
        alternateRowStyles: { fillColor: [245, 245, 245] }, // Baris belang
        columnStyles: { // Atur perataan kolom spesifik
            0: { halign: 'center', cellWidth: 10 }, // No
            1: { halign: 'left', cellWidth: 35 }, // No Ref
            2: { halign: 'center', cellWidth: 20 }, // Tanggal
            3: { halign: 'left', cellWidth: 25 }, // Kategori
            4: { halign: 'left', cellWidth: 35 }, // Pelapor
            5: { halign: 'left', cellWidth: 40 }, // Lokasi
            6: { halign: 'center', cellWidth: 20 }, // Status
            7: { halign: 'center', cellWidth: 20 }, // Prioritas
            8: { halign: 'left', cellWidth: 20 } // PIC
        },
        didDrawPage: function (data) {
            // Tambahkan nomor halaman di setiap halaman
            doc.setFontSize(8);
            const pageCount = doc.internal.getNumberOfPages();
            doc.text(`Halaman ${data.pageNumber} dari ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        }
    });

    // Buat nama file dengan tanggal
    const tanggal = new Date().toISOString().split('T')[0];
    doc.save(`Laporan_Pengaduan_${tanggal}.pdf`); // Unduh file PDF
    tampilkanNotifikasi('Sukses', 'Ekspor data ke PDF berhasil!', 'success');
}


/**
 * Membuka jendela baru untuk mencetak tabel data pengaduan yang sedang ditampilkan.
 */
function printFilteredDataTable() {
    const tableToPrint = document.getElementById('tabelData');
    if (!tableToPrint) {
        tampilkanNotifikasi('Error', 'Tabel data tidak ditemukan untuk dicetak.', 'danger');
        return;
    }
    const tableBody = tableToPrint.querySelector('tbody');
    if (!tableBody || tableBody.children.length === 0 || tableBody.querySelector('td[colspan]')) {
         tampilkanNotifikasi('Info', 'Tidak ada data (sesuai filter saat ini) untuk dicetak.', 'info');
         return;
    }


    // Buat jendela baru untuk pratinjau cetak
    const printWindow = window.open('', '_blank', 'height=600,width=900'); // Lebarkan sedikit

    printWindow.document.write('<html><head><title>Cetak Data Pengaduan</title>');
    // Sertakan CSS Bootstrap untuk styling dasar tabel
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">');
    // Tambahkan gaya cetak kustom
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { margin: 20px; font-family: sans-serif; font-size: 10pt; }
        h2 { text-align: center; margin-bottom: 5px; }
        p.print-info { text-align: center; font-size: 9pt; margin-bottom: 15px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: middle; }
        th { background-color: #e9ecef; font-weight: bold; }
        .text-center { text-align: center !important; }
        /* Sembunyikan tombol aksi saat mencetak */
        .btn, button { display: none !important; }
        /* Styling badge sederhana untuk cetak */
        .badge {
            border: 1px solid #ccc;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9pt;
            white-space: nowrap;
            display: inline-block; /* Agar tidak pecah baris */
            margin: 1px;
            background-color: #f8f9fa !important; /* Warna netral untuk cetak */
            color: #212529 !important; /* Warna teks gelap */
        }
        .badge i { display: none; } /* Sembunyikan ikon di badge cetak */
        /* Pastikan warna background tercetak */
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th { background-color: #e9ecef !important; }
        }
    `);
    printWindow.document.write('</style></head><body>');

    // Tambahkan judul dan info cetak
    printWindow.document.write('<h2>Data Pengaduan</h2>');
    const searchInput = document.getElementById("searchInput");
    const filterStatusSelect = document.getElementById("filterStatus");
    const searchTerm = searchInput ? searchInput.value : '';
    const filterStatus = filterStatusSelect ? filterStatusSelect.value : 'all';
    printWindow.document.write(`<p class="print-info">Filter: ${searchTerm ? `"${searchTerm}"` : 'Tidak ada'} | Status: ${filterStatus === 'all' ? 'Semua' : filterStatus} | Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>`);


    // Klon tabel asli untuk dimodifikasi
    const tableClone = tableToPrint.cloneNode(true);

    // Hapus kolom 'Aksi' dari tabel kloningan
    const actionHeaderIndex = Array.from(tableClone.querySelectorAll('thead th')).findIndex(th => th.textContent.trim() === 'Aksi');
    if (actionHeaderIndex > -1) {
        Array.from(tableClone.rows).forEach(row => {
            if (row.cells.length > actionHeaderIndex) {
                row.deleteCell(actionHeaderIndex);
            }
        });
    }

    // Sederhanakan tampilan badge di tabel kloningan
    tableClone.querySelectorAll('.badge').forEach(badge => {
        let badgeText = badge.textContent.trim(); // Ambil teksnya saja
        badge.outerHTML = `<span class="badge">${badgeText}</span>`; // Ganti dengan span sederhana
    });

    // Tulis tabel yang sudah dimodifikasi ke jendela cetak
    printWindow.document.write(tableClone.outerHTML);
    printWindow.document.write('</body></html>');

    // Tutup dokumen jendela cetak dan fokus
    printWindow.document.close();
    printWindow.focus();

    // Beri sedikit waktu sebelum memanggil print()
    setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // Bisa ditutup otomatis setelah print dialog muncul/selesai
    }, 500);

    tampilkanNotifikasi('Info', 'Mempersiapkan pratinjau cetak...', 'info');
}


console.log("export.js loaded");
