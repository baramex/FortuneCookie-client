import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";
import { DefuseBombIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

export default function DefuseBombModal({ bomb, setBomb }) {
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
        {loading || !location ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <View className="px-4">
                <View className="mt-12 flex flex-row justify-between items-center">
                    <Text className="text-zinc-700 text-xl">Désarmocer une bombe</Text>
                    <Pressable onPress={() => setBomb(null)}>
                        <XMarkIcon className="h-6 w-6 text-black" />
                    </Pressable>
                </View>
                <MapView mapType="satellite" region={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 1 / 50 * bomb.radius, longitudeDelta: 1 / 50 * bomb.radius }} className="h-40">
                    <Marker
                        coordinate={{ latitude: bomb.latitude, longitude: bomb.longitude }}
                        title="Position de la bombe"
                    />
                    <Circle
                        center={{ latitude: bomb.latitude, longitude: bomb.latitude }}
                        radius={bomb.radius}
                        fillColor="rgba(255,0,0,.15)"
                        strokeColor="darkred"
                    />
                    <Circle
                        center={{ latitude: location.coords.latitude, longitude: location.coords.latitude }}
                        radius={10}
                        fillColor="rgba(0,255,0,.15)"
                        strokeColor="darkblue"
                    />
                </MapView>
                <Pressable onPress={() => { }} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                    <DefuseBombIcon className="w-6 h-6 fill-white" />
                    <Text className="text-white">Désarmocer</Text>
                </Pressable>
                <Pressable onPress={() => setBomb(null)} className="mx-auto mt-4 mb-6">
                    <Text className="underline text-zinc-700">Annuler</Text>
                </Pressable>
            </View>
        }
    </Modal >);
}