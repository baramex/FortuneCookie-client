import clsx from "clsx";
import { Pressable, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { COOKIE_STATES } from "../../constants/cookies";
import { FullDate } from "../../components/miscellaneous/Time";

export default function CookieOverlay({ cookie, breakage, type = "cookie", setShownCookie }) {
    // les états cookie, breakage, type et setShownCookie proviennent de l'appel de cette vue (dans index.js)

    // Visuel: correspond à une div/bouton contenant une petite intégration d'une carte ainsi que les doonées principales d'un cookie (état, s'il a été répondu)
    return (<Pressable onPress={() => setShownCookie(cookie)} className="flex flex-row w-full h-28 bg-zinc-100 rounded-lg overflow-hidden my-2">
        <MapView provider={PROVIDER_GOOGLE} mapType="satellite" region={{ latitude: cookie.lat, longitude: cookie.lon, latitudeDelta: 1 / 50 * cookie.radius, longitudeDelta: 1 / 50 * cookie.radius }} className="w-1/3" pitchEnabled={false} scrollEnabled={false} rotateEnabled={false} zoomTapEnabled={false} zoomEnabled={false}>
            <Marker
                coordinate={{ latitude: cookie.lat, longitude: cookie.lon }}
            />
            <Circle
                center={{ latitude: cookie.lat, longitude: cookie.lon }}
                radius={cookie.radius * 1000}
                fillColor="rgba(255,0,0,.15)"
                strokeColor="darkred"
            />
            {type === "breakage" && <Marker
                pinColor="blue"
                coordinate={{ latitude: breakage.lat, longitude: breakage.lon }}
            />}
        </MapView>
        <View className="p-2 flex-1">
            <View className="flex flex-row items-center justify-between">
                <Text className="font-medium"><FullDate date={new Date(cookie.created_at)} /></Text>
                {type === "cookie" && <View className={clsx("rounded-lg px-2 py-1", COOKIE_STATES[cookie.state].bgColor)}>
                    <Text className={COOKIE_STATES[cookie.state].textColor}>{COOKIE_STATES[cookie.state].text}</Text>
                </View>}
            </View>
            {cookie.reference && <View className="flex flex-row items-center mt-1">
                <Text className="text-zinc-600 italic">Réponse à un fortune cookie</Text>
            </View>}
            {(cookie.reply_id && type === "breakage") && <View className="flex flex-row items-center mt-1">
                <Text className="text-zinc-600 italic">Vous y avez répondu</Text>
            </View>}
            <Text className="text-zinc-900 truncate mt-1.5">{cookie.message}</Text>
        </View>
    </Pressable>);
}