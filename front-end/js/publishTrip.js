import { authFetch } from './signIn.js';

// Récupérer et remplir la liste des voitures de l'utilisateur
async function populateUserCars() {
    const select = document.getElementById('vehicule_id');
    if (!select) return;

    try {
        const resp = await authFetch('http://localhost:8081/api/car/list', { method: 'GET' });
        const text = await resp.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch {
            console.error("[PublishTrip] Réponse non JSON (voitures):", text);
            return;
        }

        if (resp.ok && data.success && Array.isArray(data.cars)) {
            select.innerHTML = '<option value="">-- Sélectionner --</option>';
            data.cars.forEach(car => {
                const opt = document.createElement('option');
                opt.value = car.id;
                opt.textContent = `${car.brand} ${car.model} (${car.license_plate})`;
                select.appendChild(opt);
            });
        }
    } catch (err) {
        console.error("[PublishTrip] Erreur récupération voitures :", err);
    }
}

// Mise à jour des crédits locaux et UI
function updateCredits(amount) {
    const userId = window.currentUserId;
    const storageKey = `userProfile_${userId}`;
    const currentData = JSON.parse(sessionStorage.getItem(storageKey)) || {};
    currentData.credits = (currentData.credits || 0) + amount;
    sessionStorage.setItem(storageKey, JSON.stringify(currentData));
    window.dispatchEvent(new CustomEvent("profileDataReady", { detail: currentData }));
}

// Formulaire de publication de trajet
function setupPublishTripForm() {
    const form = document.getElementById('publish_trip');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const storageKey = `userProfile_${window.currentUserId}`;
        const currentData = JSON.parse(sessionStorage.getItem(storageKey)) || {};
        const userCredits = currentData.credits || 0;

        // Vérifier crédits
        if (userCredits < 2) {
            alert("Vous n'avez pas assez de crédits pour publier ce trajet.");
            return;
        }

        const payload = {
            car_id: parseInt(formData.get('vehicule_id'), 10),
            departure_address: formData.get('adresse_depart'),
            arrival_address: formData.get('adresse_arrivee'),
            departure_date: formData.get('date_depart'),
            departure_time: formData.get('heure_depart'),
            arrival_time: formData.get('heure_arrivee'),
            available_seats: parseInt(formData.get('places_disponibles'), 10),
            eco_friendly: formData.get('voyage_ecologique') === '1',
            price: parseInt(formData.get('prix'), 10),
            status: 'open'
        };

        try {
            const resp = await authFetch('http://localhost:8081/api/trip/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const text = await resp.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch {
                console.error("[PublishTrip] Réponse non JSON (publication):", text);
                alert("Le serveur n'a pas renvoyé un JSON valide. Regarde la console.");
                return;
            }

            if (!resp.ok || !result.success) {
                alert('Erreur publication : ' + (result.message || JSON.stringify(result)));
                return;
            }

            // Déduire 2 crédits localement
            updateCredits(-2);

            alert('Trajet publié avec succès ! 2 crédits ont été déduits ✅');
            window.location.href = '/pages/myTrips.html';

        } catch (err) {
            console.error("[PublishTrip] Erreur publication trajet :", err);
            alert('Erreur réseau ou serveur');
        }
    });
}

// Bouton suppression trajet
function setupDeleteTripButton(tripId) {
    const deleteContainer = document.querySelector('#delete-trip-container');
    if (!deleteContainer) return;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger mt-3';
    deleteBtn.textContent = 'Supprimer le trajet';

    deleteBtn.addEventListener('click', async () => {
        if (!confirm('Voulez-vous vraiment supprimer ce trajet ?')) return;

        try {
            const delResp = await authFetch(`http://localhost:8081/api/trip/delete/${tripId}`, { method: 'DELETE' });
            const text = await delResp.text();
            let delResult;

            try {
                delResult = JSON.parse(text);
            } catch {
                console.error("[PublishTrip] Réponse non JSON (suppression):", text);
                alert("Le serveur n'a pas renvoyé un JSON valide. Regarde la console.");
                return;
            }

            if (delResult.success) {
                alert('Trajet supprimé avec succès.');
                // Restaurer les crédits du chauffeur
                updateCredits(2);

                // Redirection
                window.location.href = '/pages/myTrips.html';
            } else {
                alert('Erreur lors de la suppression : ' + delResult.message);
            }
        } catch (err) {
            console.error("[PublishTrip] Erreur suppression trajet:", err);
            alert('Impossible de supprimer le trajet.');
        }
    });

    deleteContainer.appendChild(deleteBtn);
}

// Initialisation
export async function initPublishTrip(tripId = null) {
    await populateUserCars();
    setupPublishTripForm();
    if (tripId) setupDeleteTripButton(tripId);
}
