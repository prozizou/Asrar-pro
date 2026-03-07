// 1. CONFIGURATION ET CONNEXION À LA BASE DE DONNÉES
const config = { 
    databaseURL: "https://asrar-bc059.firebaseio.com" 
};
firebase.initializeApp(config);
const db = firebase.database();

// 2. ÉTAT LOCAL ET MÉMOIRE DE L'APPAREIL
let currentCat = 'db_sirr_protection';
let currentID = null;

// On identifie l'utilisateur pour le chat et on récupère ses likes passés
const user = JSON.parse(localStorage.getItem('asrar_user')) || { 
    name: "Disciple_" + Math.floor(Math.random() * 999) 
};
let userLikes = JSON.parse(localStorage.getItem('asrar_user_likes')) || {};

// 3. NAVIGATION ENTRE LES 5 CATÉGORIES
function switchCat(cat, btn) {
    const view = document.getElementById('main-view');
    view.classList.add('fade-out'); // Effet visuel de transition
    
    setTimeout(() => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentCat = cat;
        loadData(); // Charge les données Firebase de la catégorie choisie
        view.classList.remove('fade-out');
    }, 300);
}

// 4. RÉCUPÉRATION DES DONNÉES DEPUIS FIREBASE
function loadData() {
    // Écoute en temps réel : si quelqu'un d'autre like, votre écran se met à jour
    db.ref(currentCat).on('value', snap => {
        const data = snap.val(); 
        if (!data) { 
            document.getElementById('feed').innerHTML = ""; 
            document.getElementById('podium').innerHTML = "";
            return; 
        }

        // Conversion et tri par nombre de likes (du plus aimé au moins aimé)
        const items = Object.keys(data).map(k => ({...data[k], key: k}))
                      .sort((a,b) => (b.likes || 0) - (a.likes || 0));
        
        // Affichage du Podium (Les 3 premiers)
        document.getElementById('podium').innerHTML = items.slice(0,3).map((it, i) => `
            <div class="p-circle" onclick="openModal('${it.key}')">
                <img src="${it.img || ''}" onerror="this.style.display='none'">
                <div class="p-rank">${i+1}</div>
            </div>
        `).join('');

        // Affichage de la liste avec la Barre de Puissance
        document.getElementById('feed').innerHTML = items.map(it => `
            <div class="card" onclick="openModal('${it.key}')">
                <img src="${it.img || ''}" class="card-img" onerror="this.style.display='none'">
                <div style="flex:1">
                    <div class="card-title">${it.faida}</div>
                    <div class="power-line">
                        <div class="power-fill" style="width:${Math.min((it.likes || 0) * 5, 100)}%"></div>
                    </div>
                </div>
                <div style="font-size:0.75rem; font-weight:bold;">${it.likes || 0} ❤️</div>
            </div>
        `).join('');
    });
}

// 5. GESTION DES LIKES DANS FIREBASE (Action unique)
function toggleLike() {
    if (!currentID) return;
    const path = `${currentCat}/${currentID}/likes`;

    if (!userLikes[currentID]) {
        // AJOUT DANS FIREBASE : Utilise une transaction pour éviter les erreurs de calcul
        db.ref(path).transaction(c => (c || 0) + 1);
        userLikes[currentID] = true;
    } else {
        // RETRAIT DANS FIREBASE (Dislike)
        db.ref(path).transaction(c => Math.max((c || 0) - 1, 0));
        delete userLikes[currentID];
    }

    // Sauvegarde locale pour que l'utilisateur ne puisse pas liker 100 fois le même secret
    localStorage.setItem('asrar_user_likes', JSON.stringify(userLikes));
    updateHeartUI();
}

// 6. SYSTÈME DE DISCUSSION (CHAT) DANS FIREBASE
function send() {
    const inp = document.getElementById('chatInput');
    if (!inp.value || !currentID) return;

    // Ajoute le message dans la branche 'discussions' de Firebase
    db.ref('discussions/' + currentID).push({ 
        user: user.name, 
        text: inp.value,
        timestamp: Date.now()
    });
    inp.value = '';
}

// 7. OUVERTURE DE LA MODALE ET CHARGEMENT DU CHAT
function openModal(id) {
    currentID = id;
    db.ref(`${currentCat}/${id}`).once('value', snap => {
        const it = snap.val();
        document.getElementById('m-title').innerText = it.faida.toUpperCase();
        document.getElementById('m-sirr').innerText = it.sirr;
        document.getElementById('m-img').src = it.img || '';
        document.getElementById('modal').style.display = 'flex';
        updateHeartUI();
    });

    // Écoute les nouveaux commentaires en temps réel pour ce secret
    db.ref('discussions/' + id).on('value', snap => {
        const msgs = snap.val();
        document.getElementById('m-chat').innerHTML = msgs ? Object.values(msgs).map(m => `
            <div class="bubble"><b>${m.user}</b>${m.text}</div>
        `).join('') : '';
        document.getElementById('m-scroll').scrollTop = 99999;
    });
}

function updateHeartUI() {
    const btn = document.getElementById('heart-btn');
    btn.style.color = userLikes[currentID] ? "#f87171" : "white";
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    db.ref('discussions/' + currentID).off(); // Coupe la connexion pour économiser les données
    currentID = null;
}

window.onload = loadData;
