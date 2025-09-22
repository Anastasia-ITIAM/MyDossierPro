export function initProfilUI() {

    const profileImage = document.getElementById("profileImage");
    const profilePseudo = document.getElementById("profilePseudo");
    const profileRole = document.getElementById("profileRole");
    const profileCredits = document.getElementById("profileCredits");

    const userId = window.currentUserId;
    if (!userId) {
        console.error("[ProfilUI] Aucun utilisateur connecté !");
        return;
    }

    const storageKey = `userProfile_${userId}`;

    const roleLabels = {
        ROLE_PASSENGER: "passager",
        ROLE_PASSENGER_DRIVER: "chauffeur et passager",
    };

    const visibleByRole = {
        ROLE_PASSENGER: ["driver"],
        ROLE_PASSENGER_DRIVER: ["publish", "myCars"],
    };

    const buttons = {
        driver: document.getElementById("btnDriver"),
        publish: document.getElementById("btnPublishTrip"),
        myCars: document.getElementById("btnMyCars")
    };

    // Bloquer l’accès au rôle chauffeur si profil incomplet
    if (buttons.driver) {
        buttons.driver.addEventListener("click", (event) => {
            const requiredFields = ["email", "pseudo", "firstName", "lastName", "birthDate", "postalAddress", "phone"];
            const data = JSON.parse(sessionStorage.getItem(storageKey)) || {};
            const incomplete = requiredFields.some(field => !data[field] || data[field].trim() === "");
            if (incomplete) {
                event.preventDefault();
                alert("Vous devez compléter tous les champs de votre profil avant de devenir chauffeur·euse !");
                window.location.href = "profil.html";
            }
        });
    }

    // Fonction de mise à jour de l'UI
    function refreshUI(dataOverride = null) {
        const data = dataOverride || JSON.parse(sessionStorage.getItem(storageKey)) || {};
        const userRole = data.role || "ROLE_UNKNOWN";

        // Photo et pseudo
        if (profileImage) {
            profileImage.src = data.profilePhotoUrl 
                ? (data.profilePhotoUrl.startsWith("http") 
                    ? data.profilePhotoUrl 
                    : `http://localhost:8081${data.profilePhotoUrl}`) 
                : "";
        }
        if (profilePseudo) profilePseudo.textContent = data.pseudo || "";
        if (profileRole) profileRole.textContent = roleLabels[userRole] || userRole;

        // Crédits
        if (profileCredits) {
            const displayedCredits = Number.isInteger(data.credits) ? data.credits : 0;
            profileCredits.textContent = displayedCredits;
            console.log("[ProfilUI] Crédits affichés :", displayedCredits);
        }

        // Masquer tous les boutons par défaut
        Object.values(buttons).forEach(btn => {
            if (btn) btn.style.setProperty("display", "none", "important");
        });

        // Afficher uniquement les boutons autorisés pour le rôle
        if (visibleByRole[userRole]) {
            visibleByRole[userRole].forEach(key => {
                if (buttons[key]) buttons[key].style.setProperty("display", "inline-block", "important");
            });
        }
    }
    
    // IMPORTANT : ne pas rafraîchir tout de suite (sinon données vides)

    // Quand d’autres modules (initProfil) finissent de charger le user
    window.addEventListener("profileDataReady", (e) => {
        if (e.detail && typeof e.detail === "object") {
            sessionStorage.setItem(storageKey, JSON.stringify(e.detail));
            refreshUI(e.detail); // UI mise à jour immédiatement
        }
    });

    // Si jamais on a déjà des données stockées (cas d’un rechargement)
    const cached = JSON.parse(sessionStorage.getItem(storageKey));
    if (cached && cached.pseudo) {
        refreshUI(cached);
    }
}
