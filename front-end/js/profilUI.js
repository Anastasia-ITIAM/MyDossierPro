export function initProfilUI() {
    const profileImage = document.getElementById("profileImage");
    const profilePseudo = document.getElementById("profilePseudo");
    const profileRole = document.getElementById("profileRole");
    const profileCredits = document.getElementById("profileCredits");

    // Récupération de l'utilisateur connecté
    let user = window.currentUser || JSON.parse(sessionStorage.getItem("currentUser"));
    if (!user || !user.id) return console.error("[ProfilUI] Aucun utilisateur connecté !");
    const userId = user.id;
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

    if (buttons.driver) {
        buttons.driver.addEventListener("click", (e) => {
            const requiredFields = ["email", "username", "firstName", "lastName", "birthDate", "postalAddress", "phone"];
            const data = JSON.parse(sessionStorage.getItem(storageKey)) || {};
            if (requiredFields.some(f => !data[f] || data[f].trim() === "")) {
                e.preventDefault();
                alert("Vous devez compléter tous les champs de votre profil avant de devenir chauffeur·euse !");
                window.location.href = "profil.html";
            }
        });
    }

    function refreshUI(dataOverride = null) {
        const data = dataOverride || JSON.parse(sessionStorage.getItem(storageKey)) || {};
        const userRole = data.role || "ROLE_UNKNOWN";

        if (profileImage) profileImage.src = data.profilePhotoUrl
            ? (data.profilePhotoUrl.startsWith("http") ? data.profilePhotoUrl : `http://localhost:8080${data.profilePhotoUrl}`)
            : "";
        if (profilePseudo) profilePseudo.textContent = data.username || "";
        if (profileRole) profileRole.textContent = roleLabels[userRole] || userRole;
        if (profileCredits) profileCredits.textContent = Number.isInteger(data.credits) ? data.credits : 0;

        Object.values(buttons).forEach(btn => { if (btn) btn.style.setProperty("display", "none", "important"); });
        if (visibleByRole[userRole]) visibleByRole[userRole].forEach(key => { if (buttons[key]) buttons[key].style.setProperty("display", "inline-block", "important"); });
    }

    window.addEventListener("profileDataReady", (e) => {
        if (e.detail && typeof e.detail === "object") {
            sessionStorage.setItem(storageKey, JSON.stringify(e.detail));
            refreshUI(e.detail);
        }
    });

    const cached = JSON.parse(sessionStorage.getItem(storageKey));
    if (cached && cached.username) refreshUI(cached);
}
