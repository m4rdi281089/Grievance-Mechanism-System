// js/login_main.js

/**
 * Event listener utama yang dijalankan saat DOM halaman login selesai dimuat.
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log("Login page DOM fully loaded and parsed.");

    // Periksa status login awal -> redirect jika sudah login
    if (!checkLoginStatus()) { // checkLoginStatus dari auth.js, return false jika redirect terjadi
        return; // Hentikan eksekusi jika redirect
    }

    // Tambahkan event listener ke form login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin); // handleLogin dari auth.js
        console.log("Login form event listener added.");
    } else {
        console.error("Login form not found on login page.");
    }

    // Tambahkan styling body khusus login jika belum ada (ditangani juga di checkLoginStatus)
    document.body.classList.add('login-page-body');
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
});

console.log("login_main.js loaded");
