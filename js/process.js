/**
 * Mengisi semua dropdown 'Pilih ID Pengaduan' di form proses (Evaluasi, Tanggapan, Banding).
 */
function populateProcessDropdowns() {
    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
    // Ambil hanya noReferensi yang valid
    const ids = dataPengaduan.map(item => item.noReferensi).filter(Boolean);

    const populateDropdown = (selectId) => {
        const select = document.getElementById(selectId);
        if (!select) return;

        const currentValue = select.value; // Simpan nilai terpilih saat ini
        select.innerHTML = '<option value="">-- Pilih ID Pengaduan --</option>'; // Reset

        ids.forEach(id => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = id;
            select.appendChild(option);
        });

        // Kembalikan nilai terpilih jika masih ada di daftar ID baru
        if (ids.includes(currentValue)) {
            select.value = currentValue;
        } else {
            select.value = ""; // Kosongkan jika ID lama sudah tidak ada
            // Panggil fungsi untuk update info jika ID dikosongkan
            const type = selectId.replace('id',''); // Dapatkan tipe form (Evaluasi, Tanggapan, Banding)
            // Periksa apakah tipe valid sebelum memanggil displayProcessFormInfo
            if (['Evaluasi', 'Tanggapan', 'Banding'].includes(type)) {
                 displayProcessFormInfo(type);
            }
        }
     };

    populateDropdown("idEvaluasi");
    populateDropdown("idTanggapan");
    populateDropdown("idBanding");
}

/**
 * Menampilkan info singkat (Pelapor, Kategori) di bawah dropdown ID Pengaduan pada form proses.
 * @param {'Evaluasi' | 'Tanggapan' | 'Banding'} type Tipe form.
 */
function displayProcessFormInfo(type) {
    const selectId = `id${type}`;
    const infoDivId = `info${type}`;
    const pelaporSpanId = `namaPelapor${type}`;
    const kategoriSpanId = `kategori${type}`;

    const selectedId = getFormValue(selectId); // Fungsi dari crud.js
    const infoDiv = document.getElementById(infoDivId);
    const pelaporSpan = document.getElementById(pelaporSpanId);
    const kategoriSpan = document.getElementById(kategoriSpanId);

    if (!infoDiv || !pelaporSpan || !kategoriSpan) return;

    if (selectedId) {
        const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
        const item = dataPengaduan.find(x => x.noReferensi === selectedId);
        if (item) {
            pelaporSpan.textContent = item.pelapor || 'N/A';
            kategoriSpan.textContent = item.kategori || 'N/A';
            infoDiv.style.display = "block"; // Tampilkan div info
        } else {
            // ID terpilih tapi data tidak ditemukan (seharusnya tidak terjadi jika dropdown diupdate)
            pelaporSpan.textContent = 'N/A';
            kategoriSpan.textContent = 'N/A';
            infoDiv.style.display = "none"; // Sembunyikan div info
        }
    } else {
        // Tidak ada ID yang dipilih
        infoDiv.style.display = "none"; // Sembunyikan div info
    }
}

// Fungsi spesifik untuk memanggil displayProcessFormInfo dari event listener
function handleEvaluasiIdChange() { displayProcessFormInfo('Evaluasi'); }
function handleTanggapanIdChange() { displayProcessFormInfo('Tanggapan'); }
function handleBandingIdChange() { displayProcessFormInfo('Banding'); }

/**
 * Memilih ID Pengaduan terakhir di semua dropdown form proses (jika ada data).
 */
function selectLastIdInProcessForms() {
    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
    if (dataPengaduan.length === 0) return;

    const lastItem = dataPengaduan[dataPengaduan.length - 1];
    const lastId = lastItem ? lastItem.noReferensi : null;
    if (!lastId) return;

    const setDropdownValue = (selectId, infoHandler) => {
        const select = document.getElementById(selectId);
        if (!select) return;
        // Cek apakah ID terakhir ada di opsi dropdown
        if (Array.from(select.options).some(opt => opt.value === lastId)) {
            select.value = lastId;
        } else {
            select.value = ""; // Kosongkan jika tidak ada
        }
        // Panggil handler untuk update info setelah nilai di-set
        infoHandler();
     };

    setDropdownValue("idEvaluasi", handleEvaluasiIdChange);
    setDropdownValue("idTanggapan", handleTanggapanIdChange);
    setDropdownValue("idBanding", handleBandingIdChange);
}

