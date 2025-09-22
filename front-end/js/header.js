import { getMe, logout, getToken, isTokenExpired } from './signIn.js';

export async function initHeader() {
    console.log("=== initHeader démarré ===");

    // Récupération du token
    const token = getToken();
    console.log("Token récupéré :", token);

    if (!token) {
        console.log("Aucun token trouvé → utilisateur non connecté");
        return;
    }

    if (isTokenExpired(token)) {
        console.log("Token expiré → utilisateur non connecté");
        return;
    }

    // Récupération des infos utilisateur
    let user;
    try {
        user = await getMe();
    } catch (err) {
        console.error("Erreur getMe() :", err);
        return;
    }
    console.log("Utilisateur récupéré via getMe() :", user);

    if (!user) {
        console.log("Aucun utilisateur trouvé, abandon initHeader");
        return;
    }

    // Récupération des éléments du header
    const userGreeting = document.getElementById('user-greeting');
    const authButtonsContainer = document.getElementById('auth-buttons');

    console.log("userGreeting trouvé ?", !!userGreeting);
    console.log("authButtonsContainer trouvé ?", !!authButtonsContainer);

    if (!userGreeting || !authButtonsContainer) {
        console.log("Header incomplet, abandon initHeader");
        return;
    }

    // Masquer les boutons connexion/inscription
    authButtonsContainer.style.display = 'none';
    console.log("Boutons connexion/inscription masqués");

    // Injecter pseudo + dropdown profil avec image
    userGreeting.innerHTML = `
        <div class="dropdown d-inline-block user-dropdown">
            <span>Bonjour, ${user.pseudo}</span>
            <button class="btn btn-sm dropdown-toggle" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false" style="margin-left:5px; padding: 0; border: none; background: transparent;">
                <img src="/assets/icone-utilisateur.png" alt="Profil" width="24" height="24" style="border-radius:50%;">
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                <li><a class="dropdown-item" href="/pages/profil.html">Profil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item" id="logoutBtn">Déconnexion</button></li>
            </ul>
        </div>
    `;

    console.log("UserGreeting injecté avec pseudo :", user.pseudo);

    // Déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => logout());
        console.log("Bouton logout branché");
    }

    console.log("=== initHeader terminé ===");
}
