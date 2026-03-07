// 1. Configuration du Robot PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// 2. Initialisation Firebase
const config = { databaseURL: "https://asrar-bc059.firebaseio.com" };
if (!firebase.apps.length) {
    firebase.initializeApp(config);
}
const db = firebase.database();

/**
 * Charge les livres depuis la branche 'almaqtab'
 *
 */
function loadBooks() {
    const container = document.getElementById('grimoire-list');
    
    db.ref('almaqtab').on('value', snap => {
        const data = snap.val();
        if(!data) {
            container.innerHTML = "<p>Aucun grimoire trouvé.</p>";
            return;
        }
        
        const items = Object.keys(data).map(k => ({...data[k], key: k}));
        
        container.innerHTML = items.map(grim => `
            <div class="grimoire-card" onclick="openGrimoire('${grim.pdf}', '${grim.text}')">
                <img src="${grim.img}" class="grimoire-cover" onerror="this.src='https://via.placeholder.com/150x200?text=Livre'">
                <div class="grimoire-info">
                    <div class="grimoire-title">${grim.text ? grim.text.replace('.pdf', '') : 'Manuscrit'}</div>
                    <div id="pages-${grim.key}" class="page-badge">Calcul des pages...</div>
                </div>
            </div>
        `).join('');

        // Lancement du calcul des pages pour chaque lien 'pdf' trouvé
        //
        items.forEach(grim => {
            if(grim.pdf) {
                countPages(grim.pdf, `pages-${grim.key}`);
            }
        });
    });
}

/**
 * Robot de comptage des pages via Google Drive
 *
 */
async function countPages(driveUrl, elementId) {
    try {
        // Transformation du lien pour la lecture directe
        const streamUrl = driveUrl.replace('/view', '/preview');
        
        const loadingTask = pdfjsLib.getDocument(streamUrl);
        const pdf = await loadingTask.promise;
        
        document.getElementById(elementId).innerText = "📜 " + pdf.numPages + " pages";
    } catch (e) {
        // Fallback si le robot est bloqué par les permissions Drive
        document.getElementById(elementId).innerText = "📜 Manuscrit complet";
    }
}

/**
 * Gestion du lecteur PDF (Iframe)
 *
 */
function openGrimoire(driveUrl, title) {
    if(!driveUrl) {
        alert("Lien introuvable.");
        return;
    }
    
    // Conversion URL pour affichage Iframe
    let finalUrl = driveUrl.replace('/view', '/preview').replace('/edit', '/preview');

    document.getElementById('view-title').innerText = title;
    document.getElementById('pdf-viewer').src = finalUrl;
    document.getElementById('reader').style.display = 'flex';
}

function closeReader() {
    document.getElementById('reader').style.display = 'none';
    document.getElementById('pdf-viewer').src = "";
}

// Lancement automatique au chargement de la page
window.onload = loadBooks;
