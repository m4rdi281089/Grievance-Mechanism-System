// js/main.js

/**
 * Fungsi untuk menginisialisasi semua data dan event listener
 * yang diperlukan saat aplikasi (index.html) dimuat dan pengguna sudah login.
 */
function initializeAppData() {
    console.log("[Main] Menginisialisasi data aplikasi untuk index.html...");

    // Pastikan fungsi-fungsi UI penting tersedia
    if (typeof displayUserInfo !== 'function' ||
        typeof addLogoutButton !== 'function' ||
        typeof setupMainNavigation !== 'function') { // setupProsesDropdownNavigation sudah tidak dipanggil
        console.error("[Main] Fungsi UI penting (displayUserInfo/addLogoutButton/setupMainNavigation) tidak ditemukan.");
        const body = document.querySelector('body');
        if (body) body.innerHTML = '<div class="alert alert-danger m-5">Error Kritis: Gagal memuat komponen UI dasar. Silakan refresh atau hubungi support.</div>';
        return;
    }

    // Tampilkan info user dan tombol logout di header
    displayUserInfo(); // Dari ui.js
    addLogoutButton(); // Dari ui.js

    // 1. Setup Navigasi Utama - Ini akan menangani tampilan section awal dan sub-section Proses
    setupMainNavigation(); // Dari ui.js
    console.log("[Main] Navigasi utama (main dropdown) disiapkan.");

    // 2. HAPUS/KOMENTARI pemanggilan setupProsesDropdownNavigation
    // setupProsesDropdownNavigation(); // Dari ui.js // <-- BARIS INI HARUS DIHAPUS/DIKOMENTARI
    // console.log("[Main] Navigasi dropdown untuk sub-menu Proses Pengaduan disiapkan."); // Log ini juga bisa dihapus

    // 3. Isi Dropdown Wilayah Awal di Form Input (akan dihandle oleh setupMainNavigation saat #inputContent aktif)
    // if (typeof populateKabupatenDropdown === 'function') {
    //     populateKabupatenDropdown();
    // }

    // 4. Set Tanggal Default ke Hari Ini di Form Input
    const today = new Date().toISOString().split('T')[0];
    const tanggalInput = document.getElementById('tanggal');
    if (tanggalInput) {
        tanggalInput.value = today;
        // console.log("[Main] Tanggal default diatur ke:", today);
    } else {
        console.warn("[Main] Elemen input tanggal #tanggal tidak ditemukan.");
    }

    // 5. Generate Nomor Referensi Awal (akan dihandle oleh setupMainNavigation saat #inputContent aktif)
    // if (typeof generateNoRef === 'function' && !document.getElementById('noReferensi').value) {
    //     generateNoRef();
    // }

    // 6. Isi Dropdown ID di Form Proses (akan dihandle oleh showProsesSubPane saat form proses aktif)
    // if (typeof populateProcessDropdowns === 'function') {
    //     populateProcessDropdowns();
    // }
    // if (typeof selectLastIdInProcessForms === 'function') {
    //     selectLastIdInProcessForms();
    // }


    // 7. Setup Event Listeners (hanya untuk elemen di index.html)
    console.log("[Main] Memasang event listeners...");

    const kabupatenSelect = document.getElementById('kabupaten');
    const kecamatanSelect = document.getElementById('kecamatan');
    if (kabupatenSelect && typeof updateKecamatanDropdown === 'function') {
        kabupatenSelect.addEventListener('change', updateKecamatanDropdown);
    }
    if (kecamatanSelect && typeof updateDesaDropdown === 'function') {
        kecamatanSelect.addEventListener('change', updateDesaDropdown);
    }

    const kategoriSelect = document.getElementById('kategori');
    const tanggalInputRef = document.getElementById('tanggal'); // Nama variabel disesuaikan
    if (kategoriSelect && typeof generateNoRef === 'function') {
        kategoriSelect.addEventListener('change', generateNoRef);
    }
    if (tanggalInputRef && typeof generateNoRef === 'function') {
        tanggalInputRef.addEventListener('change', generateNoRef);
    }

    const formPengaduan = document.getElementById("formPengaduan");
    if (formPengaduan) {
        formPengaduan.addEventListener("submit", function (e) {
            e.preventDefault();
            // console.log("[Main:Event] Form #formPengaduan disubmit.");
            const editIndex = this.getAttribute('data-edit-index');
            if (editIndex !== null) {
                if (typeof updateGrievance === 'function') updateGrievance(parseInt(editIndex));
                else console.error("[Main] Fungsi updateGrievance tidak ditemukan.");
            } else {
                 if (typeof saveNewGrievance === 'function') saveNewGrievance();
                 else console.error("[Main] Fungsi saveNewGrievance tidak ditemukan.");
            }
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn && typeof setEditMode === 'function') {
        resetBtn.addEventListener('click', () => setEditMode(false)); // Memanggil setEditMode dengan false
    }

    const searchInput = document.getElementById("searchInput");
    const filterStatusSelect = document.getElementById("filterStatus");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    if (searchInput && typeof displayGrievanceData === 'function') {
         searchInput.addEventListener('input', displayGrievanceData);
    }
    if (filterStatusSelect && typeof displayGrievanceData === 'function') {
         filterStatusSelect.addEventListener('change', displayGrievanceData);
    }
    if (resetFilterBtn && typeof resetTableFilters === 'function') {
         resetFilterBtn.addEventListener('click', resetTableFilters);
    }

    const exportExcelBtn = document.getElementById('exportExcelBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const printTableBtn = document.getElementById('printTableBtn');
    if (exportExcelBtn && typeof exportFilteredDataToExcel === 'function') {
         exportExcelBtn.addEventListener('click', exportFilteredDataToExcel);
    }
    if (exportPdfBtn && typeof exportFilteredDataToPDF === 'function') {
         exportPdfBtn.addEventListener('click', exportFilteredDataToPDF);
    }
    if (printTableBtn && typeof printFilteredDataTable === 'function') {
         printTableBtn.addEventListener('click', printFilteredDataTable);
    }

    // Event listener untuk perubahan ID di form proses
    const idEvaluasiSelect = document.getElementById('idEvaluasi');
    const idTanggapanSelect = document.getElementById('idTanggapan');
    const idBandingSelect = document.getElementById('idBanding');
    if (idEvaluasiSelect && typeof handleEvaluasiIdChange === 'function') { // handle... dari process.js
         idEvaluasiSelect.addEventListener('change', handleEvaluasiIdChange);
    }
    if (idTanggapanSelect && typeof handleTanggapanIdChange === 'function') {
         idTanggapanSelect.addEventListener('change', handleTanggapanIdChange);
    }
    if (idBandingSelect && typeof handleBandingIdChange === 'function') {
         idBandingSelect.addEventListener('change', handleBandingIdChange);
    }

    // Event listener untuk submit form proses
    const formEvaluasi = document.getElementById("formEvaluasi");
    const formTanggapan = document.getElementById("formTanggapan");
    const formBanding = document.getElementById("formBanding");
    if (formEvaluasi && typeof handleProcessFormSubmit === 'function') { // handleProcessFormSubmit dari process.js
         formEvaluasi.addEventListener("submit", handleProcessFormSubmit);
    }
    if (formTanggapan && typeof handleProcessFormSubmit === 'function') {
         formTanggapan.addEventListener("submit", handleProcessFormSubmit);
    }
    if (formBanding && typeof handleProcessFormSubmit === 'function') {
         formBanding.addEventListener("submit", handleProcessFormSubmit);
    }

    const refreshRiwayatBtn = document.getElementById('refreshRiwayatBtn');
    if (refreshRiwayatBtn && typeof displayProcessHistory === 'function') { // displayProcessHistory dari process.js
         refreshRiwayatBtn.addEventListener('click', displayProcessHistory);
    }
    console.log("[Main] Pemasangan event listeners selesai.");
    console.log("[Main] Inisialisasi aplikasi selesai sepenuhnya.");
}

/**
 * Event listener utama yang dijalankan saat DOM halaman index.html selesai dimuat.
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log("[Main] Index page DOM fully loaded and parsed.");
    if (typeof checkLoginStatus === 'function') { // checkLoginStatus dari auth.js
        if (checkLoginStatus()) { // Jika true, pengguna login dan diizinkan di halaman ini
            initializeAppData();
        } else {
            // checkLoginStatus sudah menangani redirect jika diperlukan
            console.log("[Main] checkLoginStatus returned false, redirecting or access denied. Skipping app initialization.");
        }
    } else {
         console.error("[Main] Fungsi checkLoginStatus (dari auth.js) tidak ditemukan! Aplikasi tidak dapat memulai dengan benar.");
         const body = document.querySelector('body');
         if (body) body.innerHTML = '<div class="alert alert-danger m-5">Error Kritis: Gagal memverifikasi status login. Aplikasi tidak dapat dimuat.</div>';
    }
});

console.log("main.js loaded (revised for sub-navigation handling)");
