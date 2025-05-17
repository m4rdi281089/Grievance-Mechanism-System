// js/auth.js

// Variabel `currentUsers` seharusnya sudah diinisialisasi oleh config.js

/**
 * Menangani proses submit form login.
 */
function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    if (!usernameInput || !passwordInput) {
        console.error("[Auth:Login] Error: Input username atau password tidak ditemukan.");
        if (loginError) {
            loginError.textContent = "Kesalahan internal: Elemen form tidak ditemukan.";
            loginError.style.display = 'block';
        }
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    console.log("[Auth:Login] Mencoba login untuk:", username);
    if (typeof currentUsers === 'undefined' || currentUsers === null || Object.keys(currentUsers).length === 0) {
         console.error("[Auth:Login] Fatal: Objek 'currentUsers' tidak terdefinisi atau kosong.");
         if (loginError) {
             loginError.textContent = "Error: Konfigurasi pengguna tidak dimuat atau kosong.";
             loginError.style.display = 'block';
         }
         if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Error Kritis', 'Konfigurasi pengguna gagal dimuat atau kosong.', 'danger');
         }
         return;
    }

    const userAccount = currentUsers[username];
    const userExists = !!userAccount;
    const passwordMatch = userExists && userAccount.password === password;

    if (passwordMatch) {
        const userRole = userAccount.role || 'Guest';
        let userPermissions = Array.isArray(userAccount.permissions) ? userAccount.permissions : [];
        // Pastikan permission keys di sini (misal 'inputContent') sesuai dengan yang digunakan di setupMainNavigation
        // dan value checkbox di modal user management.

        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('loggedInUsername', username);
        sessionStorage.setItem('userRole', userRole);
        sessionStorage.setItem('userPermissions', JSON.stringify(userPermissions));

        console.log(`[Auth:Login] Berhasil: '${username}' login. Peran: '${userRole}', Izin: [${userPermissions.join(', ')}]. Redirect...`);
        if (loginError) loginError.style.display = 'none';
        window.location.href = 'index.html';
    } else {
        const reason = !userExists ? 'Pengguna tidak ditemukan' : 'Password salah';
        console.warn(`[Auth:Login] Gagal untuk ${username}. Alasan: ${reason}`);
        if (loginError) {
             loginError.textContent = "Username atau password salah.";
             loginError.style.display = 'block';
        }
        if (passwordInput) passwordInput.value = '';
        if (typeof tampilkanNotifikasi === 'function') {
            tampilkanNotifikasi('Login Gagal', 'Username atau password salah.', 'danger');
        }
    }
}

/**
 * Menangani proses logout.
 */
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loggedInUsername');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userPermissions');
    console.log("[Auth:Logout] Pengguna logout. Redirect ke login.html...");
    const params = new URLSearchParams();
    params.append('notificationType', 'info');
    params.append('notificationTitle', 'Logout Berhasil');
    params.append('notificationMessage', 'Anda telah berhasil logout.');
    window.location.href = `login.html?${params.toString()}`;
}

