import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

// Fonctions API liées aux sessions et à l'authentification

// Récupérer la clé enregistrée dans les fichiers de l'application
export function getToken() {
    return AsyncStorage.getItem("token");
}

export function isAuthenticated() {
    return getToken() ?? true;
}

// Créer un compte
export function register(username) {
    return api("/register", "POST", { username });
}