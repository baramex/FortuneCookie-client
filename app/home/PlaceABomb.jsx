import { getCurrentPositionAsync, LocationAccuracy } from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { DropBombIcon } from "../../components/miscellaneous/Icons";
import { plantBomb } from "../../scripts/bomb";

export default function PlaceABombModal({ visible, setVisible }) {
    const [message, setMessage] = useState("");
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(0.05);

    useEffect(() => {
        if (visible) {
            getCurrentPositionAsync({ accuracy: LocationAccuracy.High }).then(setLocation);
        }
    }, [visible]);

    console.log(location);

    return (<Modal
        animationType="slide"
        visible={visible}
        onRequestClose={() => {
            setVisible(false)
        }}>
        {loading || !location ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <View className="px-4 pt-12">
                <Text className="text-zinc-700 text-xl">Placer une bombe</Text>
                <Text className="text-3xl mt-2">Préparez vos crayons explosifs !</Text>
                <TextInput className="p-2 border-zinc-700 my-4 border rounded-md h-32" placeholder="Votre message" multiline={true} numberOfLines={6} onChangeText={setMessage} defaultValue={message} maxLength={4096} />
                <MapView region={{ latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005, }} className="h-36">
                    <Marker
                        coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                        title="Position de la bombe"
                    />
                </MapView>
                <Pressable onPress={() => placeBomb(location, message, radius, setLoading, setVisible)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                    <DropBombIcon className="w-6 h-6 fill-white" />
                    <Text className="text-white">Placer la bombe</Text>
                </Pressable>
                <Pressable onPress={() => setVisible(false)} className="mx-auto mt-4">
                    <Text className="underline text-zinc-700">Annuler</Text>
                </Pressable>
            </View>
        }
    </Modal>);
}

async function placeBomb(location, message, radius, setLoading, setVisible) {
    setLoading(true);
    try {
        await plantBomb(location.coords.longitude, location.coords.latitude, message, radius);
        setLoading(false);
        setVisible(false);
    } catch (error) {
        setLoading(false);
        Alert.alert('Placement de bombe', error?.message || error || "Une erreur s'est produite.");
    }
} 