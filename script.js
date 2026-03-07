let appData = {};
let currentCategory = '';
let currentItems = [];
const colorThief = new ColorThief();

async function init() {
    try {
        const resp = await fetch('data.json');
        appData = await resp.json();
        
        setupSidebar();
        const firstCat = Object.keys(appData)[0];
        chargerCategorie(firstCat);
        
        setTimeout(() => document.getElementById('splash-screen').classList.add('hidden'), 1500);
    } catch (err) { console.error("Erreur chargement JSON", err); }
}

function setupSidebar() {
    const list = document.getElementById('category-list');
    Object.keys(appData).forEach(cat => {
        const li = document.createElement('li');
        li.id = `nav-${cat}`;
        li.innerText = cat.toUpperCase();
        li.onclick = () => { chargerCategorie(cat); toggleSidebar(); };
        list.appendChild(li);
    });
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

function chargerCategorie(nom) {
    currentCategory = nom;
    document.getElementById('categoryTitle').innerText = nom;
    document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
    document.getElementById(`nav-${nom}`).classList.add('active');

    let base = [...appData[nom]];
    const saved = localStorage.getItem(`ordre_${nom}`);
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
            el.style.backgroundColor = `rgba(${colorStr}, 0.15)`;
            el.style.borderColor = `rgba(${colorStr}, 0.4)`;
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
    localStorage.setItem(`ordre_${currentCategory}`, JSON.stringify(ids));
}

function filtrerElements() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    render(currentItems.filter(i => i.titre.toLowerCase().includes(q)));
}

function reinitialiserOrdre() {
    if(confirm("Restaurer l'ordre ?")) {
        localStorage.removeItem(`ordre_${currentCategory}`);
        chargerCategorie(currentCategory);
    }
}

if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js'); }
window.onload = init;
