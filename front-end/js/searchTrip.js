export async function initSearchTrip() {

    const params = new URLSearchParams(window.location.search);
    const depart = params.get('depart')?.trim();
    const arrivee = params.get('arrivee')?.trim();
    const datetime = params.get('datetime')?.trim();

    const resultsContainer = document.querySelector('#resultsContainer');
    if (!resultsContainer) return;

    const departInput = document.querySelector('#depart');
    const arriveeInput = document.querySelector('#arrivee');
    const datetimeInput = document.querySelector('#datetime');

    // Préremplir les champs de recherche
    if (departInput) departInput.value = depart || '';
    if (arriveeInput) arriveeInput.value = arrivee || '';
    if (datetimeInput) datetimeInput.value = datetime || '';

    try {
        let url;

        // Construire l'URL de l'API selon les filtres
        if (depart || arrivee || datetime) {
            const queryParams = {};
            if (depart) queryParams.depart = depart;
            if (arrivee) queryParams.arrivee = arrivee;
            if (datetime) queryParams.datetime = datetime;
            url = `http://localhost:8081/api/trip/search?${new URLSearchParams(queryParams).toString()}`;
        } else {
            url = 'http://localhost:8081/api/trip/all';
        }

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Erreur serveur : ${resp.status}`);

        const result = await resp.json();

        if (!result.success || !Array.isArray(result.trips) || result.trips.length === 0) {
            resultsContainer.innerHTML = '<p class="text-center text-danger">Aucun trajet trouvé.</p>';
            return;
        }

        // Vérifier si un trajet correspond exactement à tous les critères
        let exactMatch = false;
        if (depart && arrivee && datetime) {
            exactMatch = result.trips.some(trip =>
                trip.departure_address.toLowerCase() === depart.toLowerCase() &&
                trip.arrival_address.toLowerCase() === arrivee.toLowerCase() &&
                trip.departure_date === datetime
            );
        }

        // Alerte si pas de match exact mais trajets similaires
        if (!exactMatch && (depart || arrivee || datetime)) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-warning text-center';
            alertDiv.innerHTML = `
                Aucun trajet correspondant exactement à votre recherche.<br>
                Voici des trajets proposés qui correspondent partiellement à vos critères.
            `;
            resultsContainer.appendChild(alertDiv);
        }

        // Mélanger les trajets et ne garder que 3
        const trips = result.trips.sort(() => Math.random() - 0.5).slice(0, 3);

        trips.forEach(trip => {
            let photoUrl = trip.driver_photo_url || '/uploads/profiles/profile_default.png';
            if (!photoUrl.startsWith('/')) photoUrl = '/' + photoUrl;

            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            card.innerHTML = `
                <div class="card h-100" style="background-color: #e8f5e9;">
                    <div class="card-body">
                        <div style="display: flex; align-items: center; gap: 15px; margin: 15px 0;">
                            <img src="http://localhost:8081${photoUrl}" 
                                 alt="Conducteur" 
                                 style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;"
                                 onerror="this.onerror=null; this.src='/uploads/profiles/profile_default.png';">
                            <div>
                                <strong>${trip.departure_address || 'N/A'}</strong> → <strong>${trip.arrival_address || 'N/A'}</strong><br>
                                <u>Conducteur·rice</u> : ${trip.driver_name || 'Inconnu'}<br>
                                <u>Places restantes</u> : ${trip.available_seats ?? 0}<br>
                                <u>Prix</u> : ${trip.price ?? 0} crédits<br>
                                <u>Départ</u> : ${trip.departure_date || ''} à ${trip.departure_time || ''}<br>
                                <u>Arrivée prévue</u> : ${trip.arrival_time || ''}<br>
                                ${trip.eco_friendly ? '<span class="eco-label">🌱 EcoRide</span>' : ''}
                            </div>
                        </div>
                        <div class="text-center">
                            <a class="btn custom-btn btn-sm mt-2" href="details.html?id=${trip.id}">Voir détails</a>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });

    } catch (err) {
        console.error('Erreur recherche trajets:', err);
        resultsContainer.innerHTML = '<p class="text-center text-danger">Impossible de charger les trajets.</p>';
    }
}
