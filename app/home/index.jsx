import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getCachedUser } from "../../scripts/cache";
import Countdown from "../../components/miscellaneous/Time";
import { DropBombIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";
import { Accuracy, hasStartedLocationUpdatesAsync, startLocationUpdatesAsync, useBackgroundPermissions, useForegroundPermissions, watchPositionAsync } from "expo-location";

export default function Home() {
    const [user, setUser] = useState(null);
    const [fgLocationStatus, requestFgPermission] = useForegroundPermissions();
    const [locationStatus, requestPermission] = useBackgroundPermissions();

    useEffect(() => {
        getCachedUser().then(setUser);
    }, []);

    useEffect(() => {
        if (!fgLocationStatus || !locationStatus) return;
        if (fgLocationStatus.granted) {
            if (locationStatus.granted) {
                hasStartedLocationUpdatesAsync("TASK_FETCH_LOCATION").then(b => {
                    if (!b) startLocationUpdatesAsync("TASK_FETCH_LOCATION", { timeInterval: 30000, distanceInterval: 250, accuracy: Accuracy.Balanced });
                });
            }
            else {
                console.log("request");
                requestPermission();
            }
        }
        else {
            console.log("request fg");
            requestFgPermission();
        }
    }, [fgLocationStatus, locationStatus]);

    const newDayDate = new Date();
    newDayDate.setUTCHours(0, 0, 0, 0);
    newDayDate.setUTCDate(newDayDate.getUTCDate() + 1);

    const locationEnabled = fgLocationStatus?.granted && locationStatus?.granted;

    return (<View className={clsx("mt-12 flex-1 flex items-center", (!user || !locationEnabled) && "justify-center")}>
        {user ? !locationEnabled ?
            <Text className="text-2xl">Veuillez autoriser la localisation pour continuer.</Text>
            : <>
                <Text className="text-2xl">Bonjour {user?.username}</Text>
                <Text className=" mt-2 text-zinc-700">Vous avez <Text className="bg-zinc-600 text-white"> {user?.remaining_bombs} </Text> /3 bombes restantes.</Text>
                {user?.remaining_bombs < 3 && <View className="rounded-full bg-red-600 px-4 py-1 mt-1"><Text className="text-xs text-white font-medium">+1 dans <Countdown date={newDayDate} /></Text></View>}
                <Pressable className={clsx("rounded-md bg-zinc-700 mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center", user?.remaining_bombs <= 0 && "bg-zinc-500")} disabled={user?.remaining_bombs <= 0}>
                    <DropBombIcon className={clsx("w-6 h-6 fill-white", user?.remaining_bombs <= 0 && "fill-zinc-300")} />
                    <Text className={clsx("text-white", user?.remaining_bombs <= 0 && "text-zinc-300")}>Placer une bombe</Text>
                </Pressable>
            </>
            : <ActivityIndicator size="large" />
        }
    </View>);
}