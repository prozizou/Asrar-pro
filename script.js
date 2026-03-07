// Configuration Firebase réelle extraite de votre google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyBLzPKzbiNYitUz7sv9Ftqm0oF20rA32Zk",
    authDomain: "asrar-bc059.firebaseapp.com",
    databaseURL: "https://asrar-bc059.firebaseio.com",
    projectId: "asrar-bc059",
    storageBucket: "asrar-bc059.appspot.com",
    messagingSenderId: "199810893447",
    appId: "1:199810893447:android:044629472e10f9eb68da22"
};

// Initialisation
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let appData = {};
let currentCategory = '';
let currentItems = [];
const colorThief = new ColorThief();
let deferredPrompt;

// Chargement initial
async function init() {
    // Connexion en temps réel à la base de données
    db.ref('/').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            appData = data;
            setupSidebar();
            
            // Sélection automatique de la première catégorie au démarrage
            if (!currentCategory) {
                const firstCat = Object.keys(appData)[0];
                chargerCategorie(firstCat);
            } else {
                chargerCategorie(currentCategory);
            }
        }
        // Masquer le splash screen
        setTimeout(() => document.getElementById('splash-screen').classList.add('hidden'), 1500);
    });
}

function setupSidebar() {
    const list = document.getElementById('category-list');
    list.innerHTML = '';
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
    document.getElementById('categoryTitle').innerText = nom.toUpperCase();
    document.querySelectorAll('#category-list li').forEach(el => el.classList.remove('active'));
    if(document.getElementById(`nav-${nom}`)) document.getElementById(`nav-${nom}`).classList.add('active');

    // Transformation des données Firebase en tableau
    let base = [];
    const catData = appData[nom];
    for (let key in catData) {
        base.push({ ...catData[key], firebaseKey: key });
    }

    // Gestion de l'ordre personnalisé local
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
    render(currentItems.filter(i => i.titre.toLowerCase().includes(q)));
}

function reinitialiserOrdre() {
    localStorage.removeItem(`asrar_v2_order_${currentCategory}`);
    chargerCategorie(currentCategory);
}

// Installation PWA
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
