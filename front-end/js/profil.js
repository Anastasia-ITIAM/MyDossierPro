export function initProfil() {

    // Utilitaires
    function sanitizeInput(input) {
        if (typeof input !== "string") return input;
        return input.replace(/[<>]/g, "");
    }

    function safeAlert(message) {
        const div = document.createElement('div');
        div.textContent = Array.isArray(message) ? message.join('\n') : message;
        alert(div.textContent);
    }

    // Vérifie si le profil est complet
    function isProfileComplete(userData) {
        const requiredFields = ['email', 'pseudo', 'firstName', 'lastName', 'birthDate', 'postalAddress', 'phone'];
        return requiredFields.every(field => userData[field] && userData[field].trim() !== '');
    }

    // Sélection du formulaire et alert
    const form = document.getElementById('updateProfileForm');
    if (!form) {
        console.error("Formulaire #updateProfileForm non trouvé");
        return;
    }

    const profileAlert = document.querySelector('.col-md-8 h5.text-danger');
    const userId = window.currentUserId;
    if (!userId) {
        console.error("Aucun utilisateur connecté !");
        return;
    }

    const storageKey = `userProfile_${userId}`;

    // Chargement des données utilisateur
    async function loadUserData() {
        try {
            const storedData = JSON.parse(sessionStorage.getItem(storageKey)) || {};
            const profileImage = document.getElementById("profileImage");

            // Étape 1 : si données locales -> afficher direct
            if (Object.keys(storedData).length > 0) {
                window.dispatchEvent(new CustomEvent("profileDataReady", { detail: storedData }));
            }

            // Étape 2 : toujours récupérer les données serveur
            const res = await fetch(`http://localhost:8081/api/user/${userId}`);
            const result = await res.json();

            if (!res.ok || !result.success) {
                console.error("Impossible de récupérer les données serveur");
                return;
            }

            const serverData = result.user;
            const userData = { ...storedData, ...serverData };

            // Remplissage du formulaire
            for (const key in userData) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = sanitizeInput(userData[key]) || '';
            }

            if (profileImage && userData.profilePhotoUrl) {
                profileImage.src = userData.profilePhotoUrl.startsWith("http")
                    ? userData.profilePhotoUrl
                    : `http://localhost:8081${userData.profilePhotoUrl}`;
            }

            sessionStorage.setItem(storageKey, JSON.stringify(userData));

            // Étape 3 : notifier l’UI avec les données fraîches
            window.dispatchEvent(new CustomEvent("profileDataReady", { detail: userData }));

        } catch (err) {
            console.error("Erreur fetch :", err);
        }
    }

    loadUserData();

    // Soumission du formulaire
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (typeof value === "string") formData.set(key, sanitizeInput(value));
        }

        try {
            const res = await fetch(`http://localhost:8081/api/user/${userId}`, {
                method: "POST",
                body: formData
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                return safeAlert(result.message || `Erreur serveur : ${res.status}`);
            }

            safeAlert("Profil mis à jour !");
            const profileImage = document.getElementById("profileImage");
            const updatedData = JSON.parse(sessionStorage.getItem(storageKey)) || {};

            // Mise à jour des données locales et du formulaire
            for (const key in result.user) {
                updatedData[key] = result.user[key];
                const input = form.querySelector(`[name="${key}"]`);
                if (input && typeof result.user[key] === "string") {
                    input.value = sanitizeInput(result.user[key]);
                }
            }

            if (profileImage && result.user.profilePhotoUrl) {
                profileImage.src = result.user.profilePhotoUrl.startsWith("http")
                    ? result.user.profilePhotoUrl
                    : `http://localhost:8081${result.user.profilePhotoUrl}`;
                updatedData.profilePhotoUrl = result.user.profilePhotoUrl;
            }

            sessionStorage.setItem(storageKey, JSON.stringify(updatedData));

            // Déclenchement de l'événement pour mettre à jour l'UI immédiatement
            window.dispatchEvent(new CustomEvent("profileDataReady", { detail: updatedData }));

        } catch (err) {
            console.error("Erreur fetch :", err);
            safeAlert("Erreur réseau ou serveur : " + err.message);
        }
    });

    // Écoute pour cacher l'alerte si profil complet
    window.addEventListener('profileDataReady', (e) => {
        const userData = e.detail;
        if (profileAlert) {
            profileAlert.style.display = isProfileComplete(userData) ? 'none' : 'block';
        }
    });
}
