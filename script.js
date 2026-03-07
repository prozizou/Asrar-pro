let appData = {};
let currentCategory = '';
let currentItems = [];
const colorThief = new ColorThief();
let deferredPrompt;

async function init() {
    try {
        const resp = await fetch('data.json');
        appData = await resp.json();
        setupSidebar();
        const firstCat = Object.keys(appData)[0];
        chargerCategorie(firstCat);
        // Retrait élégant du splash screen
        setTimeout(() => document.getElementById('splash-screen').classList.add('hidden'), 1800);
    } catch (err) { console.error("Erreur d'initialisation", err); }
}

function setupSidebar() {
    const list = document.getElementById('category-list');
    Object.keys(appData).forEach(cat => {
        const li = document.createElement('li');
        li.id = `nav-${cat}`;
        li.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
        li.onclick = () => { chargerCategorie(cat); toggleSidebar(); };
        list.appendChild(li);
    });
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function chargerCategorie(nom) {
    currentCategory = nom;
    document.getElementById('categoryTitle').innerText = nom.toUpperCase();
    document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
    if(document.getElementById(`nav-${nom}`)) document.getElementById(`nav-${nom}`).classList.add('active');

    let base = [...appData[nom]];
    const saved = localStorage.getItem(`asrar_v2_order_${nom}`);
    if (saved) {
        const ids = JSON.parse(saved);
        currentItems = ids.map(id => base.find(i => i.id == id)).filter(i => i);
        const news = base.filter(b => !ids.includes(b.id.toString()));
        currentItems = [...currentItems, ...news];
    } else { currentItems = base; }
    render(currentItems);
}

function render(items) {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';
    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'menu-item';
        el.draggable = true;
        el.dataset.id = item.id;
        
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = item.image;
        img.onload = () => {
            const rgb = colorThief.getColor(img);
            const colorStr = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
            el.style.backgroundColor = `rgba(${colorStr}, 0.12)`;
            el.style.borderColor = `rgba(${colorStr}, 0.3)`;
            el.style.setProperty('--glow-color', `rgba(${colorStr}, 0.5)`);
        };

        el.innerHTML = `<div class="icon-container"></div><p>${item.titre}</p>`;
        el.querySelector('.icon-container').appendChild(img);
        
        el.addEventListener('dragstart', () => el.classList.add('dragging'));
        el.addEventListener('dragend', () => { el.classList.remove('dragging'); sauvegarder(); });
        grid.appendChild(el);
    });
    setupDragAndDrop(grid);
}

function setupDragAndDrop(grid) {
    grid.ondragover = e => {
        e.preventDefault();
        const dragging = document.querySelector('.dragging');
        const after = [...grid.querySelectorAll('.menu-item:not(.dragging)')].find(el => {
            const box = el.getBoundingClientRect();
            return e.clientY < box.top + box.height / 2;
        });
        after ? grid.insertBefore(dragging, after) : grid.appendChild(dragging);
    };
}

function sauvegarder() {
    const ids = [...document.querySelectorAll('.menu-item')].map(el => el.dataset.id);
    localStorage.setItem(`asrar_v2_order_${currentCategory}`, JSON.stringify(ids));
}

function filtrerElements() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = currentItems.filter(i => i.titre.toLowerCase().includes(q));
    render(filtered);
}

function reinitialiserOrdre() {
    if(confirm("Réinitialiser l'ordre de cette catégorie ?")) {
        localStorage.removeItem(`asrar_v2_order_${currentCategory}`);
        chargerCategorie(currentCategory);
    }
}

// Gestion Installation PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-area').style.display = 'block';
});

document.getElementById('btnInstall').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            document.getElementById('install-area').style.display = 'none';
            deferredPrompt = null;
        });
    }
});

window.onload = init;
