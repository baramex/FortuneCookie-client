import { api } from "./api";
import { getToken } from "./authentification";

export async function getUser() {
    return api("/users/@me", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

export async function getUserCookies() {
    return api("/users/@me/cookies", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

export async function getUserBreakages() {
    return api("/users/@me/breakages", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}