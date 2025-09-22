export function initSwapAddress(departId, arriveeId, btnId) {
    
    const depart = document.getElementById(departId);
    const arrivee = document.getElementById(arriveeId);
    const swapBtn = document.getElementById(btnId);

    if (depart && arrivee && swapBtn) {
        swapBtn.addEventListener('click', () => {
            const temp = depart.value;
            depart.value = arrivee.value;
            arrivee.value = temp;
        });
    }
}