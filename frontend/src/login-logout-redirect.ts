declare global {
    interface Window {
        login: () => void;
        logout: () => void;
        redirect: (url: string) => void;
    }
}

window.login = function login() {
    const input = document.getElementById("name-input") as HTMLInputElement;
    if(input.value === "")
        return;
    window.location.href = "/addSong";
}

window.logout = function logout() {
    window.location.href = "/";
}

window.redirect = function redirect(url: string) {
    window.location.href= url;
}
