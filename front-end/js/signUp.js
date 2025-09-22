import { login } from './signIn.js';

// Utilitaires sécurité
function sanitizeInput(input) {
    return input.replace(/[<>]/g, "");
}

function safeAlert(message) {
    const div = document.createElement('div');
    div.textContent = Array.isArray(message) ? message.join('\n') : message;
    alert(div.textContent);
}

export function initSignUp() {

    // Validation front
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePseudo(pseudo) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(pseudo);
    }

    function validatePassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    }

    const form = document.getElementById('signUpForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = sanitizeInput(form.email.value.trim());
        const pseudo = sanitizeInput(form.pseudo.value.trim());
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const conditionsChecked = form.conditions.checked;

        if (!validateEmail(email)) return safeAlert('Email invalide');
        if (!validatePseudo(pseudo)) return safeAlert('Pseudo invalide (3-20 caractères)');
        if (!validatePassword(password)) return safeAlert('Mot de passe invalide. Il doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.');
        if (password !== confirmPassword) return safeAlert('Les mots de passe ne correspondent pas');
        if (!conditionsChecked) return safeAlert('Vous devez accepter les conditions d’utilisation');

        const data = { email, pseudo, password };

        try {
            console.log("📤 Data envoyée au backend :", data);

            const response = await fetch('http://localhost:8081/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            // Sécurisation : lire d'abord en texte
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch {
                console.error('Backend a renvoyé autre chose que du JSON :', text);
                return safeAlert('Erreur serveur inattendue');
            }

            if (response.ok && result.success) {
                const loginResult = await login(email, password);

                if (loginResult.status === 'ok') {
                safeAlert('Inscription et connexion réussies ! 🎉\nFélicitations, vous avez gagné 20 crédits pour votre inscription !');
                    window.location.href = '/pages/profil.html';
                } else {
                    safeAlert('Inscription réussie, mais impossible de se connecter automatiquement. Veuillez vous connecter.');
                    window.location.href = '/pages/signIn.html';
                }
            } else {
                safeAlert(result.message || 'Erreur serveur');
            }
        } catch (err) {
            console.error('Erreur fetch :', err);
            safeAlert('Erreur réseau');
        }
    });
}
