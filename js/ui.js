// js/ui.js

/**
 * Objek untuk menyimpan deskripsi dan ikon kategori pengaduan.
 */
const deskripsiKategoriPengaduan = {
    "Lingkungan": {
        deskripsi: "Pengaduan terkait isu-isu lingkungan seperti pencemaran, pengelolaan limbah, dan dampak lingkungan lainnya akbiat dari kegiatan operasional.",
        icon: "fas fa-leaf", // Ikon Font Awesome
        className: "kategori-lingkungan-text" // Kelas CSS untuk styling
    },
    "Sosial": {
        deskripsi: "Pengaduan yang berkaitan dengan dampak sosial perusahaan terhadap masyarakat sekitar, termasuk Kompensasi Lahan, pemberdayaan masyarakat, dan hubungan sosial kemasyarakatan lainnya.",
        icon: "fas fa-users",
        className: "kategori-sosial-text"
    },
    "Infrastruktur": {
        deskripsi: "Pengaduan mengenai infrastruktur yang menjadi tanggung jawab atau terdampak oleh kegiatan perusahaan, seperti jalan, jembatan, fasilitas umum, atau kerusakan infrastruktur akibat operasional.",
        icon: "fas fa-building",
        className: "kategori-infrastruktur-text"
    },
    "Ketenagakerjaan": {
        deskripsi: "Pengaduan terkait isu ketenagakerjaan di dalam perusahaan atau yang melibatkan kontraktor/sub-kontraktor, meliputi hak-hak pekerja, kondisi kerja, keselamatan dan kesehatan kerja (K3), serta hubungan industrial.",
        icon: "fas fa-briefcase",
        className: "kategori-ketenagakerjaan-text"
    },
    "Umum": {
        deskripsi: "Pengaduan lain-lain yang tidak termasuk dalam kategori spesifik di atas namun masih relevan dengan operasional atau dampak perusahaan.",
        icon: "fas fa-info-circle",
        className: "kategori-umum-text"
    }
};

/**
 * Menampilkan deskripsi kategori pengaduan yang dipilih dengan gaya yang lebih menarik.
 */
function tampilkanDeskripsiKategori() {
    const kategoriSelect = document.getElementById("kategori");
    const deskripsiDiv = document.getElementById("kategoriDeskripsi");
    const deskripsiContainer = document.getElementById("kategoriDeskripsiContainer");

    if (!kategoriSelect || !deskripsiDiv || !deskripsiContainer) {
        console.warn("[UI] Elemen select kategori, div deskripsi, atau kontainer deskripsi tidak ditemukan.");
        return;
    }

    const selectedValue = kategoriSelect.value;

    // Reset kelas styling sebelumnya
    deskripsiDiv.className = ''; // Hapus semua kelas sebelumnya
    deskripsiDiv.classList.add('p-3'); // Tambahkan kembali kelas padding default jika perlu atau atur di CSS

    if (selectedValue && deskripsiKategoriPengaduan.hasOwnProperty(selectedValue)) {
        const kategoriInfo = deskripsiKategoriPengaduan[selectedValue];
        // Menggunakan innerHTML untuk memasukkan ikon Font Awesome
        deskripsiDiv.innerHTML = `<i class="${kategoriInfo.icon} me-2"></i>${kategoriInfo.deskripsi}`;
        deskripsiDiv.classList.add(kategoriInfo.className); // Tambahkan kelas spesifik kategori
        deskripsiContainer.style.display = "block"; // Tampilkan kontainer
    } else {
        deskripsiDiv.innerHTML = ""; // Kosongkan jika tidak ada pilihan atau deskripsi
        deskripsiContainer.style.display = "none"; // Sembunyikan kontainer
    }
}


/**
 * Mengisi dropdown Kabupaten dari data `wilayah`.
 */
function populateKabupatenDropdown() {
    const kabupatenSelect = document.getElementById("kabupaten");
    if (!kabupatenSelect) {
        console.error("[UI] Dropdown #kabupaten tidak ditemukan.");
        return;
    }
    if (typeof wilayah === 'undefined') {
        console.error("[UI] Variabel 'wilayah' tidak terdefinisi saat mengisi dropdown kabupaten.");
        kabupatenSelect.innerHTML = '<option value="">Error: Data wilayah tidak ada</option>';
        return;
    }
    kabupatenSelect.innerHTML = '<option value="">-- Pilih Kabupaten --</option>';
    Object.keys(wilayah).forEach(kab => {
        const opt = document.createElement("option");
        opt.value = kab;
        opt.textContent = kab;
        kabupatenSelect.appendChild(opt);
    });
    // console.log("[UI] Dropdown Kabupaten diisi.");
}

