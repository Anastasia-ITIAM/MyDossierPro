const TOKEN_KEY = 'jwt';
const USERID_KEY = 'userId';
let isLoggingOut = false;
const isDev = window.location.hostname === 'localhost';

// ----------------------
// Utilitaires sécurité
// ----------------------
function sanitizeInput(input) {
    return input.replace(/[<>]/g, "");
}

function safeAlert(message) {
    const div = document.createElement('div');
    div.textContent = Array.isArray(message) ? message.join('\n') : message;
    alert(div.textContent);
}

// ----------------------
// Gestion du token JWT
// ----------------------
export function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function removeToken() { localStorage.removeItem(TOKEN_KEY); }

export function setUserId(userId) { localStorage.setItem(USERID_KEY, userId); }
export function getUserId() { return parseInt(localStorage.getItem(USERID_KEY), 10) || 0; }

export function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch (err) {
        if (isDev) console.error('Erreur décodage token :', err);
        return true;
    }
}

export function logout(redirect = true) {
    if (isLoggingOut) return;
    isLoggingOut = true;

    removeToken();
    localStorage.removeItem(USERID_KEY);

    if (redirect) {
        window.location.replace('/pages/signIn.html');
    }
}

// ----------------------
// Fetch protégé avec JWT
// ----------------------
export async function authFetch(url, options = {}, forceAuth = true) {
    const token = getToken();

    if (forceAuth && (!token || isTokenExpired(token))) {
        if (isDev) console.warn("Token expiré ou absent");
        throw new Error('Token expiré ou non présent');
    }

    options.headers = options.headers || {};
    if (token && forceAuth) options.headers['Authorization'] = `Bearer ${token}`;
    options.headers['Content-Type'] = 'application/json';

    const res = await fetch(url, options);

    if (res.status === 401 && forceAuth) {
        if (isDev) console.warn("Token invalide ou expiré");
        throw new Error('Token invalide ou expiré');
    }

    return res;
}

// ----------------------
// Connexion utilisateur sécurisée
// ----------------------
export async function login(email, password) {
    try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: sanitizeInput(email), password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            // Stocke le token (jamais affiché)
            setToken(data.token);
            if (isDev) console.log('Token stocké avec succès (contenu caché)');

            // Décodage JWT pour récupérer l'ID utilisateur
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                if (payload.id) {
                    setUserId(payload.id);
                    if (isDev) console.log('User ID stocké :', payload.id);
                }
            } catch (err) {
                if (isDev) console.error('Erreur décodage JWT pour id :', err);
            }

            return { status: 'ok' };
        }

        return { status: 'error', message: 'Email ou mot de passe incorrect. Veuillez réessayer.' };
    } catch (err) {
        if (isDev) console.error('Erreur fetch login :', err);
        return { status: 'error', message: 'Erreur réseau ou serveur' };
    }
}

// ----------------------
// Initialisation formulaire login
// ----------------------
export function initSignIn() {
    const form = document.getElementById('signInForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = sanitizeInput(form.email.value.trim());
        const password = form.password.value;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return safeAlert('Email invalide');
        if (password.length < 8) return safeAlert('Mot de passe invalide (8 caractères minimum)');

        try {
            const result = await login(email, password);
            if (result.status === 'ok') {
                safeAlert('Connexion réussie ! 🎉');
                // Redirection vers le profil
                window.location.replace('/pages/profil.html');
            } else {
                safeAlert(result.message);
            }
        } catch (err) {
            if (isDev) console.error('Erreur fetch submit :', err);
            safeAlert('Erreur réseau ou serveur');
        }
    });
}

// ----------------------
// Récupération infos utilisateur
// ----------------------
export async function getMe(forceAuth = true) {
    try {
        const res = await authFetch('http://localhost:8080/api/auth/me', {}, forceAuth);
        const data = await res.json();
        if (data && data.id) setUserId(data.id);
        return data;
    } catch (err) {
        if (isDev) console.warn("Impossible de récupérer l'utilisateur :", err.message);
        return null;
    }
}
