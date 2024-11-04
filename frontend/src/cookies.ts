/**
 * sets a new cookie
 * @param name the identifier of the cookie
 * @param value the value 
 * @param timeFrame a number n followed by either s, m, h or d (n seconds, n minutes, n hours or n days)
 */
export function setCookie(name: string, value: string, timeFrame: string) {
    
    let duration: number = 0;

    // calculates the duration based on the timeFrame
    if (timeFrame.endsWith("s")) {
        timeFrame = timeFrame.slice(0, -1);
        duration = Number(timeFrame)*1000;
    }
    else if (timeFrame.endsWith("m")) {
        timeFrame = timeFrame.slice(0, -1);
        duration = Number(timeFrame)*60*1000;
    }
    else if (timeFrame.endsWith("h")) {
        timeFrame = timeFrame.slice(0, -1);
        duration = Number(timeFrame)*60*60*1000;
    }
    else if (timeFrame.endsWith("d")) {
        timeFrame = timeFrame.slice(0, -1);
        duration = Number(timeFrame)*24*60*60*1000;
    }
    else {
        console.error("error: invalid timeFrame declaration. Needs to end with s, m, h or d.");
        return;
    }

    // sets expiration date
    let date = new Date();
    date.setTime(date.getTime() + duration);
    let expires = "; expires=" + date.toUTCString();

    // set cookie
    let cookie =  name + "=" + (value || "") + expires + "; path=/; SameSite=None; Secure";
    console.debug("debug: cookie set - " + cookie);
    document.cookie = cookie;
}

/**
 * gets the value of a cookie
 * @param name the identifier of the cookie
 * @returns the stored value in the cookie
 */
export function getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0)
            console.debug("debug: found cookie value - " + c.substring(nameEQ.length,c.length));
            return c.substring(nameEQ.length,c.length);
    }
    console.error("error: no matching cookie found");
    return null;
}

/**
 * deletes a cookie
 * @param name the identifier of the cookie
 */
export function deleteCookie(name: string) {
    if (!name)
        return
    document.cookie = name + '=; Path=/; Expires=Thu 01 Jan 1970 00:00:01 GMT;'
    console.debug("debug: deleted cookie - " + name);
}
