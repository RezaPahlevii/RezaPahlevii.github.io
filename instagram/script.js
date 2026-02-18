document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. DATA PANDUAN & SLIDER
       ========================================= */
    const steps = [
        { title: "Buka Pengaturan Instagram", desc: "Buka profil IG > Menu > Pengaturan dan Privasi > Pusat Akun.", image: "assets/step1.png" },
        { title: "Informasi dan Izin Anda", desc: "Pilih 'Informasi dan Izin Anda'.", image: "assets/step2.png" },
        { title: "Ekspor Informasi Anda", desc: "Pilih opsi 'Ekspor informasi Anda'.", image: "assets/step3.png" },
        { title: "Buat Ekspor", desc: "Klik 'Buat ekspor'.", image: "assets/step4.png" },
        { title: "Pilih Profil", desc: "Pilih akun Instagram yang ingin dianalisis.", image: "assets/step5.png" },
        { title: "Ekspor ke Perangkat", desc: "Pilih 'Ekspor ke perangkat'.", image: "assets/step6.png" },
        { title: "Konfirmasi Ekspor", desc: "PENTING: Pilih 'Sesuaikan informasi'. Format pilih JSON.", image: "assets/step7.png" },
        { title: "Pilih Pengikut & Mengikuti", desc: "Cari 'Koneksi' lalu centang HANYA 'Pengikut dan mengikuti'.", image: "assets/step8.png" },
        { title: "Mulai Ekspor", desc: "Atur rentang waktu 'Semua waktu' (disarankan) lalu mulai ekspor.", image: "assets/step9.png" },
        { title: "Unduh File", desc: "Tunggu notifikasi, unduh dan ekstrak file ZIP-nya.", image: "assets/step10.png" }
    ];

    let currentStep = 0;
    const listContainer = document.getElementById('step-list-container');
    const displayTitle = document.getElementById('guide-step-title');
    const displayDesc = document.getElementById('guide-step-desc');
    const guideNum = document.getElementById('guide-step-number');
    const guideCount = document.getElementById('guide-count');
    const guideImage = document.getElementById('guide-current-image');
    const btnNext = document.getElementById('guide-next');
    const btnPrev = document.getElementById('guide-prev');

    if (listContainer) {
        steps.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = `step-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `<div class="step-num">${index + 1}</div><div class="step-info"><h4>Langkah ${index + 1}</h4><p>${step.title}</p></div>`;
            item.addEventListener('click', () => updateGuide(index));
            listContainer.appendChild(item);
        });
    }

    function updateGuide(index) {
        currentStep = index;
        if (displayTitle) displayTitle.innerText = steps[index].title;
        if (displayDesc) displayDesc.innerText = steps[index].desc;
        if (guideNum) guideNum.innerText = index + 1;
        if (guideCount) guideCount.innerText = `Langkah ${index + 1} dari ${steps.length}`;
        
        if (guideImage) {
            guideImage.style.opacity = 0;
            setTimeout(() => {
                guideImage.src = steps[index].image;
                guideImage.style.opacity = 1;
            }, 200);
        }

        const items = document.querySelectorAll('.step-item');
        if (items.length > 0) {
            items.forEach(i => i.classList.remove('active'));
            if (items[index]) {
                items[index].classList.add('active');
                items[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        if (btnPrev) {
            btnPrev.classList.toggle('disabled', index === 0);
            btnPrev.style.opacity = index === 0 ? "0.5" : "1";
        }
        if (btnNext) {
            const isLast = index === steps.length - 1;
            btnNext.innerHTML = isLast ? 'Selesai' : 'Selanjutnya <i class="ti ti-chevron-right"></i>';
            btnNext.classList.toggle('disabled', isLast);
        }
    }

    if (btnNext) btnNext.addEventListener('click', () => { if (currentStep < steps.length - 1) updateGuide(currentStep + 1); });
    if (btnPrev) btnPrev.addEventListener('click', () => { if (currentStep > 0) updateGuide(currentStep - 1); });
    if (guideImage && steps.length > 0) guideImage.src = steps[0].image;


    /* =========================================
       2. LOGIKA UPLOAD & ANALISIS
       ========================================= */
    const btnAnalyze = document.getElementById('btn-analyze');
    const inputFollowers = document.getElementById('file-followers');
    let inputFollowing = document.getElementById('file-following') || document.querySelectorAll('input[type="file"]')[1];

    function setupDropzone(dropzoneId, inputElement) {
        const dropzone = document.getElementById(dropzoneId);
        if (!dropzone || !inputElement) return;

        dropzone.addEventListener('click', () => inputElement.click());

        inputElement.addEventListener('change', () => {
            if (inputElement.files.length > 0) {
                const name = inputElement.files[0].name;
                const label = dropzone.querySelector('h4');
                const icon = dropzone.querySelector('.icon-circle');
                
                if (label) label.innerText = name;
                dropzone.style.borderColor = '#10b981';
                dropzone.style.background = '#f0fdf4';
                if (icon) {
                    icon.innerHTML = '<i class="ti ti-check"></i>';
                    icon.style.background = '#bbf7d0';
                    icon.style.color = '#15803d';
                }
                checkReady();
            }
        });
    }

    function checkReady() {
        if (inputFollowers && inputFollowers.files.length > 0 && inputFollowing && inputFollowing.files.length > 0) {
            if (btnAnalyze) {
                btnAnalyze.classList.remove('disabled');
                btnAnalyze.classList.add('active');
            }
        }
    }

    setupDropzone('dropzone-followers', inputFollowers);
    setupDropzone('dropzone-following', inputFollowing);

    if (btnAnalyze) {
        btnAnalyze.addEventListener('click', async () => {
            if (!btnAnalyze.classList.contains('active')) return;

            const oldText = btnAnalyze.innerHTML;
            btnAnalyze.innerHTML = '<i class="ti ti-loader-2 ti-spin"></i> Sedang Menganalisis...';

            try {
                const resFollowers = await readFileAndParse(inputFollowers.files[0]);
                const resFollowing = await readFileAndParse(inputFollowing.files[0]);

                if (resFollowers.users.length === 0 || resFollowing.users.length === 0) {
                    throw new Error("Data tidak ditemukan. Pastikan Anda mengunggah file JSON yang benar dari Instagram.");
                }

                // Logika Perbandingan
                const notFollowingBack = resFollowing.users.filter(u => !resFollowers.users.includes(u));

                // Hitung Rentang Waktu
                const allTimestamps = [...resFollowers.times, ...resFollowing.times].filter(t => t > 0);
                const dateRange = {
                    start: allTimestamps.length ? new Date(Math.min(...allTimestamps) * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Tidak diketahui",
                    end: allTimestamps.length ? new Date(Math.max(...allTimestamps) * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Sekarang"
                };

                renderDashboard(resFollowing.users, resFollowers.users, notFollowingBack, dateRange);

            } catch (err) {
                alert("Gagal: " + err.message);
            } finally {
                btnAnalyze.innerHTML = oldText;
            }
        });
    }

    async function readFileAndParse(file) {
        const text = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsText(file);
        });

        let users = [];
        let times = [];

        try {
            const json = JSON.parse(text);
            let list = Array.isArray(json) ? json : (json.relationships_following || []);
            
            list.forEach(item => {
                let u = null;
                let t = 0;

                if (item.string_list_data && item.string_list_data[0]) {
                    u = item.string_list_data[0].value || item.title;
                    t = item.string_list_data[0].timestamp || 0;
                } else if (item.title) {
                    u = item.title;
                }

                if (u) {
                    users.push(u);
                    if (t) times.push(t);
                }
            });
        } catch (e) {
            console.error("Parse Error", e);
        }
        return { users, times };
    }


    /* =========================================
       3. RENDER DASHBOARD (BAHASA INDONESIA)
       ========================================= */
    
    let activeData = [];
    let currentPage = 1;
    let itemsPerPage = 10;

    function renderDashboard(following, followers, dontFollowBack, dateRange) {
        let resultContainer = document.getElementById('results-view') || document.getElementById('result-section');
        
        if (!resultContainer) {
            resultContainer = document.createElement('section');
            resultContainer.id = 'results-view';
            resultContainer.className = 'container';
            const uploadSection = document.querySelector('.upload-section');
            if(uploadSection) uploadSection.after(resultContainer);
        }

        resultContainer.style.display = 'block';
        resultContainer.classList.remove('hidden');

        window.dashboardData = { following, followers, dontFollow: dontFollowBack };

        const ratio = following.length > 0 ? ((followers.length / following.length) * 100).toFixed(1) : 0;

        resultContainer.innerHTML = `
            <div style="background: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 30px;">
                
                <h2 style="margin-top: 0; margin-bottom: 10px; text-align: center; color: #1e293b;">Hasil Analisis Akun</h2>
                <p style="text-align: center; color: #64748b; margin-bottom: 30px; font-size: 0.9rem;">
                    Berdasarkan data yang Anda unggah (Periode: <strong>${dateRange.start}</strong> s/d <strong>${dateRange.end}</strong>)
                </p>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; border: 1px solid #a7f3d0;">
                        <div style="color: #047857; font-weight: 600; font-size: 0.85rem;"><i class="ti ti-users"></i> Pengikut</div>
                        <h2 style="font-size: 1.8rem; margin: 5px 0 0 0; color: #064e3b;">${followers.length}</h2>
                    </div>
                    <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #bfdbfe;">
                        <div style="color: #1d4ed8; font-weight: 600; font-size: 0.85rem;"><i class="ti ti-user-plus"></i> Mengikuti</div>
                        <h2 style="font-size: 1.8rem; margin: 5px 0 0 0; color: #1e3a8a;">${following.length}</h2>
                    </div>
                    <div style="background: #fff1f2; padding: 20px; border-radius: 12px; border: 1px solid #fecdd3;">
                        <div style="color: #be123c; font-weight: 600; font-size: 0.85rem;"><i class="ti ti-user-x"></i> Tidak Mengikuti Balik</div>
                        <h2 style="font-size: 1.8rem; margin: 5px 0 0 0; color: #881337;">${dontFollowBack.length}</h2>
                    </div>
                    <div style="background: #faf5ff; padding: 20px; border-radius: 12px; border: 1px solid #e9d5ff;">
                        <div style="color: #7e22ce; font-weight: 600; font-size: 0.85rem;"><i class="ti ti-chart-pie"></i> Rasio Akun</div>
                        <h2 style="font-size: 1.8rem; margin: 5px 0 0 0; color: #7e22ce;">${ratio}%</h2>
                    </div>
                </div>

                <div style="margin-bottom: 20px; display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;">
                    <button onclick="window.switchTab('dontFollow')" id="tab-dont" style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap;">
                        Tidak Follow Balik
                    </button>
                    <button onclick="window.switchTab('followers')" id="tab-followers" style="background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap;">
                        Daftar Pengikut
                    </button>
                    <button onclick="window.switchTab('following')" id="tab-following" style="background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap;">
                        Daftar Mengikuti
                    </button>
                </div>

                <div id="alert-header" style="background: #fff1f2; border: 1px solid #fecdd3; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h4 id="list-title" style="margin: 0; color: #be123c; font-size: 1.1rem;">Akun Yang Tidak Mengikuti Balik</h4>
                        <p id="list-desc" style="margin: 5px 0 0 0; font-size: 0.85rem; color: #881337;">Daftar akun yang Anda ikuti namun mereka tidak mengikuti Anda kembali.</p>
                    </div>
                    <span id="list-badge" style="background: white; padding: 5px 12px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; color: #be123c; border: 1px solid #fecdd3;">${dontFollowBack.length} akun</span>
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; gap: 10px;">
                    <input type="text" id="dashboard-search" placeholder="Cari nama akun..." style="padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; width: 100%; max-width: 300px; outline: none;">
                    <select id="dashboard-rows" style="padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; cursor: pointer; background: white;">
                        <option value="10">10 Baris</option>
                        <option value="20">20 Baris</option>
                        <option value="50">50 Baris</option>
                    </select>
                </div>

                <div id="card-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
                <div id="card-pagination" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px;"></div>
                
                <div style="text-align:center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                    <button onclick="location.reload()" style="background: white; border: 1px solid #cbd5e1; padding: 12px 24px; border-radius: 8px; cursor: pointer; color: #64748b; font-weight: 600;">
                        Mulai Analisis Baru
                    </button>
                </div>
            </div>
        `;

        document.getElementById('dashboard-search').addEventListener('input', (e) => {
            currentPage = 1;
            renderListUI(e.target.value);
        });

        document.getElementById('dashboard-rows').addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1;
            renderListUI();
        });

        window.switchTab = function(type) {
            currentPage = 1;
            const tabDont = document.getElementById('tab-dont');
            const tabFollowers = document.getElementById('tab-followers');
            const tabFollowing = document.getElementById('tab-following');
            const alertHeader = document.getElementById('alert-header');
            const title = document.getElementById('list-title');
            const desc = document.getElementById('list-desc');
            const badge = document.getElementById('list-badge');

            [tabDont, tabFollowers, tabFollowing].forEach(t => {
                t.style.background = '#f1f5f9'; t.style.color = '#64748b'; t.style.border = '1px solid #e2e8f0';
            });

            if (type === 'dontFollow') {
                activeData = window.dashboardData.dontFollow;
                tabDont.style.background = '#ef4444'; tabDont.style.color = 'white'; tabDont.style.border = 'none';
                alertHeader.style.background = '#fff1f2'; alertHeader.style.borderColor = '#fecdd3';
                title.innerText = "Akun Yang Tidak Mengikuti Balik"; title.style.color = '#be123c';
                desc.innerText = "Daftar akun yang Anda ikuti namun mereka tidak mengikuti Anda kembali."; desc.style.color = '#881337';
            } 
            else if (type === 'followers') {
                activeData = window.dashboardData.followers;
                tabFollowers.style.background = '#10b981'; tabFollowers.style.color = 'white'; tabFollowers.style.border = 'none';
                alertHeader.style.background = '#ecfdf5'; alertHeader.style.borderColor = '#a7f3d0';
                title.innerText = "Daftar Pengikut"; title.style.color = '#047857';
                desc.innerText = "Daftar semua akun yang mengikuti profil Instagram Anda."; desc.style.color = '#064e3b';
            } 
            else if (type === 'following') {
                activeData = window.dashboardData.following;
                tabFollowing.style.background = '#3b82f6'; tabFollowing.style.color = 'white'; tabFollowing.style.border = 'none';
                alertHeader.style.background = '#eff6ff'; alertHeader.style.borderColor = '#bfdbfe';
                title.innerText = "Daftar Mengikuti"; title.style.color = '#1d4ed8';
                desc.innerText = "Daftar semua akun yang sedang Anda ikuti saat ini."; desc.style.color = '#1e3a8a';
            }

            badge.innerText = `${activeData.length} akun`;
            renderListUI();
        };

        window.switchTab('dontFollow');
    }

    function renderListUI(searchTerm = "") {
        const container = document.getElementById('card-container');
        const pagination = document.getElementById('card-pagination');
        if (!container) return;

        container.innerHTML = "";
        pagination.innerHTML = "";

        let filtered = activeData.filter(u => u && u.toLowerCase().includes(searchTerm.toLowerCase()));

        if (filtered.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b;">Akun tidak ditemukan.</div>`;
            return;
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const items = filtered.slice(start, end);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);

        items.forEach(user => {
            const initial = user.charAt(0).toUpperCase();
            const colors = [ {bg:'#dbeafe', tx:'#1e40af'}, {bg:'#dcfce7', tx:'#166534'}, {bg:'#fae8ff', tx:'#86198f'}, {bg:'#ffedd5', tx:'#9a3412'} ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const card = document.createElement('div');
            card.style.cssText = `display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:white; padding:15px 20px; border-radius:12px; border:1px solid #e2e8f0; transition:0.2s;`;
            card.onmouseover = () => { card.style.borderColor = '#3b82f6'; card.style.transform = 'translateY(-2px)'; };
            card.onmouseout = () => { card.style.borderColor = '#e2e8f0'; card.style.transform = 'translateY(0)'; };

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:45px; height:45px; border-radius:50%; background:${color.bg}; color:${color.tx}; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.1rem;">${initial}</div>
                    <div>
                        <h5 style="margin:0; font-size:1rem; color:#0f172a;">${user}</h5>
                        <span style="font-size:0.85rem; color:#64748b;">Profil Instagram</span>
                    </div>
                </div>
                <a href="https://instagram.com/${user}" target="_blank" style="text-decoration:none; border:1px solid #cbd5e1; padding:8px 16px; border-radius:8px; color:#475569; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:5px; background:white; white-space:nowrap;">
                    Lihat Profil ↗
                </a>
            `;
            container.appendChild(card);
        });

        if (totalPages > 1) {
            const createBtn = (text, page, disabled = false, active = false) => {
                const btn = document.createElement('button');
                btn.innerHTML = text;
                btn.style.cssText = `padding:8px 14px; border-radius:6px; border:1px solid ${active ? '#3b82f6' : '#cbd5e1'}; background:${active ? '#3b82f6' : 'white'}; color:${active ? 'white' : '#475569'}; cursor:${disabled ? 'not-allowed' : 'pointer'}; opacity:${disabled ? 0.5 : 1}; font-weight:600;`;
                if (!disabled) btn.onclick = () => { currentPage = page; renderListUI(searchTerm); };
                return btn;
            };
            pagination.appendChild(createBtn('Sebelumnya', currentPage - 1, currentPage === 1));
            let startP = Math.max(1, currentPage - 1);
            let endP = Math.min(totalPages, currentPage + 1);
            for(let i = startP; i <= endP; i++) pagination.appendChild(createBtn(i, i, false, i === currentPage));
            pagination.appendChild(createBtn('Selanjutnya', currentPage + 1, currentPage === totalPages));
        }
    }

    /* --- FAQ --- */
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        });
    }
});