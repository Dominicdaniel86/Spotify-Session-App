declare global {
    interface Window {
        logout: () => void;
    }
}

window.logout = function logout() {
    window.location.href = "/";
}