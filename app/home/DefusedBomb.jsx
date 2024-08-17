import { useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { DropBombIcon, XMarkIcon } from "../../components/miscellaneous/Icons";
import { replyBomb } from "../../scripts/bomb";
import { setCachedUser } from "../../scripts/cache";
import { getUser } from "../../scripts/user";

export default function DefusedBombModal({ defusedBomb, setDefusedBomb, setUser, setUpdate }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    return (<Modal
        animationType="none"
        visible={!!defusedBomb}
        onRequestClose={() => {
            setDefusedBomb(null);
        }}>
        {loading ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
            <SafeAreaView>
                <ScrollView className="px-4">
                    <View className="flex flex-row justify-between items-center mb-5 mt-6">
                        <Text className="text-3xl">Bombe désarmocée</Text>
                        <Pressable onPress={() => setDefusedBomb(null)}>
                            <XMarkIcon className="h-6 w-6 text-black" />
                        </Pressable>
                    </View>
                    <Text className="text-xl">Message</Text>
                    <Text className="text-zinc-700 text-lg">{defusedBomb?.message}</Text>
                    <Text className="text-xl mt-4">Votre réponse (optionnel)</Text>
                    <TextInput className="p-2 border-zinc-400 my-3 border rounded-md h-32 text-lg" multiline={true} numberOfLines={6} onChangeText={setMessage} defaultValue={message} maxLength={4096} />
                    <Text className="text-zinc-500">Répondre à une bombe replacera une bombe du même rayon à l'emplacement de découverte.</Text>
                    <Pressable onPress={() => reply(defusedBomb, message, setLoading, setMessage, setUser, setDefusedBomb, setUpdate)} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                        <DropBombIcon className="w-9 h-9 fill-white" />
                        <Text className="text-white text-xl">Répondre</Text>
                    </Pressable>
                    <Pressable onPress={() => setDefusedBomb(null)} className="mx-auto mt-4 mb-6">
                        <Text className="underline text-zinc-700">Fermer</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        }
    </Modal >);
}

async function reply(defusedBomb, message, setLoading, setMessage, setUser, setDefusedBomb, setUpdate) {
    setLoading(true);
    try {
        await replyBomb(defusedBomb.bombId, message);
        setDefusedBomb(null);
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