/**
 * Memperbarui dropdown Kecamatan berdasarkan Kabupaten yang dipilih.
 */
function updateKecamatanDropdown() {
    const kecamatanSelect = document.getElementById("kecamatan");
    const desaSelect = document.getElementById("desa");

    if (!kecamatanSelect || !desaSelect) {
        console.error("[UI] Dropdown #kecamatan atau #desa tidak ditemukan.");
        return;
    }
    if (typeof getFormValue !== 'function') {
         console.error("[UI] Fungsi getFormValue tidak ditemukan.");
         kecamatanSelect.innerHTML = '<option value="">Error: Fungsi helper hilang</option>';
         kecamatanSelect.disabled = true;
         desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
         desaSelect.disabled = true;
         return;
    }
    const kabupaten = getFormValue("kabupaten");

    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    kecamatanSelect.disabled = true;
    desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
    desaSelect.disabled = true;

    if (typeof wilayah === 'undefined') {
        console.error("[UI] Variabel 'wilayah' tidak terdefinisi saat update kecamatan.");
        return;
    }

    if (kabupaten && wilayah.hasOwnProperty(kabupaten)) {
        const kecamatanData = wilayah[kabupaten];
        if (typeof kecamatanData === 'object' && kecamatanData !== null && Object.keys(kecamatanData).length > 0) {
            Object.keys(kecamatanData).forEach(kecamatan => {
                const opt = document.createElement("option");
                opt.value = kecamatan;
                opt.textContent = kecamatan;
                kecamatanSelect.appendChild(opt);
            });
            kecamatanSelect.disabled = false;
            updateDesaDropdown();
        } else {
             console.warn(`[UI] Tidak ada data kecamatan (atau format salah) untuk wilayah[${kabupaten}]:`, kecamatanData);
        }
    }
}

/**
 * Memperbarui dropdown Desa berdasarkan Kecamatan yang dipilih.
 */
function updateDesaDropdown() {
    const desaSelect = document.getElementById("desa");
     if (!desaSelect) {
         console.error("[UI] Dropdown #desa tidak ditemukan.");
         return;
     }
    if (typeof getFormValue !== 'function') {
         console.error("[UI] Fungsi getFormValue tidak ditemukan.");
         desaSelect.innerHTML = '<option value="">Error: Fungsi helper hilang</option>';
         desaSelect.disabled = true;
         return;
    }
    const kabupaten = getFormValue("kabupaten");
    const kecamatan = getFormValue("kecamatan");

    desaSelect.innerHTML = '<option value="">-- Pilih Desa --</option>';
    desaSelect.disabled = true;

    if (typeof wilayah === 'undefined') {
        console.error("[UI] Variabel 'wilayah' tidak terdefinisi saat update desa.");
        return;
    }

    if (kabupaten && kecamatan &&
        wilayah.hasOwnProperty(kabupaten) &&
        typeof wilayah[kabupaten] === 'object' && wilayah[kabupaten] !== null &&
        wilayah[kabupaten].hasOwnProperty(kecamatan) &&
        Array.isArray(wilayah[kabupaten][kecamatan]) &&
        wilayah[kabupaten][kecamatan].length > 0)
    {
        const desaArray = wilayah[kabupaten][kecamatan];
        desaArray.forEach(desa => {
            const opt = document.createElement("option");
            opt.value = desa;
            opt.textContent = desa;
            desaSelect.appendChild(opt);
        });
        desaSelect.disabled = false;
    }
}

/**
 * Membuat elemen badge HTML untuk status atau prioritas.
 * @param {'status' | 'priority'} type Tipe badge ('status' atau 'priority').
 * @param {string} value Nilai status atau prioritas.
 * @returns {string} String HTML untuk badge.
 */
