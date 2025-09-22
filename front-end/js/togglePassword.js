export function initTogglePassword(passwordId, toggleBtnId) {
    const toggleBtn = document.getElementById(toggleBtnId);
    const input = document.getElementById(passwordId);

    if (toggleBtn && input) {
        toggleBtn.addEventListener('click', () => {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}
