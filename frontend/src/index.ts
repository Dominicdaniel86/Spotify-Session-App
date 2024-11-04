document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("name-input") as HTMLInputElement;
    input.value = "";
});

declare global {
    interface Window {
        login: () => void;
    }
}

window.login = function login() {
    const input = document.getElementById("name-input") as HTMLInputElement;
    if(input.value === "")
        return;
    window.location.href = "/addSong";
}
