import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { COOKIE_RADIUS, COOKIE_STATES } from "../../constants/cookies";
import { DateTime } from "../../components/miscellaneous/Time";
import { PlantCookieIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { getUser } from "../../scripts/user";
import { setCachedUser } from "../../scripts/cache";
import { replyCookie } from "../../scripts/cookie";

export default function CookieModal({ cookie, reply, breakage, setCookie, setUser, setUpdate }) {
    // les états cookie, reply, breakage, setCookie, setUser et setUpdate proviennent de l'appel de cette vue (dans index.js)
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Remettre le champ du message à zéro lorsque la popup se ferme
    useEffect(() => {
        if (!cookie) setMessage("");
    }, [cookie]);

    // Visuel: fenêtre contextuelle pour afficher les détails d'un cookie: son état, une carte, son message, les dates de création, de cassage et de réponse, et sa réponse (dans le cas où le cookie a été répondu)
    return (<Modal
        animationType="slide"
        visible={!!cookie}
        onRequestClose={() => {
            setCookie(null);
        }}>
        {!cookie || typeof cookie !== "object" || loading ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <SafeAreaView>
                <ScrollView className="px-4">
                    <View className="mt-4 flex items-end justify-center">
                        <Pressable onPress={() => setCookie(null)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    </View>
                    <MapView provider={PROVIDER_GOOGLE} mapType="satellite" region={{ latitude: cookie.lat, longitude: cookie.lon, latitudeDelta: 1 / 50 * cookie.radius, longitudeDelta: 1 / 50 * cookie.radius }} className="h-48 mt-2">
                        <Marker
                            coordinate={{ latitude: cookie.lat, longitude: cookie.lon }}
                            title="Position du fortune cookie"
                        />
                        <Circle
                            center={{ latitude: cookie.lat, longitude: cookie.lon }}
                            radius={cookie.radius * 1000}
                            fillColor="rgba(255,0,0,.15)"
                            strokeColor="darkred"
                        />
                        {breakage && <Marker
                            pinColor="blue"
                            coordinate={{ latitude: breakage.lat, longitude: breakage.lon }}
                        />}
                    </MapView>
                    <View className="flex flex-row justify-between my-2 items-start">
                        <View>
                            <Text className="text-zinc-800 mb-1">Rayon: {COOKIE_RADIUS.find(a => a.value === cookie.radius).name}</Text>
                            <Text className="text-zinc-800">Placé le <DateTime date={new Date(cookie.created_at)} /></Text>
                            {(breakage || cookie.broken_at) && <Text className="mt-1 text-zinc-800">Cassé le <DateTime date={new Date(breakage?.created_at || cookie.broken_at)} /></Text>}
                            {(reply || cookie.replied_at) && <Text className="mt-1 text-zinc-800">Répondu le <DateTime date={new Date(reply?.created_at || cookie.replied_at)} /></Text>}
                        </View>
                        {!breakage && <View className={clsx("rounded-lg px-4 py-1", COOKIE_STATES[cookie.state].bgColor)}>
                            <Text className={clsx(COOKIE_STATES[cookie.state].textColor, "text-lg")}>{COOKIE_STATES[cookie.state].text}</Text>
                        </View>}
                    </View>
                    {cookie.reply_id && cookie.reply_state === 1 && !reply && <Text className="mt-1 italic text-zinc-800">Le fortune cookie réponse est encore actif à proximité de votre cookie.</Text>}
                    {cookie.reference && <View className="flex flex-row items-center mt-3">
                        <Text className="text-lg">Réponse à</Text>
                        <Pressable className="px-1.5 ml-1 bg-zinc-700 rounded-lg"><Pressable onPress={() => setCookie(cookie.reference)}><Text className="text-white text-lg">Ce cookie</Text></Pressable></Pressable>
                    </View>}
                    <Text className="text-xl mt-3">Message</Text>
                    <Text className="text-zinc-700 text-lg">{cookie.message}</Text>
                    {reply && <>
                        <Text className="text-xl mt-3">Réponse</Text>
                        <Text className="text-zinc-700 text-lg">{reply.message}</Text>
                    </>}
                    {cookie.state === 2 && breakage ? <>
                        <Text className="text-xl mt-4">Votre réponse</Text>
                        <TextInput className="p-2 border-zinc-400 my-3 border rounded-md h-32 text-lg" multiline={true} numberOfLines={6} onChangeText={setMessage} defaultValue={message} maxLength={4096} />
                        <Text className="text-zinc-500">Répondre à un fortune cookie replacera un cookie du même rayon à l'emplacement de découverte.</Text>
                        <Pressable onPress={() => replyf(cookie, message, setLoading, setMessage, setUser, setCookie, setUpdate)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                            <PlantCookieIcon className="w-9 h-9 fill-white" />
                            <Text className="text-white text-xl">Répondre</Text>
                        </Pressable>
                    </>
                        : null}
                    <Pressable onPress={() => setCookie(null)} className="mx-auto my-6">
                        <Text className="underline text-zinc-700">Fermer</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        }
    </Modal >);
}

// Fonction lorsque le bouton répondre est appuyé
async function replyf(cookie, message, setLoading, setMessage, setUser, setCookie, setUpdate) {
    setLoading(true); // Animation de chargement
    try {
        await replyCookie(cookie.id, message); // Envoyer au serveur la réponse au cookie
        setCookie(null); // Fermer la fenêtre contextuelle
        setMessage(""); // Remettre le champ du message à zéro
        const user = await getUser(); // Mettre à jour l'utilisateur (son nombre de cookies disponibles)
        await setCachedUser(user);
        setUser(user);
        setUpdate(true); // Mettre à jour la liste des cookies et des cassages
        Alert.alert("Réponse à un fortune cookie", "Votre réponse a été posée ! Si elle est découverte, vous serez averti !");
    } catch (error) {
        Alert.alert("Réponse à un fortune cookie", error?.message || error || "Une erreur s'est produite.");
    } finally {
        setLoading(false);
    }
}