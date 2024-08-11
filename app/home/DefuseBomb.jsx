import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";
import { DefuseBombIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { defuseBomb as defuseBombApi } from "../../scripts/bomb";

export default function DefuseBombModal({ bomb, setBomb, setDefusedBomb }) {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (bomb) {
            getCurrentPositionAsync({ accuracy: LocationAccuracy.Highest }).then(setLocation).catch(e => {
                Alert.alert('Désarmorçage de bombe', e?.message || e || "Une erreur s'est produite.");
                setVisible(false);
            });
        }
    }, [bomb]);

    return (<Modal
        animationType="slide"
        visible={!!bomb}
        onRequestClose={() => {
            setVisible(false)
        }}>
        {loading || !location || !bomb ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <View className="px-4 pt-24">
                <View className="flex flex-row justify-between items-center mb-5">
                    <Text className="text-3xl">Désarmocer une bombe</Text>
                    <Pressable onPress={() => setBomb(null)}>
                        <XMarkIcon className="h-6 w-6 text-black" />
                    </Pressable>
                </View>
                <MapView mapType="satellite" region={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1 / 50 * bomb.radius / 1000, longitudeDelta: 1 / 50 * bomb.radius / 1000 }} className="h-56">
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
                <Pressable onPress={() => defuseBomb(bomb, setLoading, setBomb, setDefusedBomb)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                    <DefuseBombIcon className="w-9 h-9 fill-white" />
                    <Text className="text-white text-xl">Désarmocer</Text>
                </Pressable>
                <Pressable onPress={() => setBomb(null)} className="mx-auto mt-4">
                    <Text className="underline text-zinc-700">Annuler</Text>
                </Pressable>
            </View>
        }
    </Modal >);
}

async function defuseBomb(bomb, setLoading, setBomb, setDefusedBomb) {
    setLoading(true);
    try {
        const defuse = await defuseBombApi(bomb.id, bomb.longitude, bomb.latitude);
        setDefusedBomb(defuse);
        setBomb(null);
    } catch (error) {
        Alert.alert("Désarmoçage de bombe", error?.message || error || "Une erreur s'est produite.")
    } finally {
        setLoading(false);
    }
}