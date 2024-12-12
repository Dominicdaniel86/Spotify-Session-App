declare global {
    interface Window {
        httpRequest: <T>(url: string, method: string, data?: object) => Promise<T>;
    }
}

window.httpRequest = async function httpRequest<T>(url: string, method: string, data?: object): Promise<T> {

    const options: RequestInit = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options)
    .then(response => {
        if(!response.ok)
            throw new Error("response was not ok: " + response.status);
        console.log("response ok")
        return response.json();
    })
    .catch(err => {
        console.error("error: ", err);
    })
}
