import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { getCachedUser } from "../../scripts/cache";
import Countdown from "../../components/miscellaneous/Time";
import { DropBombIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";
import { Accuracy, GeofencingEventType, hasStartedLocationUpdatesAsync, startGeofencingAsync, startLocationUpdatesAsync, stopGeofencingAsync, stopLocationUpdatesAsync, useBackgroundPermissions, useForegroundPermissions, watchPositionAsync } from "expo-location";
import { defineTask } from "expo-task-manager";
import { getBombs } from "../../scripts/bomb";
import PlaceABombModal from "./PlaceABomb";

/*defineTask("TASK_FETCH_LOCATION", ({ data: { locations }, error }) => {
    if (error) {
        console.log(error);
        return;
    }
    console.log('Received new locations', locations);

    getBombs(locations[0].coords.longitude, locations[0].coords.latitude).then(b => {
        setCloseBombs(b);
    });
});*/

export default function Home() {
    const [user, setUser] = useState(null);
    const [fgLocationStatus, requestFgPermission] = useForegroundPermissions();
    const [locationStatus, requestPermission] = useBackgroundPermissions();
    const [closeBombs, setCloseBombs] = useState(null);

    const [placeABomb, setPlaceABomb] = useState(false);

    useEffect(() => {
        getCachedUser().then(setUser);
    }, []);

    useEffect(() => {
        if (!fgLocationStatus || !locationStatus) return;
        if (fgLocationStatus.granted) {
            watchPositionAsync({ timeInterval: 30000, distanceInterval: 500, accuracy: Accuracy.Balanced }, loc => {
                getBombs(loc.coords.longitude, loc.coords.latitude).then(b => {
                    setCloseBombs(b);

                    if (b.length === 0) {
                        hasStartedLocationUpdatesAsync("TASK_GEOFENCING").then(a => {
                            if (a) {
                                stopGeofencingAsync("TASK_GEOFENCING");
                            }
                        })
                    }
                    else startGeofencingAsync("TASK_GEOFENCING", b.map(a => ({ identifier: a.id, latitude: a.lat, longitude: a.lon, notifyOnExit: false, radius: a.radius })));
                });
            });
            if (locationStatus.granted) {
                /*hasStartedLocationUpdatesAsync("TASK_FETCH_LOCATION").then(b => {
                    if (!b) {
                        startLocationUpdatesAsync("TASK_FETCH_LOCATION", { timeInterval: 30000, distanceInterval: 500, accuracy: Accuracy.Balanced });
                    }
                });*/
            }
            else {
                requestPermission();
            }
        }
        else {
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
                <PlaceABombModal visible={placeABomb} setVisible={setPlaceABomb} />
                <Text className="text-2xl">Bonjour {user?.username}</Text>
                <Text className="mt-2 text-zinc-700">Vous avez <Text className="bg-zinc-600 text-white"> {user?.remaining_bombs} </Text> /3 bombes restantes.</Text>
                {user?.remaining_bombs < 3 && <View className="rounded-full bg-red-600 px-4 py-1 mt-1"><Text className="text-xs text-white font-medium">+1 dans <Countdown date={newDayDate} /></Text></View>}
                <Pressable onPress={() => setPlaceABomb(true)} className={clsx("rounded-md mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center", user?.remaining_bombs <= 0 ? "bg-zinc-500" : "bg-zinc-700")} disabled={user?.remaining_bombs <= 0}>
                    <DropBombIcon className={clsx("w-6 h-6", user?.remaining_bombs <= 0 ? "fill-zinc-300" : "fill-white")} />
                    <Text className={user?.remaining_bombs <= 0 ? "text-zinc-300" : "text-white"}>Placer une bombe</Text>
                </Pressable>
                <Text className="mt-2 text-zinc-900">Il y a <Text className="bg-zinc-600 text-white"> {closeBombs?.length} </Text> bombes dans un rayon d'1 km.</Text>
            </>
            : <ActivityIndicator size="large" />
        }
    </View>);
}

// Tâche lorsque le téléphone rentre dans la zone de portée d'une bombe
defineTask("TASK_GEOFENCING", ({ data: { eventType, region }, error }) => {
    if (error) {
        console.error(error);
        return;
    }
    if (eventType === GeofencingEventType.Enter) {
        // background: envoyer notification
        // foreground: afficher popup
        console.log("enter", region);
    }
});