import { api } from "./api";
import { getToken } from "./authentification";

export async function getUser() {
    return api("/users/@me", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

export async function getUserBombs() {
    return api("/users/@me/bombs", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

export async function getUserDefuses() {
    return api("/users/@me/defuses", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}