function createBadge(type, value) {
    let iconClass = '', badgeClass = '', text = value || 'N/A';
    const statusClasses = {
        'On Progress': 'badge-status-onprogress', 'Hold': 'badge-status-hold',
        'Done': 'badge-status-done', 'default': 'badge-status-default'
    };
    const priorityClasses = {
        'Low Risk': 'badge-priority-low', 'Medium Risk': 'badge-priority-medium',
        'High Risk': 'badge-priority-high', 'default': 'badge-priority-default'
    };
    const statusIcons = {
        'On Progress': 'fas fa-spinner fa-spin', 'Hold': 'fas fa-pause-circle',
        'Done': 'fas fa-check-circle', 'default': 'fas fa-question-circle'
    };
     const priorityIcons = {
        'Low Risk': 'fas fa-info-circle', 'Medium Risk': 'fas fa-exclamation-circle',
        'High Risk': 'fas fa-exclamation-triangle', 'default': 'fas fa-question-circle'
    };
    let baseClass = `badge`;

    if (type === 'status') {
        badgeClass = statusClasses[value] || statusClasses['default'];
        iconClass = statusIcons[value] || statusIcons['default'];
    } else if (type === 'priority') {
        badgeClass = priorityClasses[value] || priorityClasses['default'];
        iconClass = priorityIcons[value] || priorityIcons['default'];
    }
     return `<span class="${baseClass} ${badgeClass} rounded-pill"><i class="${iconClass} me-1"></i>${text}</span>`;
}

/**
 * Menampilkan detail pengaduan dalam modal.
 * @param {number} originalIndex Index asli data di localStorage.
 */
