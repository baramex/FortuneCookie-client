import { api } from "./api";
import { getToken } from "./authentification";

// Fonctions API liées aux cookies

// Récupérer les cookies dans un rayon de 5 km
export async function getCookies(lon, lat) {
    return api(`/cookies?lon=${lon}&lat=${lat}`, "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

// Placer un cookie
export async function plantCookie(lon, lat, message, radius) {
    return api("/cookies", "POST", { lon, lat, message, radius }, { Authorization: `Bearer ${await getToken()}` });
}

// Casser un cookie
export async function breakCookie(id, lon, lat) {
    return api(`/cookies/${id}/break`, "POST", { lon, lat }, { Authorization: `Bearer ${await getToken()}` });
}

// Répondre à un cookie
export async function replyCookie(id, message) {
    return api(`/cookies/${id}/reply`, "POST", { message }, { Authorization: `Bearer ${await getToken()}` });
}

// À partir d'un cassage de cookie, récupérer les informations utiles à l'affichage de ce cookie
export function fromBreakageToCookie(breakage, cookies) {
    return { id: breakage.cookie_id, lon: breakage.cookie_lon, lat: breakage.cookie_lat, radius: breakage.cookie_radius, state: breakage.cookie_state, message: breakage.cookie_message, created_at: breakage.cookie_created_at, reply_id: breakage.reply_id, reply_state: breakage.reply_state, replied_at: breakage.replied_at, reference: breakage.cookie_reference ? cookies?.some(b => b.id === breakage.cookie_reference) ? breakage.cookie_reference : undefined : undefined };
}