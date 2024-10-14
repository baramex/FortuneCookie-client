import axios from "axios";

// Fonction générique pour faire une réponse api, en prenant en compte la possibilité d'être "rate-limited", en cas d'un trop grand nombre de requêtes en un moment donné
export function api(endpoint, method, data = undefined, customHeader = undefined, responseType = undefined) {
    return new Promise((res, rej) => {
        const copyData = data ? { ...data } : undefined;
        const copyHeader = customHeader ? { ...customHeader } : undefined;

        axios({
            method,
            url: "https://fortunecookie.baramex.me" + endpoint,
            data,
            headers: customHeader,
            responseType,
            withCredentials: true
        }).then(response => {
            res(response.data);
        }).catch(err => {
            const response = err.response;
            if (!response) return rej(err);
            const status = response.status;
            const time = err.response.headers["retry-after"];
            if (status === 429 && time && time * 1000 < 10000) {
                setTimeout(() => {
                    api(endpoint, method, copyData, copyHeader).then(res).catch(rej);
                }, time * 1000);
            }
            else {
                const message = response.data;
                rej(new Error(message?.error || message));
            }
        });
    });
}
