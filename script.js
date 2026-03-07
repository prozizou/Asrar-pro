let appData = {};

// Fonction pour charger les données
async function loadAppData() {
    try {
        // Chargement du fichier JSON
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("Impossible de lire data.json");
        
        appData = await response.json();
        
        // On affiche toutes les catégories sur la page d'accueil par exemple
        // Ou une catégorie spécifique au choix
        renderCategory('asrar'); 
        
    } catch (error) {
        console.error("Erreur de chargement:", error);
        document.getElementById('menuGrid').innerHTML = "Erreur de connexion aux données.";
    }
}

// Fonction pour injecter le HTML
function renderCategory(catName) {
    const grid = document.getElementById('menuGrid');
    const title = document.getElementById('categoryTitle');
    
    grid.innerHTML = ''; // Nettoyage
    title.innerText = catName.charAt(0).toUpperCase() + catName.slice(1);

    const items = appData[catName];

    if (items) {
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-item';
            card.innerHTML = `
                <div class="icon-container">
                    <img src="${item.image}" alt="${item.titre}">
                </div>
                <p>${item.titre}</p>
            `;
            
            // Action au clic
            card.onclick = () => alert("Vous avez cliqué sur : " + item.titre);
            
            grid.appendChild(card);
        });
    }
}

// Initialisation
window.onload = loadAppData;
