// Tunggu DOM siap dan siapkan variabel global untuk chart
document.addEventListener('DOMContentLoaded', () => {
    let db; // Variabel untuk database IndexedDB
    let subjectProgressChart, tasksPerDayChart, tasksBySubjectChart; // Variabel untuk menyimpan instance diagram

    // === ELEMEN DOM ===
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-btn');
    const appTitle = document.getElementById('app-title');
    const fab = document.getElementById('fab-add-task');
    const modal = document.getElementById('modal-add-task');
    const closeModalBtn = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');
    const taskSubjectSelect = document.getElementById('task-subject');
    const attachmentInput = document.getElementById('task-attachments');
    const attachmentList = document.getElementById('attachment-list');
    
    // Halaman Home
    const dailyProgressRing = document.getElementById('daily-progress-ring');
    const dailyProgressText = document.getElementById('daily-progress-text');
    const taskListToday = document.getElementById('task-list-today');
    const taskListUpcoming = document.getElementById('task-list-upcoming');
    
    // Halaman Mapel
    const subjectGrid = document.getElementById('subject-grid');
    const showSubjectFormBtn = document.getElementById('show-subject-form');
    const subjectForm = document.getElementById('subject-form');
    const cancelSubjectFormBtn = document.getElementById('cancel-subject-form');
    
    // Halaman Detail Mapel
    const subjectDetailTitle = document.getElementById('subject-detail-title');
    const subjectDetailTeacher = document.getElementById('subject-detail-teacher');
    const subjectDetailNotes = document.getElementById('subject-detail-notes');
    const subjectDetailTasks = document.getElementById('subject-detail-tasks');
    const backToSubjectsBtn = document.getElementById('back-to-subjects');

    // === 1. INISIALISASI DATABASE (INDEXEDDB) ===
    const initDB = () => {
        const request = indexedDB.open('TaskNavyDB', 1);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('Database berhasil dibuka.');
            // Mulai aplikasi setelah DB siap
            initializeApp();
        };

        // Fungsi ini berjalan jika DB baru dibuat atau versi di-upgrade
        request.onupgradeneeded = (event) => {
            let db = event.target.result;
            
            // Buat "tabel" (objectStore) untuk mapel
            db.createObjectStore('subjects', { keyPath: 'id', autoIncrement: true });

            // Buat "tabel" untuk tugas
            const taskStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            // Buat index untuk mencari tugas berdasarkan mapel
            taskStore.createIndex('subjectId', 'subjectId', { unique: false });
        };
    };

    // === 2. FUNGSI DATABASE (CRUD - Async/Await) ===
    
    // Fungsi generik untuk mendapatkan semua data dari 'tabel'
    const getAllData = (storeName) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    };

    // Fungsi generik untuk menambah/mengedit data
    const addOrUpdateData = (storeName, data) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data); // .put() akan update jika key ada, atau tambah jika tidak
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    };
    
    // Fungsi untuk mendapatkan tugas berdasarkan ID Mapel
    const getTasksBySubject = (subjectId) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['tasks'], 'readonly');
            const store = transaction.objectStore('tasks');
            const index = store.index('subjectId'); // Gunakan index yang kita buat
            const request = index.getAll(IDBKeyRange.only(subjectId)); // Dapatkan semua yang cocok
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    };

    // === 3. FUNGSI NAVIGASI & TAMPILAN ===
    
    const showPage = (pageId) => {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');

        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
        
        // Ubah judul header
        if (pageId === 'page-home') appTitle.innerText = 'TaskNavy';
        if (pageId === 'page-subjects') appTitle.innerText = 'Mata Pelajaran';
        if (pageId === 'page-progress') appTitle.innerText = 'Statistik Progres';
        // Judul untuk detail mapel diatur terpisah
    };

    // === 4. FUNGSI RENDER (MENAMPILKAN DATA) ===

    // Menampilkan semua tugas di Halaman Home
    const renderHomeTasks = async () => {
        const tasks = await getAllData('tasks');
        const subjects = await getAllData('subjects');
        
        taskListToday.innerHTML = '';
        taskListUpcoming.innerHTML = '';
        
        const now = new Date();
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        let todayCount = 0;
        let todayCompleted = 0;

        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        tasks.forEach(task => {
            const taskDeadline = new Date(task.deadline);
            const subject = subjects.find(s => s.id === task.subjectId) || { name: 'Umum' };
            const isToday = taskDeadline <= todayEnd && taskDeadline >= now.setHours(0,0,0,0);
            
            if (isToday) {
                todayCount++;
                if (task.isComplete) todayCompleted++;
            }

            // Buat HTML untuk lampiran
            let attachmentsHTML = '';
            if (task.attachments && task.attachments.length > 0) {
                task.attachments.forEach(file => {
                    // Buat URL sementara untuk file blob
                    const fileUrl = URL.createObjectURL(file.blob);
                    let icon = 'description'; // Icon default
                    if (file.type.startsWith('image/')) icon = 'image';
                    if (file.type.startsWith('audio/')) icon = 'audiotrack';
                    
                    attachmentsHTML += `
                        <a href="${fileUrl}" class="attachment-link" target="_blank" download="${file.name}">
                            <i class="material-icons">${icon}</i>
                            ${file.name}
                        </a>`;
                });
            }

            const taskElementHTML = `
                <div class="task-item ${task.isComplete ? 'completed' : ''}" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-info">
                            <strong>${task.title}</strong>
                            <p><span class="subject-tag">${subject.name}</span></p>
                            <p>Deadline: ${taskDeadline.toLocaleString('id-ID')}</p>
                        </div>
                        <input type="checkbox" class="complete-check" ${task.isComplete ? 'checked' : ''}>
                    </div>
                    <div class="task-attachments">${attachmentsHTML}</div>
                    <button class="edit-btn"><i class="material-icons">edit</i></button>
                </div>
            `;
            
            if (isToday && !task.isComplete) {
                taskListToday.innerHTML += taskElementHTML;
            } else if (!task.isComplete && taskDeadline > todayEnd) {
                taskListUpcoming.innerHTML += taskElementHTML;
            }
        });

        // Update progress ring
        const percentage = (todayCount === 0) ? 0 : Math.round((todayCompleted / todayCount) * 100);
        dailyProgressRing.style.background = `
            radial-gradient(closest-side, var(--navy-light) 79%, transparent 80% 100%),
            conic-gradient(var(--accent-lime) ${percentage}%, var(--gray) 0%)
        `;
        dailyProgressText.innerText = `${todayCompleted}/${todayCount}`;
        
        // Pesan jika kosong
        if (taskListToday.innerHTML === '') taskListToday.innerHTML = '<p>Tidak ada tugas hari ini. Santai!</p>';
        if (taskListUpcoming.innerHTML === '') taskListUpcoming.innerHTML = '<p>Tidak ada tugas mendatang.</p>';
    };

    // Menampilkan mapel di Halaman Mapel
    const renderSubjects = async () => {
        const subjects = await getAllData('subjects');
        
        subjectGrid.innerHTML = '';
        subjects.forEach(subject => {
            subjectGrid.innerHTML += `
                <div class="subject-card" data-subject-id="${subject.id}">
                    <i class="material-icons">class</i>
                    <h4>${subject.name}</h4>
                </div>
            `;
        });
        
        // Update pilihan <select> di form tugas
        taskSubjectSelect.innerHTML = '<option value="">Pilih Mapel...</option>';
        subjects.forEach(subject => {
            taskSubjectSelect.innerHTML += `<option value="${subject.id}">${subject.name}</option>`;
        });
    };
    
    // Menampilkan Halaman Detail Mapel (BARU)
    const showSubjectDetail = async (subjectId) => {
        const subjects = await getAllData('subjects');
        const subject = subjects.find(s => s.id === subjectId);
        
        if (!subject) return;

        // Set info dasar
        appTitle.innerText = subject.name;
        subjectDetailTitle.innerText = subject.name;
        subjectDetailTeacher.innerText = `Guru: ${subject.teacher || '-'}`;
        subjectDetailNotes.innerText = subject.notes || 'Tidak ada catatan.';
        
        // Dapatkan dan tampilkan tugas terkait
        const tasks = await getTasksBySubject(subjectId);
        subjectDetailTasks.innerHTML = '';
        let completed = 0;
        tasks.forEach(task => {
            // (Kode untuk render item tugas bisa di-paste di sini, mirip renderHomeTasks)
            subjectDetailTasks.innerHTML += `
                <div class="task-item ${task.isComplete ? 'completed' : ''}" data-task-id="${task.id}">
                    <strong>${task.title}</strong>
                    <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
                </div>
            `;
            if (task.isComplete) completed++;
        });
        
        // Tampilkan diagram pie
        const ctx = document.getElementById('subject-progress-chart').getContext('2d');
        if (subjectProgressChart) subjectProgressChart.destroy(); // Hancurkan chart lama
        
        subjectProgressChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Selesai', 'Belum Selesai'],
                datasets: [{
                    data: [completed, tasks.length - completed],
                    backgroundColor: ['var(--accent-lime)', 'var(--gray)'],
                    borderColor: 'var(--white)',
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'top' } } }
        });

        showPage('page-subject-detail');
    };

    // Menampilkan Halaman Progres (BARU)
    const renderProgressPage = async () => {
        const tasks = await getAllData('tasks');
        const subjects = await getAllData('subjects');
        
        // 1. Diagram Bar: Tugas Selesai 7 Hari Terakhir
        const taskPerDayCtx = document.getElementById('tasks-per-day-chart').getContext('2d');
        const last7Days = [];
        const taskCounts = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toLocaleDateString('id-ID', { weekday: 'short' }));
            
            const start = new Date(date).setHours(0, 0, 0, 0);
            const end = new Date(date).setHours(23, 59, 59, 999);
            
            const count = tasks.filter(t => 
                t.isComplete && t.completedAt && // Asumsi kita simpan completedAt
                t.completedAt >= start && t.completedAt <= end
            ).length;
            taskCounts.push(count);
        }
        
        if (tasksPerDayChart) tasksPerDayChart.destroy();
        tasksPerDayChart = new Chart(taskPerDayCtx, {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Tugas Selesai',
                    data: taskCounts,
                    backgroundColor: 'var(--navy-light)',
                }]
            },
            options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
        });

        // 2. Diagram Donut: Pembagian Tugas per Mapel
        const taskBySubjectCtx = document.getElementById('tasks-by-subject-chart').getContext('2d');
        const subjectTaskCounts = subjects.map(s => {
            return tasks.filter(t => t.subjectId === s.id).length;
        });
        const subjectNames = subjects.map(s => s.name);
        
        if (tasksBySubjectChart) tasksBySubjectChart.destroy();
        tasksBySubjectChart = new Chart(taskBySubjectCtx, {
            type: 'doughnut',
            data: {
                labels: subjectNames,
                datasets: [{
                    data: subjectTaskCounts,
                    backgroundColor: ['#001f3f', '#003366', '#004c99', '#39FF14', '#FFD700', '#aaa'],
                }]
            }
        });
    };

    // === 5. EVENT HANDLERS ===

    // Navigasi
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.dataset.page;
            showPage(page);
            // Render ulang halaman progres setiap kali dibuka
            if (page === 'page-progress') renderProgressPage();
        });
    });

    // Menampilkan modal
    fab.addEventListener('click', () => {
        taskForm.reset();
        document.getElementById('task-id').value = '';
        attachmentList.innerHTML = ''; // Kosongkan daftar lampiran
        modal.classList.add('show');
    });
    closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));

    // Submit Form Tugas
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('task-id').value;
        const attachedFiles = attachmentInput.files;
        let attachments = [];

        // Proses file lampiran
        for (const file of attachedFiles) {
            attachments.push({
                name: file.name,
                type: file.type,
                blob: file // Simpan file blob-nya langsung
            });
        }
        
        const taskData = {
            title: document.getElementById('task-title').value,
            subjectId: parseInt(document.getElementById('task-subject').value),
            deadline: document.getElementById('task-deadline').value,
            isComplete: false,
            attachments: attachments
        };
        
        if (id) { // Mode Edit
            taskData.id = parseInt(id);
            // Ambil status complete sebelumnya
            const tasks = await getAllData('tasks');
            const oldTask = tasks.find(t => t.id === taskData.id);
            taskData.isComplete = oldTask.isComplete;
            if (oldTask.attachments && attachments.length === 0) {
                taskData.attachments = oldTask.attachments; // Pertahankan file lama jika tidak ada yg baru
            }
        }

        await addOrUpdateData('tasks', taskData);
        modal.classList.remove('show');
        await renderHomeTasks();
    });
    
    // Submit Form Mapel
    subjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subjectData = {
            name: document.getElementById('subject-name').value,
            teacher: document.getElementById('subject-teacher').value,
            notes: "Tambahkan catatan di sini..." // (Bisa ditambahkan field textarea)
        };
        await addOrUpdateData('subjects', subjectData);
        subjectForm.reset();
        subjectForm.classList.add('hidden');
        showSubjectFormBtn.classList.remove('hidden');
        await renderSubjects();
    });
    
    // Tombol di Halaman Mapel
    showSubjectFormBtn.addEventListener('click', () => {
        subjectForm.classList.remove('hidden');
        showSubjectFormBtn.classList.add('hidden');
    });
    cancelSubjectFormBtn.addEventListener('click', () => {
        subjectForm.classList.add('hidden');
        showSubjectFormBtn.classList.remove('hidden');
    });
    
    // Klik kartu mapel untuk ke detail
    subjectGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.subject-card');
        if (card) {
            const subjectId = parseInt(card.dataset.subjectId);
            showSubjectDetail(subjectId);
        }
    });
    
    // Tombol kembali dari Detail Mapel
    backToSubjectsBtn.addEventListener('click', () => showPage('page-subjects'));
    
    // Klik pada daftar tugas (Edit/Selesai)
    document.querySelector('.content').addEventListener('click', async (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.taskId);
        const tasks = await getAllData('tasks');
        const task = tasks.find(t => t.id === taskId);

        // Jika checkbox "Selesai" diklik
        if (e.target.classList.contains('complete-check')) {
            task.isComplete = e.target.checked;
            task.completedAt = task.isComplete ? Date.now() : null; // Tandai waktu selesai
            await addOrUpdateData('tasks', task);
            await renderHomeTasks();
        }

        // Jika tombol "Edit" diklik
        if (e.target.closest('.edit-btn')) {
            document.getElementById('form-title').innerText = 'Edit Tugas';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-subject').value = task.subjectId;
            document.getElementById('task-deadline').value = task.deadline;
            
            // Tampilkan daftar file yang sudah ada
            attachmentList.innerHTML = '';
            if (task.attachments) {
                task.attachments.forEach(file => {
                    attachmentList.innerHTML += `<p>✔️ ${file.name}</p>`;
                });
            }
            modal.classList.add('show');
        }
    });


    // === 6. INISIALISASI APLIKASI ===
    const initializeApp = async () => {
        showPage('page-home');
        await renderSubjects();
        await renderHomeTasks();
        // (Fungsi notifikasi bisa ditambahkan di sini)
        // checkNotifications();
    };

    // Mulai proses dengan menginisialisasi DB
    initDB();
});