/**
 * Memeriksa status login saat halaman dimuat dan melakukan redirect jika perlu.
 * Memanggil setupNavigationVisibility jika pengguna login di index.html.
 * @returns {boolean} True jika pengguna diizinkan di halaman saat ini, false jika redirect terjadi.
 */
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log(`[Auth:Check] Status di halaman: ${currentPage}. Login: ${isLoggedIn}`);

    if (currentPage === 'index.html') {
        if (!isLoggedIn) {
            console.log("[Auth:Check] Belum login di index.html. Redirect ke login.html...");
            window.location.href = 'login.html';
            return false; // Redirect terjadi
        } else {
            console.log("[Auth:Check] Sudah login di index.html. Menyiapkan UI...");
            const appSection = document.getElementById('appSection');
            if(appSection) appSection.style.display = 'block'; // Tampilkan konten aplikasi utama
            document.body.classList.remove('login-page-body'); // Hapus kelas body login
            document.body.style.display = ''; // Reset style body
            document.body.style.justifyContent = '';
            document.body.style.alignItems = '';
            setupNavigationVisibility(); // Panggil untuk mengatur visibilitas navigasi utama
            return true; // Pengguna diizinkan
        }
    } else if (currentPage === 'login.html') {
        if (isLoggedIn) {
            console.log("[Auth:Check] Sudah login di login.html. Redirect ke index.html...");
            window.location.href = 'index.html';
            return false; // Redirect terjadi
        } else {
             console.log("[Auth:Check] Belum login di login.html. Menyiapkan UI login...");
             document.body.classList.add('login-page-body');
             document.body.style.display = 'flex';
             document.body.style.justifyContent = 'center';
             document.body.style.alignItems = 'center';
            return true; // Pengguna diizinkan
        }
    }
    console.log(`[Auth:Check] Halaman ${currentPage} tidak memerlukan cek login khusus atau sudah ditangani.`);
    return true; // Default, pengguna diizinkan
}

/**
 * Mengatur visibilitas item navigasi utama berdasarkan izin pengguna.
 * Fungsi ini dipanggil setelah login berhasil dan saat index.html dimuat.
 */
function setupNavigationVisibility() {
    const permissionsString = sessionStorage.getItem('userPermissions');
    let userPermissions = [];
    try {
        userPermissions = permissionsString ? JSON.parse(permissionsString) : [];
        if (!Array.isArray(userPermissions)) {
             console.warn("[Auth:NavVisibility] Izin dari sessionStorage bukan array, menggunakan array kosong:", userPermissions);
             userPermissions = [];
        }
    } catch (e) {
        console.error("[Auth:NavVisibility] Error parsing izin pengguna dari sessionStorage:", e);
        userPermissions = [];
    }

    console.log("[Auth:NavVisibility] Mengatur visibilitas navigasi utama berdasarkan izin:", userPermissions);

    // Mapping dari ID item navigasi (<li>) ke permission key yang sesuai.
    // Permission key ini HARUS SAMA dengan value checkbox di modal user management (index.html)
    // dan dengan keys di permissionMap dalam ui.js (setupMainNavigation).
    const navItemPermissionMap = {
        'nav-item-input': 'inputContent',       // Target section ID: inputContent
        'nav-item-proses': 'prosesContent',     // Target section ID: prosesContent
        'nav-item-dashboard': 'dashboardContent', // Target section ID: dashboardContent
        'nav-item-user': 'userManagementContent'// Target section ID: userManagementContent
    };

    Object.entries(navItemPermissionMap).forEach(([navItemId, permissionKey]) => {
        const navListItem = document.getElementById(navItemId); // Ini adalah <li>
        if (navListItem) {
            if (userPermissions.includes(permissionKey)) {
                navListItem.style.display = ''; // Tampilkan item navigasi
                console.log(`[Auth:NavVisibility] Navigasi '${navItemId}' (membutuhkan izin '${permissionKey}') -> VISIBLE`);
            } else {
                navListItem.style.display = 'none'; // Sembunyikan item navigasi
                console.log(`[Auth:NavVisibility] Navigasi '${navItemId}' (membutuhkan izin '${permissionKey}') -> HIDDEN`);
            }
        } else {
            console.warn(`[Auth:NavVisibility] Elemen navigasi <li> dengan ID '${navItemId}' tidak ditemukan.`);
        }
    });

    // Logika untuk mengaktifkan tab pertama yang terlihat sudah dipindahkan ke `setupMainNavigation` di `ui.js`.
    // `setupMainNavigation` akan dipanggil setelah ini dari `main.js -> initializeAppData`.
    console.log("[Auth:NavVisibility] Visibilitas item navigasi utama selesai diatur.");
}

console.log("auth.js loaded (dengan penyesuaian untuk navigasi dropdown dan visibilitas)");
