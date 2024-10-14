import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";
import { BreakCookieIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { breakCookie as breakCookieApi } from "../../scripts/cookie";
import { CountdownTime } from "../../components/miscellaneous/Time";

export default function BreakCookieModal({ cookie, setCookie, setBrokenCookie, setUpdate }) {
    // les états cookie, setCookie, setBrokenCookie et setUpdate proviennent de l'appel de cette vue (dans index.js)

    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Énigme pour casser le cookie
    const [x, setX] = useState(undefined);
    const [y, setY] = useState(undefined);
    const [input, setInput] = useState("");

    // Récupérer la position précise actuelle lorsque la popup s'ouvre
    useEffect(() => {
        if (cookie) {
            getCurrentPositionAsync({ accuracy: LocationAccuracy.Highest }).then(setLocation).catch(e => {
                Alert.alert('Cassage de fortune cookie', e?.message || e || "Une erreur s'est produite.");
                setCookie(null);
            });
        }
    }, [cookie]);

    // Visuel: fenêtre contextuelle pour casser un fortune cookie avec carte, compteur à rebours et énigme
    return (<Modal
        animationType="slide"
        visible={!!cookie}
        onRequestClose={() => {
            setCookie(null);
        }}>
        {loading || !location || !cookie ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <View className="px-4 pt-24">
                <View className="flex flex-row justify-between items-center mb-5">
                    <Text className="text-3xl">Casser un fortune cookie</Text>
                    {!x && !y &&
                        <Pressable onPress={() => setCookie(null)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    }
                </View>
                {x && y ?
                    <View className="flex items-center justify-center">
                        <Text className="text-5xl"><CountdownTime time={10000} run={() => validateEnigma(x, y, input, setX, setY, cookie, location, setLoading, setCookie, setBrokenCookie, setUpdate)} /></Text>
                        <Text className="text-xl">{x} + {y} = ?</Text>
                        <TextInput onChangeText={setInput} placeholder="Votre réponse" className="border-2 border-zinc-300 mt-3 px-4 py-1.5 rounded-md" />
                        <Pressable onPress={() => validateEnigma(x, y, input, setX, setY, cookie, location, setLoading, setCookie, setBrokenCookie, setUpdate)} className="rounded-md bg-zinc-700 mt-5 px-5 py-1.5 justify-center items-center">
                            <Text className="text-white text-xl">Valider</Text>
                        </Pressable>
                    </View>
                    : <>
                        <MapView provider={PROVIDER_GOOGLE} mapType="satellite" region={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1 / 50 * cookie.radius / 1000, longitudeDelta: 1 / 50 * cookie.radius / 1000 }} className="h-56">
                            <Marker
                                coordinate={{ latitude: cookie.latitude, longitude: cookie.longitude }}
                                title="Position du fortune cookie"
                            />
                            <Circle
                                center={{ latitude: cookie.latitude, longitude: cookie.longitude }}
                                radius={cookie.radius}
                                fillColor="rgba(255,0,0,.15)"
                                strokeColor="darkred"
                            />
                            <Marker
                                coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                                pinColor="blue"
                                title="Votre position"
                            />
                        </MapView>
                        <Pressable onPress={() => startEnigma(setX, setY)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                            <BreakCookieIcon className="w-9 h-9 fill-white" />
                            <Text className="text-white text-xl">Casser</Text>
                        </Pressable>
                        <Pressable onPress={() => setCookie(null)} className="mx-auto mt-4">
                            <Text className="underline text-zinc-700">Annuler</Text>
                        </Pressable>
                    </>}
            </View>
        }
    </Modal >);
}

// Générer 2 nombres aléatoires pour l'énigme
function startEnigma(setX, setY) {
    setX(Math.round(Math.random() * 30));
    setY(Math.round(Math.random() * 30));
}

// Valider l'addition des 2 nombres: si oui, casser le cookie
function validateEnigma(x, y, input, setX, setY, cookie, location, setLoading, setCookie, setBrokenCookie, setUpdate) {
    setX(undefined);
    setY(undefined);
    if (x + y === Number(input)) {
        breakCookie(cookie, location, setLoading, setCookie, setBrokenCookie, setUpdate);
    }
    else {
        Alert.alert("Cassage de fortune cookie", "Vous avez échoué l'égnime..");
    }
}

// Fonction lorsque l'énigme est correctement résolue
async function breakCookie(cookie, location, setLoading, setCookie, setBrokenCookie, setUpdate) {
    setLoading(true); // Animation de chargement
    try {
        const breakage = await breakCookieApi(cookie.identifier, location.coords.longitude, location.coords.latitude); // Envoyer le cassage du cookie au serveur
        setBrokenCookie(breakage); // Ouvrir la fenêtre contextuelle montrant le cookie cassé
        setCookie(null); // Fermer la fenêtre contextuelle
        setUpdate(true); // Mettre à jour la liste des cookies et des cassages
    } catch (error) {
        Alert.alert("Cassage de fortune cookie", error?.message || error || "Une erreur s'est produite.")
    } finally {
        setLoading(false);
    }
}