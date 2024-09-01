import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";
import { DefuseBombIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { defuseBomb as defuseBombApi } from "../../scripts/bomb";
import { CountdownTime } from "../../components/miscellaneous/Time";

export default function DefuseBombModal({ bomb, setBomb, setDefusedBomb, setUpdate }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    // Énigme pour désamorcer la bombe
    const [x, setX] = useState(undefined);
    const [y, setY] = useState(undefined);
    const [input, setInput] = useState("");

    // Récupérer la position précise actuelle lorsque la popup s'ouvre
    useEffect(() => {
        if (bomb) {
            getCurrentPositionAsync({ accuracy: LocationAccuracy.Highest }).then(setLocation).catch(e => {
                Alert.alert('Désamorçage de bombe', e?.message || e || "Une erreur s'est produite.");
                setBomb(null);
            });
        }
    }, [bomb]);

    //

    return (<Modal
        animationType="slide"
        visible={!!bomb}
        onRequestClose={() => {
            setBomb(null);
        }}>
        {loading || !location || !bomb ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <View className="px-4 pt-24">
                <View className="flex flex-row justify-between items-center mb-5">
                    <Text className="text-3xl">Désamorcer une bombe</Text>
                    {!x && !y &&
                        <Pressable onPress={() => setBomb(null)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    }
                </View>
                {x && y ?
                    <View className="flex items-center justify-center">
                        <Text className="text-5xl"><CountdownTime time={10000} run={() => validateEnigma(x, y, input, setX, setY, bomb, location, setLoading, setBomb, setDefusedBomb, setUpdate)} /></Text>
                        <Text className="text-xl">{x} + {y} = ?</Text>
                        <TextInput onChangeText={setInput} placeholder="Votre réponse" className="border-2 border-zinc-300 mt-3 px-4 py-1.5 rounded-md" />
                        <Pressable onPress={() => validateEnigma(x, y, input, setX, setY, bomb, location, setLoading, setBomb, setDefusedBomb, setUpdate)} className="rounded-md bg-zinc-700 mt-5 px-5 py-1.5 justify-center items-center">
                            <Text className="text-white text-xl">Valider</Text>
                        </Pressable>
                    </View>
                    : <>
                        <MapView provider={PROVIDER_GOOGLE} mapType="satellite" region={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1 / 50 * bomb.radius / 1000, longitudeDelta: 1 / 50 * bomb.radius / 1000 }} className="h-56">
                            <Marker
                                coordinate={{ latitude: bomb.latitude, longitude: bomb.longitude }}
                                title="Position de la bombe"
                            />
                            <Circle
                                center={{ latitude: bomb.latitude, longitude: bomb.longitude }}
                                radius={bomb.radius}
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
                            <DefuseBombIcon className="w-9 h-9 fill-white" />
                            <Text className="text-white text-xl">Désamorcer</Text>
                        </Pressable>
                        <Pressable onPress={() => setBomb(null)} className="mx-auto mt-4">
                            <Text className="underline text-zinc-700">Annuler</Text>
                        </Pressable>
                    </>}
            </View>
        }
    </Modal >);
}

function startEnigma(setX, setY) {
    setX(Math.round(Math.random() * 30));
    setY(Math.round(Math.random() * 30));
}

function validateEnigma(x, y, input, setX, setY, bomb, location, setLoading, setBomb, setDefusedBomb, setUpdate) {
    setX(undefined);
    setY(undefined);
    if (x + y === Number(input)) {
        defuseBomb(bomb, location, setLoading, setBomb, setDefusedBomb, setUpdate);
    }
    else {
        Alert.alert("Désamorçage de bombe", "Vous avez échoué l'égnime.. 💥");
    }
}

// Fonction lorsque l'énigme est correctement résolue
async function defuseBomb(bomb, location, setLoading, setBomb, setDefusedBomb, setUpdate) {
    setLoading(true);
    try {
        const defuse = await defuseBombApi(bomb.identifier, location.coords.longitude, location.coords.latitude);
        setDefusedBomb(defuse);
        setBomb(null);
        setUpdate(true);
    } catch (error) {
        Alert.alert("Désamorçage de bombe", error?.message || error || "Une erreur s'est produite.")
    } finally {
        setLoading(false);
    }
}