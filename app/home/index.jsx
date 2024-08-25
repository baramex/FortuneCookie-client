import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, View } from "react-native";
import { getCachedUser, setCachedUser } from "../../scripts/cache";
import { Countdown } from "../../components/miscellaneous/Time";
import { ArrowPathIcon, DropBombIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";
import { Accuracy, GeofencingEventType, getCurrentPositionAsync, hasStartedLocationUpdatesAsync, startGeofencingAsync, startLocationUpdatesAsync, stopGeofencingAsync, stopLocationUpdatesAsync, useBackgroundPermissions, useForegroundPermissions, watchPositionAsync } from "expo-location";
import { defineTask } from "expo-task-manager";
import { fromDefuseToBomb, getBombs } from "../../scripts/bomb";
import PlaceBombModal from "./PlaceBomb";
import DefuseBombModal from "./DefuseBomb";
import DefusedBombModal from "./DefusedBomb";
import { getUserBombs, getUserDefuses } from "../../scripts/user";
import BombOverlay from "./BombOverlay";
import BombModal from "./Bomb";
import PushNotification from "react-native-push-notification";

export default function Home() {
    const [user, setUser] = useState(null);
    const [fgLocationStatus, requestFgPermission] = useForegroundPermissions();
    const [locationStatus, requestPermission] = useBackgroundPermissions();
    // La tâche pour observer la position
    const [posJob, setPosJob] = useState(false);
    const [update, setUpdate] = useState(true);
    const [refreshBombs, setRefreshBombs] = useState(false);

    // Les bombes à proximité
    const [closeBombs, setCloseBombs] = useState(null);
    // Les désamorçages de l'utilisateur
    const [defuses, setDefuses] = useState(null);
    // Les bombes de l'utilisateur
    const [bombs, setBombs] = useState(null);

    // Afficher ou non la modal pour placer une bombe
    const [placeBomb, setPlaceBomb] = useState(false);
    // Bome qui peut être désarmocée (modal)
    const [defuseBomb, setDefuseBomb] = useState(null);
    // Bombe désarmocée (modal)
    const [defusedBomb, setDefusedBomb] = useState(null);
    // Visualiser une bombe
    const [shownBomb, setShownBomb] = useState(null);

    useEffect(() => {
        if (typeof shownBomb === "number") {
            if (bombs.some(b => b.id === shownBomb)) {
                setShownBomb(bombs.find(b => b.id === shownBomb));
            } else if (defuses.some(b => b.bomb_id === shownBomb)) {
                setShownBomb(fromDefuseToBomb(defuses.find(b => b.bomb_id === shownBomb), bombs));
            }
        }
    }, [shownBomb]);

    // Récupérer les désarmoçages au début ou lorsqu'une nouvelle bombe est désarmocée
    useEffect(() => {
        if (update) {
            setUpdate(false);
            getUserDefuses().then(d => setDefuses(d.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))));
        }
    }, [update]);

    // Récupérer les bombes au début ou lorsqu'une noubelle bombe est placée
    useEffect(() => {
        if (update) {
            setUpdate(false);
            getUserBombs().then(bo => setBombs(bo.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))));
        }
    }, [update]);

    // Mettre à jour le geofencing lorsque les bombes à proximité changent
    useEffect(() => {
        if (!closeBombs) return;
        if (closeBombs.length === 0) {
            hasStartedLocationUpdatesAsync("TASK_GEOFENCING").then(a => {
                if (a) {
                    stopGeofencingAsync("TASK_GEOFENCING");
                }
            });
        }
        else {
            startGeofencingAsync("TASK_GEOFENCING", closeBombs.map(a => ({ identifier: a.id.toString(), latitude: a.lat, longitude: a.lon, notifyOnExit: false, radius: a.radius * 1000 }))).catch(console.error);
        }
    }, [closeBombs]);

    // Lorsqu'une bombe est désarmocée, la retirer des bombes à proximité
    useEffect(() => {
        if (defusedBomb) {
            setCloseBombs(bombs => bombs.filter(b => b.id !== defusedBomb.bombId));
        }
    }, [defusedBomb]);

    useEffect(() => {
        // Tâche lorsque le téléphone rentre dans la zone de portée d'une bombe
        defineTask("TASK_GEOFENCING", ({ data: { eventType, region }, error }) => {
            if (error) {
                console.error(error);
                return;
            }
            if (eventType === GeofencingEventType.Enter) {
                // background: envoyer notification
                // foreground: afficher popup
                setDefuseBomb(region);
                console.log("enter", region);
                console.log(AppState.currentState);
                if (AppState.currentState === "background") {
                    PushNotification.localNotification({
                        title: 'Bombe trouvée !',
                        playSound: true,
                        soundName: 'default',
                    });
                }
            }
        });
    }, []);

    // Configurer le système de notification
    useEffect(() => {
        PushNotification.configure({
            onNotification: notification => console.log(notification),

            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
        });
    }, []);

    useEffect(() => {
        getCachedUser().then(setUser);
    }, []);

    // Récupérer la permission de position et lancer une tâche pour observer la position et récupérer les bombes à proximité lorsqu'elle change
    useEffect(() => {
        if (!fgLocationStatus || !locationStatus || posJob) return;
        if (fgLocationStatus.granted) {
            if (locationStatus.granted) {
                setPosJob(true);
                watchPositionAsync({ timeInterval: 60000, distanceInterval: 1000, accuracy: Accuracy.Balanced }, loc => {
                    getBombs(loc.coords.longitude, loc.coords.latitude).then(b => {
                        setCloseBombs(b);
                    }).catch(e => {
                        Alert.alert("Récupération des bombes", e?.message || e || "Une erreur s'est produite.");
                    });
                });
            }
            else {
                requestPermission();
            }
        }
        else {
            requestFgPermission();
        }
    }, [fgLocationStatus, locationStatus]);

    // Actualiser la position et les bombes à proximité
    useEffect(() => {
        if (refreshBombs) {
            getCurrentPositionAsync({ accuracy: Accuracy.Balanced }).then(loc => {
                getBombs(loc.coords.longitude, loc.coords.latitude).then(b => {
                    setCloseBombs(b);
                }).catch(e => {
                    Alert.alert("Récupération des bombes", e?.message || e || "Une erreur s'est produite.");
                }).finally(() => {
                    setRefreshBombs(false);
                });
            }).catch(e => {
                setRefreshBombs(false);
                Alert.alert("Récupération des bombes", e?.message || e || "Une erreur s'est produite.");
            });
        }
    }, [refreshBombs])

    console.log(bombs);
    console.log(defuses);

    // Date pour récupérer une bombe supplémentaire
    const newDayDate = new Date();
    newDayDate.setUTCHours(0, 0, 0, 0);
    newDayDate.setUTCDate(newDayDate.getUTCDate() + 1);

    const locationEnabled = fgLocationStatus?.granted && locationStatus?.granted;

    return (<View className={clsx("mt-6 flex-1 flex items-center", (!user || !locationEnabled) && "justify-center")}>
        {user ? !locationEnabled ?
            <Text className="text-2xl">Veuillez autoriser la localisation pour continuer.</Text>
            : <>
                <PlaceBombModal setUpdate={setUpdate} setUser={setUser} visible={placeBomb} setVisible={setPlaceBomb} />
                <DefuseBombModal setUpdate={setUpdate} bomb={defuseBomb} setBomb={setDefuseBomb} setDefusedBomb={setDefusedBomb} />
                <DefusedBombModal setUpdate={setUpdate} defusedBomb={defusedBomb} setDefusedBomb={setDefusedBomb} setUser={setUser} />
                <BombModal setUpdate={setUpdate} setUser={setUser} defuse={shownBomb && defuses.find(a => a.bomb_id === shownBomb.id)} reply={shownBomb && shownBomb.reply_id ? defuses.some(a => a.bomb_id === shownBomb.reply_id) ? fromDefuseToBomb(defuses.find(a => a.bomb_id === shownBomb.reply_id), bombs) : bombs.find(b => b.id === shownBomb.reply_id) : undefined} bomb={shownBomb} setBomb={setShownBomb} />
                <Text className="text-2xl">Bonjour {user?.username}</Text>
                <Text className="mt-2 text-zinc-700">Vous avez <Text className="bg-zinc-600 text-white"> {user?.remaining_bombs} </Text> /3 bombes restantes.</Text>
                {user?.remaining_bombs < 3 && <View className="rounded-full bg-red-600 px-4 py-1 mt-2"><Text className="text-xs text-white font-medium">+1 dans <Countdown run={() => {
                    user.remaining_bombs++;
                    setUser(user);
                    setCachedUser(user);
                }} date={newDayDate} /></Text></View>}
                <Pressable onPress={() => setPlaceBomb(true)} className={clsx("rounded-md mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center", user?.remaining_bombs <= 0 ? "bg-zinc-500" : "bg-zinc-700")} disabled={user?.remaining_bombs <= 0}>
                    <DropBombIcon className={clsx("w-6 h-6", user?.remaining_bombs <= 0 ? "fill-zinc-300" : "fill-white")} />
                    <Text className={user?.remaining_bombs <= 0 ? "text-zinc-300" : "text-white"}>Placer une bombe</Text>
                </Pressable>
                <Text className="mt-2 text-zinc-900">Il y a <Text className="bg-zinc-600 text-white"> {closeBombs?.length} </Text> bombes dans un rayon de 5 km.</Text>
                <Pressable onPress={() => setRefreshBombs(true)} className={clsx("rounded-md mt-4 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center", refreshBombs ? "bg-zinc-500" : "bg-zinc-700")} disabled={refreshBombs}>
                    <ArrowPathIcon className={clsx("w-6 h-6", refreshBombs ? "text-zinc-300" : "text-white")} />
                    <Text className={refreshBombs ? "text-zinc-300" : "text-white"}>Actualiser</Text>
                </Pressable>
                <View className="w-full mt-6 px-4 flex-1 pb-4">
                    <View className="h-1/2 pb-4">
                        <Text className="text-3xl mb-1">Vos bombes</Text>
                        <ScrollView>
                            {bombs ? bombs.length === 0 ? <Text className="text-zinc-600 mx-auto">Aucune</Text> : bombs.map(b => <BombOverlay key={b.id} setShownBomb={setShownBomb} bomb={b} />) : <ActivityIndicator />}
                        </ScrollView>
                    </View>
                    <View className="h-1/2">
                        <Text className="text-3xl mb-1">Vos désamorçages</Text>
                        <ScrollView>
                            {defuses ? defuses.length === 0 ? <Text className="text-zinc-600 mx-auto">Aucun</Text> : defuses.map(d => <BombOverlay key={d.id} setShownBomb={setShownBomb} type="defuse" defuse={d} bomb={fromDefuseToBomb(d, bombs)} />) : <ActivityIndicator />}
                        </ScrollView>
                    </View>
                </View>
            </>
            : <ActivityIndicator size="large" />
        }
    </View>);
}