function showDetailModal(originalIndex) {
     if (typeof getDataFromStorage !== 'function' || typeof STORAGE_KEYS === 'undefined') {
        console.error("[UI] Fungsi getDataFromStorage atau STORAGE_KEYS tidak tersedia untuk modal detail.");
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Gagal memuat data detail (fungsi storage hilang).', 'danger');
        return;
    }
    const dataPengaduan = getDataFromStorage(STORAGE_KEYS.grievances);
     if (originalIndex < 0 || originalIndex >= dataPengaduan.length) {
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Data detail tidak ditemukan (index salah).', 'danger');
        return;
    }
    const item = dataPengaduan[originalIndex];
    const detailModalElement = document.getElementById('detailModal');
    if (!detailModalElement) {
        console.error("[UI] Elemen modal #detailModal tidak ditemukan.");
        return;
    }
    if (typeof bootstrap === 'undefined' || typeof bootstrap.Modal === 'undefined') {
        console.error("[UI] Bootstrap Modal tidak tersedia.");
        if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Komponen modal tidak dapat ditampilkan.', 'danger');
        return;
    }
    const detailModal = bootstrap.Modal.getOrCreateInstance(detailModalElement);

    const formatTanggalModal = (tgl) => {
        if (!tgl) return "-";
        try {
            return new Date(tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {
             console.warn("[UI] Error format tanggal modal:", e);
             return tgl;
        }
    };
     const createModalBadge = (type, value) => {
        let iconClass = '', badgeBgClass = '', badgeTextClass = 'text-white', text = value || 'N/A';
        const baseClass = `badge p-2`;
        const statusStyles = {
            'On Progress': { icon: 'fas fa-spinner fa-spin', bg: 'bg-primary', text: 'text-white' },
            'Hold': { icon: 'fas fa-pause-circle', bg: 'bg-warning', text: 'text-dark' },
            'Done': { icon: 'fas fa-check-circle', bg: 'bg-success', text: 'text-white' },
            'default': { icon: 'fas fa-question-circle', bg: 'bg-secondary', text: 'text-white' }
        };
        const priorityStyles = {
            'Low Risk': { icon: 'fas fa-info-circle', bg: 'bg-success', text: 'text-white' },
            'Medium Risk': { icon: 'fas fa-exclamation-circle', bg: 'bg-warning', text: 'text-dark' },
            'High Risk': { icon: 'fas fa-exclamation-triangle', bg: 'bg-danger', text: 'text-white' },
            'default': { icon: 'fas fa-question-circle', bg: 'bg-secondary', text: 'text-white' }
        };
        let styles;
        if (type === 'status') styles = statusStyles[value] || statusStyles['default'];
        else if (type === 'priority') styles = priorityStyles[value] || priorityStyles['default'];
        else return text;
        iconClass = styles.icon; badgeBgClass = styles.bg; badgeTextClass = styles.text;
        return `<span class="${baseClass} ${badgeBgClass} ${badgeTextClass} rounded-pill" style="font-size: 0.9rem;"><i class="${iconClass} me-1"></i>${text}</span>`;
    };
    const setContent = (id, content) => {
        const el = document.getElementById(id);
        if(el) {
             if (typeof content === 'string' && content.startsWith('<span')) el.innerHTML = content;
             else el.textContent = content || '-';
        } else console.warn(`[UI] Elemen modal dengan ID "${id}" tidak ditemukan.`);
    };

    setContent('detailNoRef', item.noReferensi);
    setContent('modalNoRef', item.noReferensi);
    setContent('modalTanggal', formatTanggalModal(item.tanggal));
    setContent('modalKategori', item.kategori);
    setContent('modalPelapor', item.pelapor);
    setContent('modalKontak', item.kontak);
    setContent('modalKabupaten', item.kabupaten);
    setContent('modalKecamatan', item.kecamatan);
    setContent('modalDesa', item.desa);
    setContent('modalAksi', item.aksi);
    setContent('modalTenggat', formatTanggalModal(item.tenggat));
    setContent('modalDeskripsi', item.deskripsi || '(Tidak ada deskripsi)');
    setContent('modalStatus', createModalBadge('status', item.status));
    setContent('modalPic', item.pic);
    setContent('modalPrioritas', createModalBadge('priority', item.prioritas));

    const modalEditBtn = document.getElementById('modalEditBtn');
    if(modalEditBtn) {
        const newEditBtn = modalEditBtn.cloneNode(true); 
        modalEditBtn.parentNode.replaceChild(newEditBtn, modalEditBtn);
        newEditBtn.addEventListener('click', () => {
            detailModal.hide();
            if (typeof editGrievance === 'function') editGrievance(originalIndex);
            else {
                 console.error("[UI] Fungsi editGrievance tidak ditemukan.");
                 if(typeof tampilkanNotifikasi === 'function') tampilkanNotifikasi('Error', 'Fungsi untuk edit tidak tersedia.', 'danger');
            }
        });
    } else console.warn("[UI] Tombol edit modal #modalEditBtn tidak ditemukan.");
    detailModal.show();
}

/**
 * Menampilkan notifikasi toast Bootstrap.
 */
function tampilkanNotifikasi(title, message, type = 'info', delay = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error("[UI] Toast container #toastContainer tidak ditemukan!");
        alert(`${title}: ${message}`); 
        return;
    }
    if (typeof bootstrap === 'undefined' || typeof bootstrap.Toast === 'undefined') {
        console.error("[UI] Bootstrap Toast is not available.");
        alert(`${title}: ${message}`); 
        return;
    }
    const icons = { success: 'check-circle', info: 'info-circle', warning: 'exclamation-triangle', danger: 'times-circle' };
    const bgClass = `bg-${type}`; 
    const iconClass = `fas fa-${icons[type] || 'info-circle'}`; 
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="${iconClass} me-2"></i>
                    <strong>${title}:</strong> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    if (!toastElement) {
         console.error(`[UI] Gagal membuat elemen toast dengan ID: ${toastId}`);
         return;
    }
    const toast = new bootstrap.Toast(toastElement, { delay: delay });
    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove(); 
    });
    toast.show();
}

/**
 * Mengubah tampilan form dan tombol saat masuk/keluar mode edit.
 */
