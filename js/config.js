// js/config.js

// Konfigurasi Data Wilayah
const wilayah = {
    "Bolaang Mongondow": {
        "Lolayan": ["Lolayan", "Bakan", "Matali Baru", "Mopusi"],
        // Tambahkan kecamatan dan desa lain jika perlu
    },
    "Bolaang Mongondow Selatan": {
        "Pinolosian Tengah": ["Tobayagan", "Tobayagan Selatan"],
        "Pinolosian Timur": ["Motandoi", "Motandoi Selatan", "Dumagin A", "Dumagin B", "Onggunoi", "Onggunoi Selatan", "Pidung", "Dayow"],
        // Tambahkan kecamatan dan desa lain jika perlu
    }
    // Tambahkan kabupaten lain jika perlu
};

// --- Kredensial Login Pengguna ---
const USERS = {
    "Sumardi.Mamonto": {
        password: "28101989",
        role: "Liasion - Administrator",
        permissions: ["inputContent", "prosesContent", "dashboardContent", "userManagementContent"]
    },
    "Benito.Encarnacao": {
        password: "123456789",
        role: "Guest - Assistant",
        permissions: ["inputContent", "prosesContent", "dashboardContent"]
    },
    "Dwi.Hendrawan": {
        password: "1234567890",
        role: "Suptend - Administrator",
        permissions: ["inputContent", "prosesContent", "dashboardContent", "userManagementContent"]
    },
    "admin.utama": { // Contoh admin lain
        password: "adminpass",
        role: "Administrator",
        permissions: ["inputContent", "prosesContent", "dashboardContent", "userManagementContent"]
    }
};
// --- Akhir Kredensial Login Pengguna ---


// Variabel global untuk instance Chart.js
let pieChartInstance = null; // Kategori
let barChartInstance = null; // Status
let priorityChartInstance = null; // Prioritas
let regionalPieChartInstance = null; // Wilayah (Drilldown)
let categoryStatusChartInstance = null; // Kategori per Status (BARU)

// Variabel global untuk state drilldown grafik regional
let currentDrillDownLevel = 'kabupaten'; // 'kabupaten', 'kecamatan', 'desa'
let selectedKabupaten = null;
let selectedKecamatan = null;
let allGrievanceData = []; // Cache data pengaduan untuk dashboard

// Kunci untuk Local Storage
const STORAGE_KEYS = {
    grievances: "dataPengaduan",
    evaluations: "evaluasiList",
    responses: "tanggapanList",
    appeals: "bandingList",
    users: "usersList"
};

// Fungsi helper untuk mendapatkan data dari localStorage
function getDataFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        if (key === STORAGE_KEYS.users && !data) {
             // console.log("[Config] Menggunakan data USERS default dari config.js"); // Komentari jika terlalu berisik
             return JSON.parse(JSON.stringify(USERS));
        }
        return data ? JSON.parse(data) : (key === STORAGE_KEYS.users ? {} : []);
    } catch (e) {
        console.error(`Error reading '${key}' from localStorage:`, e);
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', `Gagal membaca data (${key}) dari penyimpanan lokal.`, 'danger');
        }
        if (key === STORAGE_KEYS.users) {
             console.warn("[Config] Error membaca data pengguna dari localStorage, menggunakan data USERS default.");
             return JSON.parse(JSON.stringify(USERS));
        }
        return [];
    }
}

// Fungsi helper untuk menyimpan data ke localStorage
function saveDataToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        // console.log(`[Config:saveDataToStorage] Data untuk kunci '${key}' berhasil disimpan.`); // Komentari jika terlalu berisik
        // Update cache jika data pengaduan berubah
        if (key === STORAGE_KEYS.grievances) {
            allGrievanceData = Array.isArray(data) ? [...data] : []; // Pastikan data adalah array
            // console.log("[Config] Cache 'allGrievanceData' diperbarui."); // Komentari jika terlalu berisik
        }
        return true;
    } catch (e) {
        console.error(`Error writing '${key}' to localStorage:`, e);
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error', `Gagal menyimpan data (${key}) ke penyimpanan lokal.`, 'danger');
        }
        return false;
    }
}

// Inisialisasi data pengguna dari localStorage saat config.js dimuat
let currentUsers = getDataFromStorage(STORAGE_KEYS.users);

// Validasi dan inisialisasi ulang data pengguna jika perlu
if (Array.isArray(currentUsers) || (Object.keys(currentUsers).length === 0 && Object.keys(USERS).length > 0)) {
    console.warn("[Config] currentUsers kosong, bukan objek, atau tidak sinkron. Menginisialisasi ulang dari USERS default.");
    currentUsers = JSON.parse(JSON.stringify(USERS));
    const storedUsers = localStorage.getItem(STORAGE_KEYS.users);
    if (!storedUsers || storedUsers === "[]" || (typeof JSON.parse(storedUsers) === 'object' && Array.isArray(JSON.parse(storedUsers)))) {
        saveDataToStorage(STORAGE_KEYS.users, currentUsers);
        console.log("[Config] Data pengguna default disimpan ke localStorage.");
    }
}

// Inisialisasi cache data pengaduan dipindahkan ke updateDashboard()

console.log("config.js loaded (with categoryStatusChartInstance). Initial users:", Object.keys(currentUsers));
