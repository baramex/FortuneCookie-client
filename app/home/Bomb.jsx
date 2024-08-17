import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { BOMB_RADIUS, BOMB_STATES } from "../../constants/bombs";
import { DateTime } from "../../components/miscellaneous/Time";
import { DropBombIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { getUser } from "../../scripts/user";
import { setCachedUser } from "../../scripts/cache";
import { replyBomb } from "../../scripts/bomb";

export default function BombModal({ bomb, reply, defuse, setBomb, setUser, setUpdate }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!bomb) setMessage("");
    }, [bomb]);

    return (<Modal
        animationType="slide"
        visible={!!bomb}
        onRequestClose={() => {
            setBomb(null);
        }}>
        {!bomb || typeof bomb !== "object" || loading ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <SafeAreaView>
                <ScrollView className="px-4">
                    <View className="mt-4 flex items-end justify-center">
                        <Pressable onPress={() => setBomb(null)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    </View>
                    <MapView mapType="satellite" region={{ latitude: bomb.lat, longitude: bomb.lon, latitudeDelta: 1 / 50 * bomb.radius, longitudeDelta: 1 / 50 * bomb.radius }} className="h-48 mt-2">
                        <Marker
                            coordinate={{ latitude: bomb.lat, longitude: bomb.lon }}
                            title="Position de la bombe"
                        />
                        <Circle
                            center={{ latitude: bomb.lat, longitude: bomb.lon }}
                            radius={bomb.radius * 1000}
                            fillColor="rgba(255,0,0,.15)"
                            strokeColor="darkred"
                        />
                        {defuse && <Marker
                            pinColor="blue"
                            coordinate={{ latitude: defuse.lat, longitude: defuse.lon }}
                        />}
                    </MapView>
                    <View className="flex flex-row justify-between my-2 items-start">
                        <View>
                            <Text className="text-zinc-800 mb-1">Rayon: {BOMB_RADIUS.find(a => a.value === bomb.radius).name}</Text>
                            <Text className="text-zinc-800">Placée le <DateTime date={new Date(bomb.created_at)} /></Text>
                            {(defuse || bomb.defused_at) && <Text className="mt-1 text-zinc-800">Désamorcée le <DateTime date={new Date(defuse?.created_at || bomb.defused_at)} /></Text>}
                            {(reply || bomb.replied_at) && <Text className="mt-1 text-zinc-800">Répondue le <DateTime date={new Date(reply?.created_at || bomb.replied_at)} /></Text>}
                        </View>
                        {!defuse && <View className={clsx("rounded-lg px-4 py-1", BOMB_STATES[bomb.state].bgColor)}>
                            <Text className={clsx(BOMB_STATES[bomb.state].textColor, "text-lg")}>{BOMB_STATES[bomb.state].text}</Text>
                        </View>}
                    </View>
                    {bomb.reply_id && bomb.reply_state === 1 && <Text className="mt-1 italic text-zinc-800">La bombe réponse est encore active à proximité de votre bombe.</Text>}
                    {bomb.reference && <View className="flex flex-row items-center mt-3">
                        <Text className="text-lg">Réponse à</Text>
                        <Pressable className="px-1.5 ml-1 bg-zinc-700 rounded-lg"><Pressable onPress={() => setBomb(bomb.reference)}><Text className="text-white text-lg">Cette bombe</Text></Pressable></Pressable>
                    </View>}
                    <Text className="text-xl mt-3">Message</Text>
                    <Text className="text-zinc-700 text-lg">{bomb.message}</Text>
                    {reply && <>
                        <Text className="text-xl mt-3">Réponse</Text>
                        <Text className="text-zinc-700 text-lg">{reply.message}</Text>
                    </>}
                    {bomb.state === 2 && defuse ? <>
                        <Text className="text-xl mt-4">Votre réponse</Text>
                        <TextInput className="p-2 border-zinc-400 my-3 border rounded-md h-32 text-lg" multiline={true} numberOfLines={6} onChangeText={setMessage} defaultValue={message} maxLength={4096} />
                        <Text className="text-zinc-500">Répondre à une bombe replacera une bombe du même rayon à l'emplacement de découverte.</Text>
                        <Pressable onPress={() => replyf(bomb, message, setLoading, setMessage, setUser, setBomb, setUpdate)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                            <DropBombIcon className="w-9 h-9 fill-white" />
                            <Text className="text-white text-xl">Répondre</Text>
                        </Pressable>
                    </>
                        : null}
                    <Pressable onPress={() => setBomb(null)} className="mx-auto my-6">
                        <Text className="underline text-zinc-700">Fermer</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        }
    </Modal >);
}

async function replyf(bomb, message, setLoading, setMessage, setUser, setBomb, setUpdate) {
    setLoading(true);
    try {
        await replyBomb(bomb.id, message);
        setBomb(null);
        setMessage("");
        const user = await getUser();
        await setCachedUser(user);
        setUser(user);
        setUpdate(true);
        Alert.alert("Réponse à une bombe", "Votre réponse a été plantée ! Si elle est découverte, vous serez averti !");
    } catch (error) {
        Alert.alert("Réponse à une bombe", error?.message || error || "Une erreur s'est produite.");
    } finally {
        setLoading(false);
    }
}