function setEditMode(isEditing, index = null) {
    const form = document.getElementById("formPengaduan");
    const cardHeader = document.querySelector("#inputContent .card-header");
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const kategoriSelect = document.getElementById("kategori"); 

    if (!form || !cardHeader || !submitBtn || !resetBtn || !kategoriSelect) { 
        console.error("[UI] Elemen form, header, tombol, atau select kategori untuk setEditMode tidak ditemukan.");
        return;
    }

    if (isEditing && index !== null) {
        form.dataset.editIndex = index; 
        cardHeader.innerHTML = '<i class="fas fa-edit me-2"></i> Edit Data Pengaduan';
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Data';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning', 'text-white'); 
        resetBtn.innerHTML = '<i class="fas fa-times me-2"></i>Batal Edit';
        resetBtn.classList.remove('btn-outline-secondary');
        resetBtn.classList.add('btn-secondary');
        tampilkanDeskripsiKategori(); 
    } else {
        form.reset(); 
        delete form.dataset.editIndex; 
        form.classList.remove('was-validated'); 

        const tanggalInput = document.getElementById('tanggal');
        if(tanggalInput) {
            try { tanggalInput.value = new Date().toISOString().split('T')[0]; }
            catch(e) { console.error("[UI] Gagal set tanggal default:", e); }
        }
        if (typeof generateNoRef === 'function') generateNoRef();
        else console.warn("[UI] Fungsi generateNoRef tidak ditemukan saat reset.");

        if (typeof populateKabupatenDropdown === 'function' && typeof updateKecamatanDropdown === 'function') {
            document.getElementById('kabupaten').value = ""; 
            updateKecamatanDropdown(); 
        } else {
             console.warn("[UI] Fungsi populateKabupatenDropdown atau updateKecamatanDropdown tidak ditemukan saat reset.");
        }

        const fileSpans = document.querySelectorAll('.file-name-display');
        fileSpans.forEach(span => span.textContent = '');

        cardHeader.innerHTML = '<i class="fas fa-file-alt me-2"></i> Form Pengaduan Baru';
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan';
        submitBtn.classList.remove('btn-warning', 'text-white');
        submitBtn.classList.add('btn-primary');
        resetBtn.innerHTML = '<i class="fas fa-undo me-2"></i>Reset';
        resetBtn.classList.remove('btn-secondary');
        resetBtn.classList.add('btn-outline-secondary');
        tampilkanDeskripsiKategori(); 
    }
}

/**
 * Menambahkan tombol logout ke header di index.html.
 */
function addLogoutButton() {
    const logoutButtonContainer = document.getElementById('logoutButtonContainer');
    if (logoutButtonContainer) {
        logoutButtonContainer.innerHTML = `
            <button class="btn btn-outline-danger btn-sm" id="logoutButton">
                <i class="fas fa-sign-out-alt me-1"></i>Logout
            </button>
        `;
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            if (typeof handleLogout === 'function') { 
                logoutButton.removeEventListener('click', handleLogout); 
                logoutButton.addEventListener('click', handleLogout);
            } else {
                console.error("[UI] Fungsi handleLogout (dari auth.js) tidak ditemukan. Tombol logout tidak akan berfungsi.");
                logoutButton.disabled = true;
                logoutButton.title = "Fungsi logout tidak tersedia";
            }
        }
    } else console.warn("[UI] Container tombol logout #logoutButtonContainer tidak ditemukan.");
}

/**
 * Membuat badge peran pengguna.
 */
function createRoleBadge(role) {
    const safeRole = role || 'Tidak Diketahui';
    const roleClass = safeRole.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default';
    return `<span class="badge bg-${roleClass} role-${roleClass} rounded-pill">${safeRole}</span>`;
}

/**
 * Menampilkan informasi pengguna di header.
 */
function displayUserInfo() {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv) {
        const loggedInUsername = sessionStorage.getItem('loggedInUsername');
        const userRole = sessionStorage.getItem('userRole');
        userInfoDiv.innerHTML = ''; 
        userInfoDiv.style.display = 'flex';
        userInfoDiv.style.alignItems = 'flex-start'; 

        if (loggedInUsername && userRole) {
            const userIcon = document.createElement('i');
            userIcon.className = 'fas fa-user-circle me-2';
            userIcon.style.fontSize = '2.0em'; 
            userIcon.style.color = 'var(--primary-color, #1e8449)';
            userIcon.style.flexShrink = '0'; 
            userIcon.style.marginTop = '0.15rem'; 

            const nameRoleContainer = document.createElement('div');
            nameRoleContainer.style.display = 'flex';
            nameRoleContainer.style.flexDirection = 'column';
            nameRoleContainer.style.lineHeight = '1.5'; 
            nameRoleContainer.style.textAlign = 'right';


            const userNameSpan = document.createElement('span');
            userNameSpan.className = 'user-name fw-bold';
            userNameSpan.textContent = loggedInUsername;
            userNameSpan.style.fontSize = '1.0em'; 

            const userRoleSpan = document.createElement('span');
            userRoleSpan.innerHTML = createRoleBadge(userRole); 
            const badgeElement = userRoleSpan.querySelector('.badge');
            if (badgeElement) { 
                 badgeElement.style.fontSize = '0.75em';
                 badgeElement.style.padding = '0.25em 0.6em';
                 badgeElement.style.marginTop = '0.2rem';
                 badgeElement.style.display = 'inline-block';
                 badgeElement.style.fontWeight = '500';
            }

            nameRoleContainer.appendChild(userNameSpan);
            nameRoleContainer.appendChild(userRoleSpan);
            userInfoDiv.appendChild(userIcon);
            userInfoDiv.appendChild(nameRoleContainer);
        } else console.warn("[UI] Info user (username/role) tidak ditemukan di sessionStorage.");
    } else console.warn("[UI] Container info user #userInfo tidak ditemukan.");
}

