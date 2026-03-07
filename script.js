let appData = {};
let currentCategory = 'asrar';
let currentItems = [];

async function init() {
    try {
        const resp = await fetch('data.json');
        appData = await resp.json();
        
        chargerCategorie(currentCategory);
        
        // Cacher le splash après 1.5s
        setTimeout(() => document.getElementById('splash-screen').classList.add('hidden'), 1500);
    } catch (err) { console.error("Erreur d'initialisation", err); }
}

function chargerCategorie(nom) {
    currentCategory = nom;
    let base = [...appData[nom]];
    const saved = localStorage.getItem(`ordre_${nom}`);

    if (saved) {
        const ids = JSON.parse(saved);
        currentItems = ids.map(id => base.find(i => i.id == id)).filter(i => i);
        // Ajouter les nouveaux items du JSON non présents dans la sauvegarde
        const news = base.filter(b => !ids.includes(b.id.toString()));
        currentItems = [...currentItems, ...news];
    } else {
        currentItems = base;
    }
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
        el.innerHTML = `<div class="icon-container"><img src="${item.image}"></div><p>${item.titre}</p>`;
        
        el.addEventListener('dragstart', () => el.classList.add('dragging'));
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            sauvegarder();
        });
        grid.appendChild(el);
    });
    setupDragAndDrop(grid);
}

function sauvegarder() {
    const ids = [...document.querySelectorAll('.menu-item')].map(el => el.dataset.id);
    localStorage.setItem(`ordre_${currentCategory}`, JSON.stringify(ids));
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

function filtrerElements() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    render(currentItems.filter(i => i.titre.toLowerCase().includes(q)));
}

function reinitialiserOrdre() {
    if(confirm("Réinitialiser l'ordre ?")) {
        localStorage.removeItem(`ordre_${currentCategory}`);
        chargerCategorie(currentCategory);
    }
}

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

window.onload = init;
