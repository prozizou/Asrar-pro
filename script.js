// Variable pour stocker les données une fois chargées
let donneesApp = {};

// 1. Fonction pour charger le JSON au démarrage
async function initialiserApplication() {
    try {
        const reponse = await fetch('data.json');
        if (!reponse.ok) throw new Error("Erreur de chargement du fichier JSON");
        
        donneesApp = await reponse.json();
        console.log("Application prête !");
        
        // Par défaut, on affiche par exemple la catégorie 'asrar'
        afficherGrille('asrar');
        
    } catch (erreur) {
        console.error("Erreur :", erreur);
        document.getElementById('menuGrid').innerHTML = "<p>Erreur de chargement des données.</p>";
    }
}

// 2. Fonction pour créer les cartes dans la grille HTML
function afficherGrille(nomCategorie) {
    const grille = document.getElementById('menuGrid');
    grille.innerHTML = ''; // Efface le contenu actuel

    const items = donneesApp[nomCategorie];

    if (items) {
        items.forEach(item => {
            // Création de l'élément HTML pour chaque carte
            const carte = document.createElement('div');
            carte.className = 'menu-item';
            
            carte.innerHTML = `
                <div class="icon-container">
                    <img src="${item.image}" alt="${item.titre}">
                </div>
                <p>${item.titre}</p>
            `;

            // On ajoute la carte à la grille
            grille.appendChild(carte);
        });
    }
}

// Lancer l'initialisation quand la page est chargée
window.onload = initialiserApplication;
