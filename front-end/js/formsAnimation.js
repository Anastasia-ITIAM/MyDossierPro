export function loadFormsAnimation() {
    document.querySelectorAll('form').forEach(form => {
        setTimeout(() => form.classList.add('loaded'), 50);
    });
}

export function initFormsAnimation() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadFormsAnimation);
    } else {
        loadFormsAnimation();
    }
}