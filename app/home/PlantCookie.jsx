import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { PlantCookieIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { plantCookie } from "../../scripts/cookie";
import { getUser } from "../../scripts/user";
import clsx from "clsx";
import { SafeAreaView } from "react-native-safe-area-context";
import { setCachedUser } from "../../scripts/cache";
import { COOKIE_RADIUS } from "../../constants/cookies";

export default function PlantCookieModal({ visible, setVisible, setUser, setUpdate }) {
    // les états visible, setVisible, setUser et setUpdate proviennent de l'appel de cette vue (dans index.js)

    const [message, setMessage] = useState("");
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(0.1);

    // Récupérer la position précise actuelle lorsque la popup s'ouvre
    useEffect(() => {
        if (visible) {
            getCurrentPositionAsync({ accuracy: LocationAccuracy.Highest }).then(setLocation).catch(e => {
                Alert.alert('Placement de fortune cookie', e?.message || e || "Une erreur s'est produite.");
                setVisible(false);
            });
        }
    }, [visible]);

    // Visuel: fenêtre contextuelle pour le placement d'un cookie, contenant une carte, un champ pour le message ainsi qu'une sélection d'un rayon
    return (<Modal
        animationType="slide"
        visible={visible}
        onRequestClose={() => {
            setVisible(false);
        }}>
        {loading || !location ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <SafeAreaView>
                <ScrollView className="px-4">
                    <View className="mt-12 flex flex-row justify-between items-center">
                        <Text className="text-zinc-700 text-xl">Placer un fortune cookie</Text>
                        <Pressable onPress={() => setVisible(false)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    </View>
                    <Text className="text-3xl mt-2">Préparez vos crayons !</Text>
                    <TextInput className="p-2 border-zinc-400 my-4 border rounded-md h-32 text-lg" placeholder="Votre message" multiline={true} numberOfLines={6} onChangeText={setMessage} defaultValue={message} maxLength={4096} />
                    <Text className="text-lg">Sélectionnez le rayon du fortune cookie</Text>
                    <View role="radiogroup" className="-space-y-px rounded-md bg-white mt-1 mb-3">
                        {COOKIE_RADIUS.map((setting, settingIdx) => (
                            <Pressable
                                role="radio"
                                key={setting.value}
                                onPress={() => setRadius(setting.value)}
                                data-checked={setting.value === radius}
                                className={clsx(
                                    settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                    settingIdx === COOKIE_RADIUS.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                                    'group flex flex-row cursor-pointer border p-2 focus:outline-none',
                                    setting.value === radius ? "border-zinc-400 bg-zinc-100" : "border-zinc-200"
                                )}
                            >
                                <View
                                    aria-hidden="true"
                                    className={clsx("mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border",
                                        setting.value === radius ? "border-transparent bg-zinc-600" : "border-zinc-300 bg-white"
                                    )}
                                >
                                    <View className="h-1.5 w-1.5 rounded-full bg-white" />
                                </View>
                                <View className="pl-3 flex-1">
                                    <Text className="text-sm font-medium text-zinc-900">
                                        {setting.name}
                                    </Text>
                                    <Text className="text-sm text-zinc-500">
                                        {setting.description}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                    <MapView provider={PROVIDER_GOOGLE} mapType="satellite" region={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1 / 50 * radius, longitudeDelta: 1 / 50 * radius }} className="h-40">
                        <Marker
                            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                            title="Position du fortune cookie"
                        />
                        <Circle
                            center={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                            radius={radius * 1000}
                            fillColor="rgba(255,0,0,.15)"
                            strokeColor="darkred"
                        />
                    </MapView>
                    <Pressable onPress={() => placeCookie(location, message, radius, setLoading, setUser, setMessage, setVisible, setUpdate)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                        <PlantCookieIcon className="w-6 h-6 fill-white" />
                        <Text className="text-white">Placer le fortune cookie</Text>
                    </Pressable>
                    <Pressable onPress={() => setVisible(false)} className="mx-auto mt-4 mb-6">
                        <Text className="underline text-zinc-700">Annuler</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        }
    </Modal>);
}

// Fonction lorsque le bouton placer un fortune cookie est appuyé
async function placeCookie(location, message, radius, setLoading, setUser, setMessage, setVisible, setUpdate) {
    setLoading(true); // Animation de chargement
    try {
        await plantCookie(location.coords.longitude, location.coords.latitude, message, radius); // Envoyer au serveur le placement d'un cookie
        setVisible(false); // Fermer la fenêtre contextuelle
        setMessage(""); // Remettre le champ du message à zéro
        const user = await getUser(); // Mettre à jour l'utilisateur (son nombre de cookies disponibles)
        await setCachedUser(user);
        setUser(user);
        setUpdate(true); // Mettre à jour la liste des cookies et des cassages
        Alert.alert("Placement de fortune cookie", "Votre fortune cookie a été placé avec succès !! Vous serez averti si quelqu'un le casse pour découvrir votre message.");
    } catch (error) {
        Alert.alert('Placement de fortune cookie', error?.message || error || "Une erreur s'est produite.");
    } finally {
        setLoading(false);
    }
} 