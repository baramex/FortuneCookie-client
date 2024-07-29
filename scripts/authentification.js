import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export function getToken() {
    return AsyncStorage.getItem("token");
}

export function isAuthenticated() {
    return getToken() ?? true;
}

export function isValidSession(token) {
    return api("/users/@me", "GET", undefined, { Authorization: `Bearer ${token}` }).then(() => true).catch(() => false);
}

export function register(username) {
    return api("/register", "POST", { username });
}