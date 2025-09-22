import { getToken, isTokenExpired, getMe } from './signIn.js';

export async function initProfil() {
    const form = document.getElementById('updateProfileForm');
    if (!form) return console.error("Formulaire #updateProfileForm non trouvé");

    const profileAlert = document.querySelector('.col-md-8 h5.text-danger');

    // Vérification token et récupération utilisateur
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        console.error("Utilisateur non connecté !");
        if (profileAlert) profileAlert.style.display = 'block';
        return;
    }

    let response;
    try {
        response = await getMe();
    } catch (err) {
        console.error("Erreur getMe() :", err);
        return;
    }

    if (!response || !response.success || !response.user) {
        console.error("Aucun utilisateur connecté !");
        if (profileAlert) profileAlert.style.display = 'block';
        return;
    }

    const user = response.user;
    const userId = user.id;
    const storageKey = `userProfile_${userId}`;

    // Stocker pour initProfilUI
    window.currentUser = user;
    window.currentUserId = userId;
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    function sanitizeInput(input) {
        if (typeof input !== "string") return input;
        return input.replace(/[<>]/g, "");
    }

    function safeAlert(msg) {
        alert(Array.isArray(msg) ? msg.join('\n') : msg);
    }

    function isProfileComplete(userData) {
        const requiredFields = ['email', 'username', 'firstName', 'lastName', 'birthDate', 'postalAddress', 'phone'];
        return requiredFields.every(f => userData[f] && userData[f].trim() !== '');
    }

    async function loadUserData() {
        try {
            const storedData = JSON.parse(sessionStorage.getItem(storageKey)) || {};
            const profileImage = document.getElementById("profileImage");

            if (Object.keys(storedData).length > 0)
                window.dispatchEvent(new CustomEvent("profileDataReady", { detail: storedData }));

            const res = await fetch(`http://localhost:8080/api/user/${userId}`);
            const result = await res.json();

            if (!res.ok || !result.success) return console.error("Impossible de récupérer les données serveur");

            const userData = { ...storedData, ...result.user };

            for (const key in userData) {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = sanitizeInput(userData[key]) || '';
            }

            if (profileImage && userData.profilePhotoUrl) {
                profileImage.src = userData.profilePhotoUrl.startsWith("http")
                    ? userData.profilePhotoUrl
                    : `http://localhost:8080${userData.profilePhotoUrl}`;
            }

            sessionStorage.setItem(storageKey, JSON.stringify(userData));
            window.dispatchEvent(new CustomEvent("profileDataReady", { detail: userData }));

        } catch (err) {
            console.error("Erreur fetch :", err);
        }
    }

    await loadUserData();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        for (let [k, v] of formData.entries()) if (typeof v === "string") formData.set(k, sanitizeInput(v));

        try {
            const res = await fetch(`http://localhost:8080/api/user/${userId}`, { method: "POST", body: formData });
            const result = await res.json();

            if (!res.ok || !result.success) return safeAlert(result.message || `Erreur serveur : ${res.status}`);

            safeAlert("Profil mis à jour !");
            const profileImage = document.getElementById("profileImage");
            const updatedData = JSON.parse(sessionStorage.getItem(storageKey)) || {};

            for (const key in result.user) {
                updatedData[key] = result.user[key];
                const input = form.querySelector(`[name="${key}"]`);
                if (input && typeof result.user[key] === "string") input.value = sanitizeInput(result.user[key]);
            }

            if (profileImage && result.user.profilePhotoUrl) {
                profileImage.src = result.user.profilePhotoUrl.startsWith("http")
                    ? result.user.profilePhotoUrl
                    : `http://localhost:8080${result.user.profilePhotoUrl}`;
                updatedData.profilePhotoUrl = result.user.profilePhotoUrl;
            }

            sessionStorage.setItem(storageKey, JSON.stringify(updatedData));
            window.dispatchEvent(new CustomEvent("profileDataReady", { detail: updatedData }));

        } catch (err) {
            console.error("Erreur fetch :", err);
            safeAlert("Erreur réseau ou serveur : " + err.message);
        }
    });

    window.addEventListener('profileDataReady', (e) => {
        if (!profileAlert) return;
        const userData = e.detail;
        profileAlert.style.display = isProfileComplete(userData) ? 'none' : 'block';
    });
}
