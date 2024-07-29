import AsyncStorage from "@react-native-async-storage/async-storage";

export function getCachedUser() {
    return JSON.parse(AsyncStorage.getItem("user"));
}

export async function setCachedUser(user) {
    AsyncStorage.setItem("token", user.token);
    AsyncStorage.setItem("user", JSON.stringify(user));
    return true;
}

export async function clearCachedSession() {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    return true;
}