/**
 * Menampilkan nama file yang dipilih.
 */
function displayFileName(inputId, spanId) {
    const input = document.getElementById(inputId);
    const span = document.getElementById(spanId);
    if (!input || !span) {
        console.warn(`[UI:displayFileName] Input #${inputId} atau Span #${spanId} tidak ditemukan.`);
        return;
    }
    if (input.files && input.files.length > 0) {
        span.textContent = `File: ${input.files[0].name}`;
    } else {
        span.textContent = ''; 
    }
}

/**
 * Menampilkan sub-pane di #prosesContent (misalnya, Data Tabel, Form Evaluasi).
 * @param {string} targetSubPaneSelector Selector untuk sub-pane yang akan ditampilkan (e.g., "#data-table").
 */
function showProsesSubPane(targetSubPaneSelector) {
    const subContentContainer = document.getElementById('prosesSubContentContainer');
    if (!subContentContainer) {
        console.error("[UI] Container #prosesSubContentContainer tidak ditemukan untuk showProsesSubPane.");
        return;
    }
    const subContents = subContentContainer.querySelectorAll('.proses-sub-content');
    if (!subContents.length) {
        console.warn("[UI] Tidak ada sub-konten .proses-sub-content yang ditemukan di #prosesSubContentContainer.");
        return;
    }

    console.log(`[UI] Memproses showProsesSubPane untuk target: ${targetSubPaneSelector}`);
    let subPaneToShow = null;
    subContents.forEach(pane => {
        if (`#${pane.id}` === targetSubPaneSelector) {
            pane.classList.add('active');
            subPaneToShow = pane;
            console.log(`[UI] Sub-pane '${pane.id}' diaktifkan.`);
        } else {
            pane.classList.remove('active');
        }
    });

    if (subPaneToShow) {
        const paneId = subPaneToShow.id;
        console.log(`[UI] Sub-pane '${paneId}' aktif. Memanggil fungsi terkait...`);
        if (paneId === 'data-table' && typeof displayGrievanceData === 'function') {
            console.log("[UI] Memuat data tabel pengaduan...");
            displayGrievanceData();
        } else if (paneId === 'riwayat-proses' && typeof displayProcessHistory === 'function') {
            console.log("[UI] Memuat riwayat proses...");
            displayProcessHistory();
        } else if (['form-evaluasi', 'surat-tanggapan', 'form-banding'].includes(paneId)) {
            console.log(`[UI] Menginisialisasi form proses: ${paneId}`);
            if (typeof populateProcessDropdowns === 'function') {
                populateProcessDropdowns();
            }
        }
    } else {
        console.warn(`[UI] Sub-pane dengan selector '${targetSubPaneSelector}' tidak ditemukan di showProsesSubPane.`);
        subContents.forEach(pane => pane.classList.remove('active'));
    }
}


/**
 * Mengatur navigasi utama aplikasi (Form Input, Proses Pengaduan, Dashboard, User Management).
 */
