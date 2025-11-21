// Menunggu semua elemen HTML dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // === ELEMEN DOM ===
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-btn');
    const fab = document.getElementById('fab-add-task');
    const modal = document.getElementById('modal-add-task');
    const closeModalBtn = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');
    const taskListToday = document.getElementById('task-list-today');
    const taskListUpcoming = document.getElementById('task-list-upcoming');
    const subjectList = document.getElementById('subject-list');
    const subjectForm = document.getElementById('subject-form');
    const showSubjectFormBtn = document.getElementById('show-subject-form');
    const cancelSubjectFormBtn = document.getElementById('cancel-subject-form');
    const taskSubjectSelect = document.getElementById('task-subject');

    // === STATE APLIKASI (DATABASE LOKAL) ===
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let subjects = JSON.parse(localStorage.getItem('subjects')) || [];

    // === FUNGSI ===

    // Menyimpan data ke localStorage
    const saveData = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('subjects', JSON.stringify(subjects));
    };

    // Navigasi Pindah Halaman
    const showPage = (pageId) => {
        // Sembunyikan semua halaman
        pages.forEach(page => page.classList.remove('active'));
        // Tampilkan halaman yang diminta
        document.getElementById(pageId).classList.add('active');

        // Update status aktif tombol nav
        navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
    };

    // --- FUNGSI TUGAS (TASKS) ---

    // Menampilkan semua tugas
    const renderTasks = () => {
        // Kosongkan daftar
        taskListToday.innerHTML = '';
        taskListUpcoming.innerHTML = '';
        
        const now = new Date();
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // Sortir tugas berdasarkan deadline (yang paling dekat)
        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        if (tasks.length === 0) {
            taskListToday.innerHTML = '<p>Belum ada tugas.</p>';
            return;
        }

        tasks.forEach(task => {
            const taskDeadline = new Date(task.deadline);
            const subject = subjects.find(s => s.id === task.subjectId) || { name: 'Umum' };
            
            // Format tanggal yang mudah dibaca
            const deadlineFormatted = taskDeadline.toLocaleString('id-ID', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            const taskElementHTML = `
                <div class="task-item ${task.isComplete ? 'completed' : ''}" data-task-id="${task.id}">
                    <div class="task-info">
                        <strong>${task.title}</strong>
                        <p><span class="subject-tag">${subject.name}</span></p>
                        <p>Deadline: ${deadlineFormatted}</p>
                    </div>
                    <div class="task-actions">
                        <input type="checkbox" class="complete-check" ${task.isComplete ? 'checked' : ''}>
                        <button class="edit-btn">
                            <i class="material-icons">edit</i>
                        </button>
                    </div>
                </div>
            `;
            
            // Pisahkan tugas hari ini dan mendatang
            if (taskDeadline <= todayEnd && !task.isComplete) {
                taskListToday.innerHTML += taskElementHTML;
            } else if (!task.isComplete) {
                taskListUpcoming.innerHTML += taskElementHTML;
            }
        });

        // Tampilkan pesan jika kosong
        if (taskListToday.innerHTML === '') taskListToday.innerHTML = '<p>Tidak ada tugas hari ini. Santai!</p>';
        if (taskListUpcoming.innerHTML === '') taskListUpcoming.innerHTML = '<p>Tidak ada tugas mendatang.</p>';
    };

    // Menampilkan modal (pop-up) form tugas
    const showTaskModal = (task = null) => {
        // Isi form jika dalam mode edit
        if (task) {
            document.getElementById('form-title').innerText = 'Edit Tugas';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-subject').value = task.subjectId;
            document.getElementById('task-deadline').value = task.deadline;
            document.getElementById('task-description').value = task.description;
        } else {
            // Mode tambah baru
            document.getElementById('form-title').innerText = 'Tambah Tugas Baru';
            taskForm.reset();
            document.getElementById('task-id').value = '';
        }
        modal.classList.add('show');
    };

    const hideTaskModal = () => modal.classList.remove('show');

    // Menangani submit form tugas (Tambah atau Edit)
    const handleTaskFormSubmit = (e) => {
        e.preventDefault();
        
        const id = document.getElementById('task-id').value;
        const taskData = {
            title: document.getElementById('task-title').value,
            subjectId: document.getElementById('task-subject').value,
            deadline: document.getElementById('task-deadline').value,
            description: document.getElementById('task-description').value,
            isComplete: false
        };

        if (id) {
            // Mode EDIT: Cari index tugas dan ganti datanya
            const taskIndex = tasks.findIndex(t => t.id == id);
            // Tetap pertahankan status isComplete sebelumnya
            taskData.isComplete = tasks[taskIndex].isComplete; 
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        } else {
            // Mode TAMBAH BARU
            taskData.id = Date.now(); // ID unik
            tasks.push(taskData);
        }

        saveData();
        renderTasks();
        hideTaskModal();
    };

    // Menangani klik pada daftar tugas (untuk Edit atau Selesai)
    const handleTaskListClick = (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.taskId;
        const task = tasks.find(t => t.id == taskId);

        // Jika tombol "Selesai" (checkbox) diklik
        if (e.target.classList.contains('complete-check')) {
            task.isComplete = e.target.checked;
            saveData();
            // Render ulang untuk memindahkan tugas (jika perlu)
            setTimeout(renderTasks, 300); 
        }

        // Jika tombol "Edit" diklik
        if (e.target.closest('.edit-btn')) {
            showTaskModal(task);
        }
    };


    // --- FUNGSI MATA PELAJARAN (SUBJECTS) ---

    // Menampilkan daftar mapel
    const renderSubjects = () => {
        subjectList.innerHTML = '';
        if (subjects.length === 0) {
            subjectList.innerHTML = '<p>Belum ada mata pelajaran. Tambahkan di bawah.</p>';
        }

        subjects.forEach(subject => {
            subjectList.innerHTML += `
                <div class="subject-item" data-subject-id="${subject.id}">
                    <h4>${subject.name}</h4>
                    <p><strong>Guru:</strong> ${subject.teacher || '-'}</p>
                    <p><strong>Catatan:</strong>\n${subject.notes || '-'}</p>
                    </div>
            `;
        });

        // Update juga pilihan <select> di form tugas
        taskSubjectSelect.innerHTML = '<option value="">Pilih Mapel...</option>';
        subjects.forEach(subject => {
            taskSubjectSelect.innerHTML += `<option value="${subject.id}">${subject.name}</option>`;
        });
    };

    // Menangani submit form mapel
    const handleSubjectFormSubmit = (e) => {
        e.preventDefault();
        
        const subjectData = {
            id: Date.now(),
            name: document.getElementById('subject-name').value,
            teacher: document.getElementById('subject-teacher').value,
            notes: document.getElementById('subject-notes').value,
        };
        
        subjects.push(subjectData);
        saveData();
        renderSubjects();
        
        // Sembunyikan form
        subjectForm.classList.add('hidden');
        showSubjectFormBtn.classList.remove('hidden');
        subjectForm.reset();
    };


    // --- FUNGSI NOTIFIKASI ---
    const checkNotifications = () => {
        // 1. Minta izin
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        if (Notification.permission === 'granted') {
            const now = new Date();
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);

            // 2. Cari tugas hari ini yang belum selesai
            const upcomingTasks = tasks.filter(task => {
                const deadline = new Date(task.deadline);
                return !task.isComplete && deadline > now && deadline <= todayEnd;
            });
            
            // 3. Notifikasi Bervariasi:
            // Skenario 1: Ringkasan Pagi (Disimulasikan saat buka aplikasi)
            if (upcomingTasks.length > 0) {
                new Notification('Pengingat Tugas TaskNavy', {
                    body: `Anda memiliki ${upcomingTasks.length} tugas yang harus selesai hari ini. Semangat!`,
                    icon: 'icon.png' // Anda bisa tambahkan file icon.png
                });
            }
            
            // Skenario 2: Notifikasi per tugas (Lebih advanced, perlu Service Worker)
            // Untuk saat ini, kita buat notifikasi ringkasan saja saat aplikasi dibuka.
        }
    };


    // === EVENT LISTENERS (Menghubungkan semuanya) ===

    // Navigasi
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showPage(button.dataset.page);
        });
    });

    // Tombol FAB
    fab.addEventListener('click', () => showTaskModal(null));
    closeModalBtn.addEventListener('click', hideTaskModal);
    
    // Form
    taskForm.addEventListener('submit', handleTaskFormSubmit);
    subjectForm.addEventListener('submit', handleSubjectFormSubmit);

    // Tombol Form Mapel
    showSubjectFormBtn.addEventListener('click', () => {
        subjectForm.classList.remove('hidden');
        showSubjectFormBtn.classList.add('hidden');
    });
    cancelSubjectFormBtn.addEventListener('click', () => {
        subjectForm.classList.add('hidden');
        showSubjectFormBtn.classList.remove('hidden');
        subjectForm.reset();
    });

    // Event Listener untuk tombol Edit dan Selesai (Event Delegation)
    document.getElementById('page-home').addEventListener('click', handleTaskListClick);


    // === INISIALISASI APLIKASI ===
    const init = () => {
        showPage('page-home'); // Mulai dari Halaman Home
        renderSubjects(); // Siapkan data mapel
        renderTasks(); // Tampilkan tugas
        checkNotifications(); // Cek notifikasi saat aplikasi dibuka
    };
    
    init();

});
