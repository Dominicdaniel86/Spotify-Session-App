let addDelay: any;

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("song-input") as HTMLInputElement;
    input.value = "";

    document.getElementById('song-input')?.addEventListener('input', function(event) {
        const inputElement = event.target as HTMLInputElement;

        clearTimeout(addDelay);
        addDelay = setTimeout(testDelay, 1500, inputElement.value);
    });
});

declare global {
    interface Window {
        sendSongRequest: () => void;
    }
}

function testDelay(value: string) {
    console.log("current value: " + value);

    let url = '/spotify/searchSong/' + value;
    window.get(url);
}
