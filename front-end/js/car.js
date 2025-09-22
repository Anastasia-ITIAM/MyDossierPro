console.log("initCar chargé !");
import { authFetch } from './signIn.js';

/* Utils */
const deepGet = (obj, path) => path?.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
const coalesce = (obj, ...keys) => keys.map(k => deepGet(obj, k)).find(v => v !== undefined && v !== null && v !== '') ?? '';
const toYMD = value => {
    if (!value) return '';
    if (value instanceof Date && !isNaN(value)) return value.toISOString().split('T')[0];
    if (typeof value === 'string') return new Date(value).toISOString().split('T')[0];
    return '';
};

/* API */
export const fetchMyCars = async () => {
    try {
        const resp = await authFetch('http://localhost:8081/api/car/list', { method: 'GET' });
        const data = await resp.json();
        return resp.ok && data.success ? (Array.isArray(data.cars) ? data.cars : [data.cars]) : [];
    } catch (err) { console.error(err); return []; }
};

/* Création éléments */
const createInput = ({ type='text', name, value='', min, required=false, classes='form-control' }) => {
    const input = document.createElement('input');
    Object.assign(input, { type, name, value, className: classes });
    if (min !== undefined) input.min = min;
    if (required) input.required = true;
    return input;
};

const createTextarea = ({ name, value='', rows=3, classes='form-control', id }) => {
    const ta = document.createElement('textarea');
    Object.assign(ta, { name, value, rows, className: classes, id });
    return ta;
};

const createLabel = (text, htmlFor) => {
    const label = document.createElement('label');
    label.textContent = text;
    if (htmlFor) label.htmlFor = htmlFor;
    return label;
};

const createButton = (text, onClick, classes='btn btn-danger') => {
    const btn = document.createElement('button');
    Object.assign(btn, { type: 'button', textContent: text, className: classes });
    btn.addEventListener('click', onClick);
    return btn;
};

/* Normalisation voiture */
const normalizeCar = car => ({
    id: car.id,
    license_plate: coalesce(car, 'license_plate', 'licensePlate'),
    registration_date: toYMD(coalesce(car, 'registration_date', 'registrationDate')),
    brand: coalesce(car, 'brand'),
    model: coalesce(car, 'model'),
    color: coalesce(car, 'color'),
    fuel_type: coalesce(car, 'fuel_type'),
    available_seats: Number(coalesce(car, 'available_seats')) || 0,
    custom_preferences: coalesce(car, 'custom_preferences')
});

/* Rendu voiture */
export async function renderCars(cars) {
    const carsList = document.getElementById('cars-list');
    if (!carsList) return;
    carsList.innerHTML = '';

    if (!cars.length) {
        const empty = document.createElement('div');
        empty.className = 'text-muted';
        empty.textContent = 'Aucun véhicule enregistré.';
        return carsList.appendChild(empty);
    }

    for (let car of cars.map(normalizeCar)) {
        const form = document.createElement('form');
        form.className = 'card p-3 shadow-sm eco-box mb-4';
        form.dataset.carId = car.id;

        // row 1: Plaque + Date
        const row1 = document.createElement('div'); row1.className = 'row';
        const colPlate = document.createElement('div'); colPlate.className = 'col-md-6 mb-2';
        colPlate.appendChild(createLabel('Plaque *'));
        colPlate.appendChild(createInput({ type:'text', name:'license_plate', value:car.license_plate }));
        const colDate = document.createElement('div'); colDate.className = 'col-md-6 mb-2';
        colDate.appendChild(createLabel('Date immatriculation *'));
        colDate.appendChild(createInput({ type:'date', name:'registration_date', value:car.registration_date }));
        row1.appendChild(colPlate); row1.appendChild(colDate);

        // row 2: Marque / Modèle / Couleur
        const row2 = document.createElement('div'); row2.className = 'row';
        const colBrand = document.createElement('div'); colBrand.className = 'col-md-4 mb-2';
        colBrand.appendChild(createLabel('Marque *'));
        colBrand.appendChild(createInput({ name:'brand', value:car.brand }));
        const colModel = document.createElement('div'); colModel.className = 'col-md-4 mb-2';
        colModel.appendChild(createLabel('Modèle *'));
        colModel.appendChild(createInput({ name:'model', value:car.model }));
        const colColor = document.createElement('div'); colColor.className = 'col-md-4 mb-2';
        colColor.appendChild(createLabel('Couleur'));
        colColor.appendChild(createInput({ name:'color', value:car.color }));
        row2.appendChild(colBrand); row2.appendChild(colModel); row2.appendChild(colColor);

        // row 3: Énergie / Places disponibles
        const row3 = document.createElement('div'); row3.className = 'row';
        const colFuel = document.createElement('div'); colFuel.className = 'col-md-6 mb-2';
        colFuel.appendChild(createLabel('Énergie'));
        colFuel.appendChild(createInput({ name:'fuel_type', value:car.fuel_type }));
        const colSeats = document.createElement('div'); colSeats.className = 'col-md-6 mb-2';
        colSeats.appendChild(createLabel('Places disponibles *'));
        colSeats.appendChild(createInput({ type:'number', name:'available_seats', min:1, value:car.available_seats }));
        row3.appendChild(colFuel); row3.appendChild(colSeats);

        // Préférences personnalisées
        const prefsLabel = createLabel('Préférences personnalisées');
        const prefs = createTextarea({ name:'custom_preferences', value:car.custom_preferences, rows:3 });
        prefs.className = 'form-control mb-3';

        // Bouton supprimer
        const delDiv = document.createElement('div'); delDiv.className = 'text-center';
        const delBtn = createButton('Supprimer', async () => {
            if (!confirm('Voulez-vous vraiment supprimer ce véhicule ?')) return;
            try {
                const resp = await authFetch(`http://localhost:8081/api/car/delete/${car.id}`, { method:'DELETE' });
                const result = await resp.json();
                if(resp.ok && result.success){
                    renderCars(await fetchMyCars());
                    alert('La voiture a été supprimée avec succès !');
                } else {
                    alert('Erreur : ' + (result.message || JSON.stringify(result)));
                }
            } catch(err){
                alert('Erreur réseau'); console.error(err);
            }
        });
        delDiv.appendChild(delBtn);

        // Assemblage final
        form.appendChild(row1);
        form.appendChild(row2);
        form.appendChild(row3);
        form.appendChild(prefsLabel);
        form.appendChild(prefs);
        form.appendChild(delDiv);
        carsList.appendChild(form);
    }
}


/* Formulaire d’ajout */
export function initCar() {
    const form = document.querySelector("#driverForm");
    if (!form || !window.currentUserId) return;
    const storageKey = `userProfile_${window.currentUserId}`;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.available_seats = parseInt(data.available_seats,10)||0;
        try {
            const resp = await authFetch('http://localhost:8081/api/car/add', { method:'POST', body: JSON.stringify(data) });
            const result = await resp.json();
            if(resp.ok && result.success){
                const currentUserData = JSON.parse(sessionStorage.getItem(storageKey))||{};
                currentUserData.role='ROLE_PASSENGER_DRIVER';
                sessionStorage.setItem(storageKey, JSON.stringify(currentUserData));
                window.dispatchEvent(new Event('profileDataReady'));
                alert('La voiture a été ajoutée avec succès !');
                window.location.href='/pages/profil.html';
            } else alert('Erreur : ' + (result.message || JSON.stringify(result)));
        } catch(err){ alert('Erreur réseau'); console.error(err); }
    });
}

/* Init page */
export async function initCarPage() {
    renderCars(await fetchMyCars());
    initCar();
}
