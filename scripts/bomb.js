import { api } from "./api";
import { getToken } from "./authentification";

export async function getBombs(lon, lat) {
    return api(`/bombs?lon=${lon}&lat=${lat}`, "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

export async function plantBomb(lon, lat, message, radius) {
    return api("/bombs", "POST", { lon, lat, message, radius }, { Authorization: `Bearer ${await getToken()}` });
}

export async function defuseBomb(id, lon, lat) {
    return api(`/bombs/${id}/defuse`, "POST", { lon, lat }, { Authorization: `Bearer ${await getToken()}` });
}

export async function replyBomb(id, message) {
    return api(`/bombs/${id}/reply`, "POST", { message }, { Authorization: `Bearer ${await getToken()}` });
}

export function fromDefuseToBomb(defuse, bombs) {
    return { id: defuse.bomb_id, lon: defuse.bomb_lon, lat: defuse.bomb_lat, radius: defuse.bomb_radius, state: defuse.bomb_state, message: defuse.bomb_message, created_at: defuse.bomb_created_at, reply_id: defuse.reply_id, reply_state: defuse.reply_state, replied_at: defuse.replied_at, reference: defuse.bomb_reference ? bombs?.some(b => b.id === defuse.bomb_reference) ? defuse.bomb_reference : undefined : undefined };
}