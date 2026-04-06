/**
 * app.js - Frontend logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Light';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            if (themeIcon) themeIcon.textContent = isLight ? '☀️' : '🌙';
            if (themeText) themeText.textContent = isLight ? 'Light' : 'Dark';
        });
    }

    const dashboardView = document.getElementById('dashboardView');
    const fileListView = document.getElementById('fileListView');
    const categoryCards = document.querySelectorAll('.category-card');
    const backBtn = document.getElementById('backToDashboard');
    const activeCategoryTitle = document.getElementById('activeCategoryTitle');
    
    const categorySearchInput = document.getElementById('categorySearchInput');
    const fileTable = document.getElementById('fileTable');
    const fileRows = fileTable.querySelectorAll('tbody tr');
    let currentCategory = '';

    const uploadModal = document.getElementById('uploadModal');
    const openModalBtn = document.getElementById('openUploadModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const uploadForm = document.getElementById('uploadForm');
    const previewModal = document.getElementById('previewModal');
    const previewContainer = document.getElementById('previewContainer');

    // Navigation Logic
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            currentCategory = card.getAttribute('data-category');
            const catName = card.querySelector('h3').innerText;
            
            activeCategoryTitle.innerText = catName;
            
            // Filter rows by category
            fileRows.forEach(row => {
                if (row.getAttribute('data-category') === currentCategory) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });

            dashboardView.classList.add('hidden');
            fileListView.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    backBtn.addEventListener('click', () => {
        fileListView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        currentCategory = '';
        categorySearchInput.value = '';
    });

    // Search Functionality (Scoped to current category)
    categorySearchInput.addEventListener('input', () => {
        const query = categorySearchInput.value.toLowerCase();
        
        fileRows.forEach(row => {
            const filename = row.getAttribute('data-filename');
            const rowCat = row.getAttribute('data-category');
            
            if (rowCat === currentCategory) {
                if (filename.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });

    // Modal Logic
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            uploadModal.style.display = 'flex';
        });
    }

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
            if (previewModal) previewModal.style.display = 'none';
            if (previewContainer) previewContainer.innerHTML = '';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) uploadModal.style.display = 'none';
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
            previewContainer.innerHTML = '';
        }
    });

    // File Preview
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            const storedName = btn.getAttribute('data-stored');
            const fileType = btn.getAttribute('data-type');
            const url = `view.php?file=${storedName}`;

            previewContainer.innerHTML = '';
            if (fileType.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = url;
                previewContainer.appendChild(img);
            } else if (fileType === 'application/pdf' || fileType.startsWith('text/')) {
                const iframe = document.createElement('iframe');
                iframe.src = url;
                previewContainer.appendChild(iframe);
            } else {
                previewContainer.innerHTML = '<p style="color: var(--text);">Preview not available for this file type. Please download to view.</p>';
            }
            previewModal.style.display = 'flex';
        });
    });

    // Upload Form
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);
            const response = await fetch('upload.php', { method: 'POST', body: formData });
            const result = await response.json();
            if (result.success) location.reload();
            else alert(result.error);
        });
    }

    // Delete
    document.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', async () => {
            const fileId = btn.getAttribute('data-id');
            if (confirm('Delete this document?')) {
                const response = await fetch('delete.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `file_id=${fileId}`
                });
                const result = await response.json();
                if (result.success) btn.closest('tr').remove();
                else alert(result.error);
            }
        });
    });
});