function setupMainNavigation() {
    const mainNavLinks = document.querySelectorAll('.main-dropdown-nav .nav-link[data-target-section], .main-dropdown-nav .dropdown-item[data-target-section]');
    const sections = document.querySelectorAll('.section-content');
    const mainNavItemsAndToggles = document.querySelectorAll('.main-dropdown-nav .nav-item > .nav-link, .main-dropdown-nav .nav-item > .dropdown-toggle');
    const kategoriSelect = document.getElementById("kategori"); 

    if (!mainNavLinks.length || !sections.length) {
        console.warn("[UI] Link navigasi utama atau section konten tidak ditemukan untuk setupMainNavigation.");
        return;
    }

    if (kategoriSelect) {
        kategoriSelect.addEventListener('change', tampilkanDeskripsiKategori);
    }


    mainNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetSectionId = this.dataset.targetSection; 
            const subTargetId = this.dataset.subTarget;       

            console.log(`[UI] Link navigasi diklik. Target Section: ${targetSectionId}, Sub-Target: ${subTargetId || 'N/A'}`);

            mainNavItemsAndToggles.forEach(item => item.classList.remove('active-section'));
            if (this.classList.contains('dropdown-item')) { 
                const parentToggle = this.closest('.nav-item.dropdown')?.querySelector('.dropdown-toggle');
                if (parentToggle) parentToggle.classList.add('active-section');
            } else { 
                this.classList.add('active-section');
            }

            sections.forEach(section => {
                if (`#${section.id}` === targetSectionId) {
                    section.classList.add('active');
                    console.log(`[UI] Section '${section.id}' diaktifkan.`);

                    if (section.id === 'prosesContent') {
                        const defaultProsesSubTarget = '#data-table'; 
                        const targetSubPaneToShow = subTargetId || defaultProsesSubTarget;
                        console.log(`[UI] Mengaktifkan sub-pane untuk 'prosesContent': ${targetSubPaneToShow}`);
                        if (typeof showProsesSubPane === 'function') {
                            showProsesSubPane(targetSubPaneToShow);
                        } else {
                            console.error("[UI] Fungsi showProsesSubPane tidak ditemukan.");
                        }
                    } else if (section.id === 'dashboardContent' && typeof updateDashboard === 'function') {
                        updateDashboard();
                    } else if (section.id === 'userManagementContent' && typeof loadUserManagementTable === 'function') {
                        loadUserManagementTable();
                    } else if (section.id === 'inputContent') {
                        if (typeof generateNoRef === 'function' && !document.getElementById('noReferensi').value) {
                            generateNoRef();
                        }
                         if (typeof populateKabupatenDropdown === 'function') {
                            populateKabupatenDropdown();
                            const kabSelect = document.getElementById('kabupaten');
                            if(kabSelect && !kabSelect.value) {
                                if(typeof updateKecamatanDropdown === 'function') updateKecamatanDropdown();
                            }
                        }
                        tampilkanDeskripsiKategori(); 
                    }
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });

    const userPermissions = JSON.parse(sessionStorage.getItem('userPermissions') || '[]');
    let firstPermittedLink = null;

    const permissionMap = {
        'inputContent': 'inputContent',
        'prosesContent': 'prosesContent',
        'dashboardContent': 'dashboardContent',
        'userManagementContent': 'userManagementContent'
    };

    const inputContentLink = Array.from(mainNavLinks).find(link => {
        const targetSectionId = link.dataset.targetSection.substring(1); 
        return targetSectionId === 'inputContent' && userPermissions.includes(permissionMap['inputContent']);
    });

    if (inputContentLink) {
        firstPermittedLink = inputContentLink;
    } else { 
        for (const link of mainNavLinks) {
            const sectionId = link.dataset.targetSection.substring(1);
            if (userPermissions.includes(permissionMap[sectionId])) {
                firstPermittedLink = link;
                break;
            }
        }
    }

    if (firstPermittedLink) {
        console.log(`[UI] Mengaktifkan link navigasi utama awal: ${firstPermittedLink.textContent.trim()}, Target: ${firstPermittedLink.dataset.targetSection}, SubTarget: ${firstPermittedLink.dataset.subTarget || 'N/A'}`);
        firstPermittedLink.click(); 
    } else {
        console.warn("[UI] Tidak ada link navigasi utama yang diizinkan untuk aktivasi awal.");
        const mainContentArea = document.querySelector('.main-content-area');
        if(mainContentArea) mainContentArea.innerHTML = '<div class="alert alert-warning text-center p-4">Anda tidak memiliki izin untuk mengakses modul manapun. Silakan hubungi administrator.</div>';
    }
     console.log("[UI] setupMainNavigation selesai.");
}


console.log("ui.js loaded (enhanced category description)");
