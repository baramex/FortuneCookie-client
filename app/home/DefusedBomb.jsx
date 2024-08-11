import { useState } from "react";
import { Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { DefuseBombIcon, XMarkIcon } from "../../components/miscellaneous/Icons";

export default function DefusedBombModal({ defusedBomb, setDefusedBomb }) {
    const [loading, setLoading] = useState(false);

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
                    <Pressable onPress={() => { }} className="rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center">
                        <DefuseBombIcon className="w-9 h-9 fill-white" />
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