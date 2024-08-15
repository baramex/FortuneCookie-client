import clsx from "clsx";
import { Pressable, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { BOMB_STATES } from "../../constants/bombs";
import { FullDate } from "../../components/miscellaneous/Time";

export default function BombOverlay({ bomb, defuse, type = "bomb", setShownBomb }) {
    return (<Pressable onPress={() => setShownBomb({ ...bomb, defuse })} className="flex flex-row w-full h-32 bg-zinc-100 rounded-lg overflow-hidden my-2">
        <MapView mapType="satellite" region={{ latitude: bomb.lat, longitude: bomb.lon, latitudeDelta: 1 / 50 * bomb.radius, longitudeDelta: 1 / 50 * bomb.radius }} className="w-1/3" pitchEnabled={false} scrollEnabled={false} rotateEnabled={false} zoomTapEnabled={false} zoomEnabled={false}>
            <Marker
                coordinate={{ latitude: bomb.lat, longitude: bomb.lon }}
            />
            <Circle
                center={{ latitude: bomb.lat, longitude: bomb.lon }}
                radius={bomb.radius * 1000}
                fillColor="rgba(255,0,0,.15)"
                strokeColor="darkred"
            />
            {type === "defuse" && <Marker
                pinColor="blue"
                coordinate={{ latitude: defuse.lat, longitude: defuse.lon }}
            />}
        </MapView>
        <View className="p-2 flex-1">
            <View className="flex flex-row items-center justify-between">
                <Text className="font-medium"><FullDate date={new Date(bomb.created_at)} /></Text>
                {type === "bomb" && <View className={clsx("rounded-lg px-2 py-1", BOMB_STATES[bomb.state].bgColor)}>
                    <Text className={BOMB_STATES[bomb.state].textColor}>{BOMB_STATES[bomb.state].text}</Text>
                </View>}
            </View>
            {bomb.reference && <View className="flex flex-row items-center mt-1">
                <Text className="text-zinc-600">Réponse à une bombe</Text>
            </View>}
            <Text className="text-zinc-900 truncate mt-1.5">{bomb.message}</Text>
        </View>
    </Pressable>);
}