import { authFetch } from './signIn.js';

export async function initTripReview() {
    const reviewsContainer = document.getElementById("trip-reviews");
    const reviewForm = document.getElementById("trip-review-form");

    if (!reviewsContainer) return;

    const tripId = document.body.dataset.tripId;
    if (!tripId) return console.error("Impossible de récupérer tripId depuis body[data-trip-id]");

    let driverId = null;
    let passengerIds = [];
    let tripDateTime = null;

    // Récupérer les détails du trajet
    try {
        const tripRes = await authFetch(`http://localhost:8081/api/trip/${tripId}`, { method: 'GET' }, true);
        if (!tripRes.ok) throw new Error(`Erreur HTTP : ${tripRes.status}`);
        const tripJson = await tripRes.json();
        if (!tripJson.trip) throw new Error("Trip data manquante");

        driverId = tripJson.trip.user_id?.toString() || null;
        passengerIds = Array.isArray(tripJson.trip.passengers)
            ? tripJson.trip.passengers.map(p => p.id?.toString()).filter(Boolean)
            : [];

        const depDate = tripJson.trip.departure_date;
        const depTime = tripJson.trip.departure_time || '00:00';
        if (depDate) tripDateTime = new Date(`${depDate}T${depTime}`);
    } catch (err) {
        console.error("Impossible de récupérer le trajet :", err);
    }

    const currentUserId = window.currentUserId?.toString();
    const isDriver = currentUserId && driverId && currentUserId === driverId;
    const isPassenger = currentUserId && passengerIds.includes(currentUserId);
    const hasTripPassed = tripDateTime && new Date() > tripDateTime;

    // Charger et afficher les avis 
    async function loadReviews() {
        try {
            const res = await authFetch(`http://localhost:8081/api/trip/${tripId}/reviews`, { method: 'GET' }, true);
            if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
            const json = await res.json();

            const reviews = Array.isArray(json.reviews) ? json.reviews : [];
            reviewsContainer.innerHTML = reviews.length
                ? reviews.map(r => `
                    <li class="list-group-item eco-box">
                        <strong>${r.userPseudo || 'Utilisateur ' + r.userId}</strong><br>
                        ${r.comment}<br>
                        ⭐ ${r.rating || 0}/5<br>
                        <small>${r.createdAt || ''}</small>
                    </li>
                `).join("")
                : `<li class="list-group-item">Aucun avis disponible.</li>`;

            //  Vérifier si l'utilisateur a déjà laissé un avis
            if (reviewForm && currentUserId) {
                const alreadyReviewed = reviews.some(r => r.userId === currentUserId);
                if (alreadyReviewed) reviewForm.style.display = 'none';
            }

        } catch (err) {
            console.error("Erreur lors du chargement des avis :", err);
            reviewsContainer.innerHTML = `<li class="list-group-item text-danger">Erreur de chargement des avis.</li>`;
        }
    }

    // Gestion du formulaire
    if (reviewForm) {
        reviewForm.style.display = 'none';
        if (!isDriver && isPassenger && hasTripPassed) {
            reviewForm.style.display = 'block';

            reviewForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                const comment = document.getElementById("review-comment").value.trim();
                const rating = parseInt(document.getElementById("review-rating").value, 10);

                if (!comment || !rating || rating < 1 || rating > 5) {
                    alert("Veuillez saisir un commentaire et une note valide (1-5).");
                    return;
                }

                try {
                    const res = await authFetch(`http://localhost:8081/api/trip/${tripId}/reviews`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: currentUserId, comment, rating })
                    }, true);

                    const json = await res.json().catch(() => ({}));

                    if (json.success) {
                        // Masquer le formulaire définitivement après ajout
                        reviewForm.style.display = 'none';
                        reviewForm.querySelector("button[type='submit']").disabled = true;
                        await loadReviews();
                    } else {
                        alert("Erreur : " + (json.message || "Impossible d'ajouter l'avis."));
                    }
                } catch (err) {
                    console.error("Erreur lors de l'ajout de l'avis :", err);
                    alert("Une erreur est survenue lors de l'ajout de l'avis.");
                }
            });
        }
    }

    // Charger les avis au démarrage
    await loadReviews();
}
