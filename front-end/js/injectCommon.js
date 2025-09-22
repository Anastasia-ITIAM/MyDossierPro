export async function injectCommon() {
    try {
        // --- Inject header ---
        const headerResponse = await fetch("/templates/header.html");
        if (headerResponse.ok) {
            const headerData = await headerResponse.text();
            const headerPlaceholder = document.getElementById("header-placeholder");
            if (headerPlaceholder) headerPlaceholder.innerHTML = headerData;
        } else {
            console.error("Erreur chargement header :", headerResponse.status);
        }

        // --- Inject footer ---
        const footerResponse = await fetch("/templates/footer.html");
        if (footerResponse.ok) {
            const footerData = await footerResponse.text();
            const footerPlaceholder = document.getElementById("footer-placeholder");
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerData;
        } else {
            console.error("Erreur chargement footer :", footerResponse.status);
        }

        // --- Inject modals ---
        const modalsResponse = await fetch("/templates/modals.html");
        if (modalsResponse.ok) {
            const modalsData = await modalsResponse.text();
            document.body.insertAdjacentHTML("beforeend", modalsData);
        } else {
            console.error("Erreur chargement modals :", modalsResponse.status);
        }

        console.log("Head, header, footer et modals injectés avec succès !");
    } catch (err) {
        console.error("Erreur injection common :", err);
    }
}
