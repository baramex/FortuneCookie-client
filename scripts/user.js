import { api } from "./api";
import { getToken } from "./authentification";

// Fonctions API liées à l'utilisateur

// Récupérer les données de l'utilisateur
export async function getUser() {
    return api("/users/@me", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

// Récupérer la liste des cookies de l'utilisateur
export async function getUserCookies() {
    return api("/users/@me/cookies", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}

// Récupérer la liste des cassages de cookies de l'utilisateur
export async function getUserBreakages() {
    return api("/users/@me/breakages", "GET", undefined, { Authorization: `Bearer ${await getToken()}` });
}