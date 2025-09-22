import { getUserId, authFetch } from './signIn.js';

export async function initTripDetails() {
    const params = new URLSearchParams(window.location.search);
    const tripId = params.get('id');
    if (!tripId) return;

    const loggedUserId = getUserId();
    if (!loggedUserId) {
        alert('Vous devez être connecté pour voir les détails du trajet.');
        return;
    }

    // Mettre à jour crédits localement 
    function updateCredits(amount) {
        const storageKey = `userProfile_${loggedUserId}`;
        const currentData = JSON.parse(sessionStorage.getItem(storageKey)) || {};
        currentData.credits = (currentData.credits || 0) + amount;
        sessionStorage.setItem(storageKey, JSON.stringify(currentData));
        window.currentUserCredits = currentData.credits;
        window.dispatchEvent(new CustomEvent("profileDataReady", { detail: currentData }));
    }

    try {
        const res = await authFetch(`http://localhost:8081/api/trip/${tripId}`, {}, true);
        if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`);

        const result = await res.json();
        if (!result.success) {
            alert('Impossible de charger ce trajet.');
            return;
        }

        const trip = result.trip;

        //  Injection automatique pour TripReview 
        document.body.dataset.tripId = trip.id;

        // Affichage des informations du trajet
        const setText = (selector, value) => {
            const el = document.querySelector(selector);
            if (el) el.textContent = value ?? '';
        };

        setText('#trip-departure', trip.departure_address);
        setText('#trip-arrival', trip.arrival_address);
        setText('#trip-date', trip.departure_date);
        setText('#trip-time', `${trip.departure_time || '00:00'} - ${trip.arrival_time || '00:00'}`);
        setText('#trip-price', `${trip.price || 0} crédits`);
        setText('#trip-seats', trip.available_seats ?? 0);
        setText('#trip-driver', trip.driver_name ?? 'Inconnu');
        setText('#trip-eco', trip.eco_friendly ? 'Oui ♻️' : 'Non 🚗');
        setText('#trip-vehicle', trip.vehicle ?? 'Non renseigné');

        //  Liste des passagers 
        const passengersList = document.querySelector('#trip-passengers');
        function renderPassengers(passengers) {
            if (!passengersList) return;
            passengersList.innerHTML = '';
            (passengers || []).forEach(p => {
                const li = document.createElement('li');
                li.className = 'list-group-item eco-box';
                li.textContent = `${p.name} (${p.email})`;
                passengersList.appendChild(li);
            });
        }
        renderPassengers(trip.passengers);

        //  Masquer authBox 
        const authBox = document.querySelector('#auth-box');
        if (authBox) authBox.style.display = 'none';

        //  Vérifier si trajet passé 
        const depDateTime = new Date(`${trip.departure_date}T${trip.departure_time || '00:00'}`);
        const now = new Date();
        if (depDateTime < now) {
            const pastMsg = document.createElement('div');
            pastMsg.className = 'alert text-center mt-3';
            pastMsg.textContent = '⚠️ Ce trajet est terminé.';
            document.querySelector('.container.my-5').appendChild(pastMsg);
            return;
        }

        //  Actions utilisateur
        const isPassenger = trip.passengers?.some(p => p.id === loggedUserId);
        const actionContainer = document.createElement('div');
        actionContainer.className = 'text-center mt-4';
        document.querySelector('.container.my-5').appendChild(actionContainer);

        const tripPrice = trip.price || 0;

        //  Réserver
        if (trip.user_id !== loggedUserId && !isPassenger) {
            const reserveBtn = document.createElement('button');
            reserveBtn.className = 'btn custom-btn';
            reserveBtn.textContent = 'Réserver ce trajet';
            reserveBtn.addEventListener('click', async () => {
                const storageKey = `userProfile_${loggedUserId}`;
                const currentData = JSON.parse(sessionStorage.getItem(storageKey)) || {};

                if ((currentData.credits || 0) < tripPrice) {
                    alert("Vous n'avez pas assez de crédits pour réserver ce trajet.");
                    return;
                }

                try {
                    const res = await authFetch(
                        `http://localhost:8081/api/trip/reservation/${trip.id}`,
                        { method: 'POST' },
                        true
                    );
                    const resData = await res.json();

                    if (resData.success) {
                        alert('Trajet réservé avec succès ! ✅');

                        const newPassenger = { id: loggedUserId, name: resData.userName || 'Vous', email: resData.userEmail || '' };
                        trip.passengers.push(newPassenger);
                        renderPassengers(trip.passengers);

                        updateCredits(-tripPrice);
                        setTimeout(() => window.location.href = 'myTrips.html', 300);
                    } else {
                        alert('Erreur réservation : ' + resData.message);
                    }
                } catch (err) {
                    console.error('Erreur réservation :', err);
                    alert('Impossible de réserver ce trajet.');
                }
            });
            actionContainer.appendChild(reserveBtn);
        }

        // Annuler
        if (isPassenger) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-danger mt-3';
            cancelBtn.textContent = 'Annuler ma réservation';
            cancelBtn.addEventListener('click', async () => {
                if (!confirm('Voulez-vous vraiment annuler votre réservation ?')) return;
                try {
                    const res = await authFetch(
                        `http://localhost:8081/api/trip/reservation/cancel/${trip.id}`,
                        { method: 'POST' },
                        true
                    );
                    const resData = await res.json();

                    if (resData.success) {
                        alert('Réservation annulée avec succès !');
                        trip.passengers = trip.passengers.filter(p => p.id !== loggedUserId);
                        renderPassengers(trip.passengers);
                        updateCredits(tripPrice);
                        setTimeout(() => window.location.href = 'myTrips.html', 300);
                    } else {
                        alert('Erreur : ' + resData.message);
                    }
                } catch (err) {
                    console.error('Erreur annulation :', err);
                    alert('Impossible d’annuler la réservation.');
                }
            });
            actionContainer.appendChild(cancelBtn);
        }

        // Supprimer si conducteur
        if (trip.user_id === loggedUserId) {
            const deleteContainer = document.querySelector('#delete-trip-container');
            if (deleteContainer) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-danger mt-3';
                deleteBtn.textContent = 'Supprimer le trajet';
                deleteBtn.addEventListener('click', async () => {
                    if (!confirm('Voulez-vous vraiment supprimer ce trajet ?')) return;
                    try {
                        const delResp = await authFetch(
                            `http://localhost:8081/api/trip/delete/${trip.id}`,
                            { method: 'DELETE' },
                            true
                        );
                        const delResult = await delResp.json();
                        if (delResult.success) {
                            alert('Trajet supprimé avec succès.');
                            updateCredits(tripPrice);
                            window.location.href = 'myTrips.html';
                        } else {
                            alert('Erreur : ' + delResult.message);
                        }
                    } catch (err) {
                        console.error('Erreur suppression trajet:', err);
                        alert('Impossible de supprimer le trajet.');
                    }
                });
                deleteContainer.appendChild(deleteBtn);
            }
        }

    } catch (err) {
        console.error('Erreur fetch ou parsing JSON :', err);
        alert('Impossible de charger le trajet.');
    }
}
