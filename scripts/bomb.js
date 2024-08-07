import { api } from "./api";
import { getToken } from "./authentification";

export async function getBombs(lon, lat) {
    return api(`/bombs?lon=${lon}&lat=${lat}`, "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

export async function plantBomb(lon, lat, message, radius) {
    return api("/bombs", "POST", { lon, lat, message, radius }, { Authorization: `Bearer ${await getToken()}` });
}