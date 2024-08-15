import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { BOMB_RADIUS, BOMB_STATES } from "../../constants/bombs";
import { FullDate } from "../../components/miscellaneous/Time";
import { XMarkIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";

export default function BombModal({ bomb, setBomb }) {
    return (<Modal
        animationType="slide"
        visible={!!bomb}
        onRequestClose={() => {
            setBomb(null);
        }}>
        {!bomb || typeof bomb !== "object" ? <ActivityIndicator className="flex justify-center h-full" size="large" /> :
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
                        {bomb.defuse && <Marker
                            pinColor="blue"
                            coordinate={{ latitude: bomb.defuse.lat, longitude: bomb.defuse.lon }}
                        />}
                    </MapView>
                    <View className="flex flex-row justify-between my-2 items-start">
                        <View>
                            <Text className="text-zinc-800 mb-1">Rayon: {BOMB_RADIUS.find(a => a.value === bomb.radius).name}</Text>
                            <Text className="text-zinc-800">Placée le <FullDate date={new Date(bomb.created_at)} /></Text>
                            {bomb.defuse && <Text className="mt-1 text-zinc-800">Désamorcée le <FullDate date={new Date(bomb.defuse.created_at)} /></Text>}
                        </View>
                        {!bomb.defuse && <View className={clsx("rounded-lg px-4 py-1", BOMB_STATES[bomb.state].bgColor)}>
                            <Text className={clsx(BOMB_STATES[bomb.state].textColor, "text-lg")}>{BOMB_STATES[bomb.state].text}</Text>
                        </View>}
                    </View>
                    {bomb.reference && <View className="flex flex-row items-center mt-3">
                        <Text className="text-lg">Réponse à</Text>
                        <Pressable className="px-1.5 ml-1 bg-zinc-700 rounded-lg"><Pressable onPress={() => setBomb(bomb.reference)}><Text className="text-white text-lg">Cette bombe</Text></Pressable></Pressable>
                    </View>}
                    <Text className="text-xl mt-3">Message</Text>
                    <Text className="text-zinc-700 text-lg">{bomb.message}</Text>
                    <Pressable onPress={() => setBomb(null)} className="mx-auto my-6">
                        <Text className="underline text-zinc-700">Fermer</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        }
    </Modal >);
}