declare global {
    interface Window {
        put: (url: string, data: object) => void;
        post: (url: string, data: object) => void;
    }
}

window.put = function put(url: string, data: object) {
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if(!response.ok)
            throw new Error("response was not ok: " + response.status);
        console.log("response ok");
    })
    .catch(err => {
        console.error("error: ", err);
    });
}

window.post = function post(url: string, data: object) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if(!response.ok)
            throw new Error("response was not ok: " + response.status);
        console.log("response ok");
    })
    .catch(err => {
        console.error("error: ", err);
    });
}