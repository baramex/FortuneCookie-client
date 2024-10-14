import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { PlantCookieIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { replyCookie } from "../../scripts/cookie";
import { setCachedUser } from "../../scripts/cache";
import { getUser } from "../../scripts/user";

export default function BrokenCookieModal({ brokenCookie, setBrokenCookie, setUser, setUpdate }) {
    // les états brokenCookie, setBrokenCookie, setUser et setUpdate proviennent de l'appel de cette vue (dans index.js)
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Visuel: fenêtre contextuelle avec un fortune cookie cassé, son message, et la possibilité d'y répondre
    return (<Modal
        animationType="none"
        visible={!!brokenCookie}
        onRequestClose={() => {
            setBrokenCookie(null);
        }}>
        {loading ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <SafeAreaView>
                <ScrollView className="px-4">
                    <View className="flex flex-row justify-between items-center mb-5 mt-6">
                        <Text className="text-3xl">Fortune cookie cassé 🔨 !!</Text>
                        <Pressable onPress={() => setBrokenCookie(null)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    </View>
                    <Text className="text-xl">Message</Text>
                    <Text className="text-zinc-700 text-lg">{brokenCookie?.message}</Text>
                    <Text className="text-xl mt-4">Votre réponse (optionnel)</Text>
                    <TextInput className="p-2 border-zinc-400 my-3 border rounded-md h-32 text-lg" multiline={true} numberOfLines={6} onChangeText={setMessage} defaultValue={message} maxLength={4096} />
                    <Text className="text-zinc-500">Répondre à un fortune cookie replacera un cookie du même rayon à l'emplacement de découverte.</Text>
                    <Pressable onPress={() => reply(brokenCookie, message, setLoading, setMessage, setUser, setBrokenCookie, setUpdate)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                        <PlantCookieIcon className="w-9 h-9 fill-white" />
                        <Text className="text-white text-xl">Répondre</Text>
                    </Pressable>
                    <Pressable onPress={() => setBrokenCookie(null)} className="mx-auto mt-4 mb-6">
                        <Text className="underline text-zinc-700">Fermer</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        }
    </Modal >);
}

// Fonction lorsque le bouton répondre est appuyé
async function reply(brokenCookie, message, setLoading, setMessage, setUser, setBrokenCookie, setUpdate) {
    setLoading(true); // Animation de chargement
    try {
        await replyCookie(brokenCookie.cookieId, message); // Envoyer au serveur la réponse au cookie
        setBrokenCookie(null); // Fermer la fenêtre contextuelle
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