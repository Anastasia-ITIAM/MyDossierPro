import { authFetch } from './signIn.js';

export async function initMyTrips() {
    const avenirTab = document.querySelector('#avenir .row');
    const passesTab = document.querySelector('#passes .row');

    if (!avenirTab || !passesTab) return;

    try {
        // URL pour lister les trajets réservés
        const resp = await authFetch('http://localhost:8081/api/trip/reservation/list');
        const result = await resp.json();

        if (!result.success) {
            console.error('Erreur récupération trajets:', result.message);
            return;
        }

        const now = new Date();

        // Vider les onglets
        avenirTab.innerHTML = '';
        passesTab.innerHTML = '';
        
        const myTrips = result.trips;

        myTrips.forEach(trip => {
            const depDateTime = new Date(`${trip.departure_date}T${trip.departure_time || '00:00'}`);
            const isPast = depDateTime < now;
            const isDriver = trip.user_id === window.currentUserId;

            // Créer la carte
            const cardDiv = document.createElement('div');
            cardDiv.className = 'col-md-4 mb-4';
            cardDiv.innerHTML = `
                <div class="card eco-box shadow-sm p-3 h-100">
                    <h5 class="card-title">Trajet vers ${trip.arrival_address}</h5>
                    <p class="card-text">
                        <strong>Départ :</strong> ${trip.departure_address}<br>
                        <strong>Arrivée :</strong> ${trip.arrival_address}<br>
                        <strong>Date :</strong> ${trip.departure_date} à ${trip.departure_time}<br>
                        <strong>Places :</strong> ${trip.available_seats}<br>
                        <strong>Prix :</strong> ${trip.price} crédits<br>
                        <strong style="color:red;">Rôle :</strong> ${isDriver ? 'Chauffeur' : 'Passager'}
                        ${trip.eco_friendly ? '<div class="eco-label text-center">🌱 EcoRide</div>' : ''}
                    </p>
                    <div class="text-center mt-auto">
                        <a href="details.html?id=${trip.id}" class="btn custom-btn">Voir les détails</a>
                    </div>
                </div>
            `;

            // Classer dans les onglets
            if (isPast) {
                passesTab.appendChild(cardDiv);
            } else {
                avenirTab.appendChild(cardDiv);
            }
        });

    } catch (err) {
        console.error('Erreur fetch trajets:', err);
    }
}