/**
 * Menangani submit form Evaluasi, Tanggapan, dan Banding.
 * Menyimpan data ke localStorage dengan timestamp.
 * @param {Event} e Event submit form.
 */
function handleProcessFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formId = form.id;
    let data = {};
    let storageKey = '';
    let successMessage = '';
    // Gunakan ID input file yang konsisten dengan contoh HTML
    let fileInputId = null;
    let type = ''; // Untuk reset info dan pesan konfirmasi

    try {
        if (formId === "formEvaluasi") {
            type = 'Evaluasi';
            // Sesuaikan ID input file dengan contoh HTML
            fileInputId = "file-input-evaluasi";
            data = {
                id: getFormValue("idEvaluasi"),
                penilaian: getFormValue("penilaian"),
                catatan: getFormValue("catatanEvaluasi")
                // filename akan ditambahkan di bawah jika file dipilih
            };
            storageKey = STORAGE_KEYS.evaluations;
            successMessage = "Evaluasi berhasil disimpan!";
        } else if (formId === "formTanggapan") {
            type = 'Tanggapan';
             // Sesuaikan ID input file dengan contoh HTML
            fileInputId = "file-input-tanggapan";
            data = {
                id: getFormValue("idTanggapan"),
                catatan: getFormValue("catatanTanggapan")
                 // filename akan ditambahkan di bawah jika file dipilih
            };
            storageKey = STORAGE_KEYS.responses;
            successMessage = "Surat Tanggapan berhasil disimpan!";
        } else if (formId === "formBanding") {
            type = 'Banding';
             // Sesuaikan ID input file dengan contoh HTML (sebelumnya 'lampiranBanding')
            fileInputId = "file-input-banding";
            data = {
                id: getFormValue("idBanding"),
                alasan: getFormValue("alasanBanding")
                 // filename akan ditambahkan di bawah jika file dipilih
            };
            storageKey = STORAGE_KEYS.appeals;
            successMessage = "Formulir Banding berhasil disimpan!";
        } else {
            console.warn("Unknown process form submitted:", formId);
            return; // Keluar jika form tidak dikenal
        }

        // Validasi dasar: ID harus dipilih
        if (!data.id) {
            tampilkanNotifikasi('Peringatan', 'Silakan pilih ID Pengaduan terlebih dahulu.', 'warning');
            return;
        }

        // Ambil nama file jika ada input file yang sesuai
        if (fileInputId) {
            const fileInput = document.getElementById(fileInputId);
            // Simpan nama file saja, bukan file sebenarnya
            data.filename = fileInput && fileInput.files.length > 0 ? fileInput.files[0].name : null;

             // Contoh validasi wajib upload (sesuaikan jika perlu)
             // if (formId === "formTanggapan" && !data.filename) {
             //     tampilkanNotifikasi('Peringatan', 'File Surat Tanggapan wajib diupload.', 'warning');
             //     return;
             // }
        } else {
             // Pastikan properti filename ada meskipun null, untuk konsistensi struktur data
             data.filename = null;
        }


        // Tambahkan timestamp saat data disimpan/diperbarui
        data.timestamp = new Date().toISOString();

        const list = getDataFromStorage(storageKey);
        // Cari apakah sudah ada data proses untuk ID ini
        const existingIndex = list.findIndex(item => item.id === data.id);

        if (existingIndex > -1) {
            // Jika sudah ada, tanya konfirmasi untuk menimpa
            if(confirm(`Data ${type} untuk ID ${data.id} sudah ada. Apakah Anda ingin menimpanya dengan data baru?`)){
                list[existingIndex] = data; // Timpa data lama
            } else {
                return; // Batalkan jika pengguna tidak setuju
            }
        } else {
            list.push(data); // Tambahkan data baru jika belum ada
        }

        saveDataToStorage(storageKey, list); // Simpan list yang sudah diperbarui
        tampilkanNotifikasi('Sukses', successMessage, 'success');
        form.reset(); // Reset form setelah berhasil

        // Reset info di bawah dropdown
        // Pastikan fungsi displayProcessFormInfo dipanggil dengan benar
        if (type === 'Evaluasi') handleEvaluasiIdChange();
        else if (type === 'Tanggapan') handleTanggapanIdChange();
        else if (type === 'Banding') handleBandingIdChange();


        // Reset tampilan nama file (jika ada elemen span untuk menampilkannya)
        if (fileInputId) {
            // Buat ID span berdasarkan tipe (lowercase)
            const spanId = `file-name-${type.toLowerCase()}`; // e.g., file-name-banding
            const fileNameSpan = document.getElementById(spanId);
            if (fileNameSpan) {
                fileNameSpan.textContent = ''; // Kosongkan nama file
            }
        }


        // Update tampilan riwayat proses
        displayProcessHistory();

    } catch (error) {
        console.error(`Error submitting ${type} form:`, error);
        tampilkanNotifikasi('Error', `Terjadi kesalahan saat menyimpan data ${type}.`, 'danger');
    }
}

