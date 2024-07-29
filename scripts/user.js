import { api } from "./api";
import { getToken } from "./authentification";

export async function getUser() {
    return api("/users/@me", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}