/**
 * Menampilkan gabungan riwayat proses (Evaluasi, Tanggapan, Banding) di tabel.
 */
function displayProcessHistory() {
    const tbody = document.getElementById("riwayatProsesBody");
    if (!tbody) return;

    // Ambil semua data proses
    const listEvaluasi = getDataFromStorage(STORAGE_KEYS.evaluations);
    const listTanggapan = getDataFromStorage(STORAGE_KEYS.responses);
    const listBanding = getDataFromStorage(STORAGE_KEYS.appeals);

    // Gabungkan semua list dan tambahkan properti 'jenis'
    let combinedList = [
        ...listEvaluasi.map(item => ({ ...item, jenis: 'Evaluasi' })),
        ...listTanggapan.map(item => ({ ...item, jenis: 'Tanggapan' })),
        ...listBanding.map(item => ({ ...item, jenis: 'Banding' }))
    ];

    // Urutkan berdasarkan timestamp terbaru di atas
    combinedList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    tbody.innerHTML = ""; // Kosongkan tabel riwayat

    // Tampilkan pesan jika tidak ada riwayat
    if (combinedList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><i class="fas fa-folder-open me-2"></i> Belum ada riwayat proses untuk pengaduan manapun.</td></tr>`;
        return;
    }

    // Format tanggal riwayat (misal: 1 Mei 2025 14:30)
    const formatTanggalRiwayat = (ts) => {
        if (!ts) return "-";
        try {
            // Gunakan locale 'id-ID' untuk format Indonesia
            return new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        } catch (e) { return "-"; }
     };

    // Tampilkan setiap item riwayat dalam tabel
    combinedList.forEach(item => {
        const row = document.createElement("tr");

        // Tentukan teks detail berdasarkan jenis proses
        let detailText = '-';
        if (item.jenis === 'Evaluasi') detailText = `[${item.penilaian || 'N/A'}] ${item.catatan || ''}`;
        else if (item.jenis === 'Tanggapan') detailText = item.catatan || '-';
        else if (item.jenis === 'Banding') detailText = item.alasan || '-';

        // --- PERUBAHAN DI SINI ---
        // Tampilkan nama file sebagai link (simulasi) jika ada
        let fileText = '-';
        if (item.filename) {
            const notificationMessage = 'Pratinjau/unduh file tidak tersedia dalam contoh ini.';
            // Buat link yang hanya menampilkan notifikasi saat diklik
            // Menggunakan href="#" dan return false untuk mencegah navigasi
            // Menambahkan kelas CSS 'file-link' untuk styling jika diperlukan
            fileText = `<a href="#" class="file-link text-decoration-none" title="Nama file: ${item.filename}" onclick="tampilkanNotifikasi('Info', '${notificationMessage}', 'info'); return false;">
                            <i class="fas fa-file-alt me-1"></i>${item.filename}
                        </a>`;
        }
        // --- AKHIR PERUBAHAN ---

        row.innerHTML = `
            <td>${item.id || 'N/A'}</td>
            <td>${formatTanggalRiwayat(item.timestamp)}</td>
            <td>${item.jenis || 'N/A'}</td>
            <td>${detailText}</td>
            <td>${fileText}</td> 
        `; // Menggunakan fileText yang sudah diformat
        tbody.appendChild(row);
    });
}


console.log("process.js loaded");
