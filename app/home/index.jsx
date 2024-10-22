import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, AppState, Pressable, ScrollView, Text, View } from "react-native";
import { getCachedUser, setCachedUser } from "../../scripts/cache";
import { Countdown } from "../../components/miscellaneous/Time";
import { ArrowPathIcon, PlantCookieIcon } from "../../components/miscellaneous/Icons";
import clsx from "clsx";
import { Accuracy, GeofencingEventType, getCurrentPositionAsync, hasStartedLocationUpdatesAsync, startGeofencingAsync, startLocationUpdatesAsync, stopGeofencingAsync, stopLocationUpdatesAsync, useBackgroundPermissions, useForegroundPermissions, watchPositionAsync } from "expo-location";
import { defineTask } from "expo-task-manager";
import { fromBreakageToCookie, getCookies } from "../../scripts/cookie";
import PlantCookieModal from "./PlantCookie";
import BreakCookieModal from "./BreakCookie";
import BrokenCookieModal from "./BrokenCookie";
import { getUserCookies, getUserBreakages } from "../../scripts/user";
import CookieOverlay from "./CookieOverlay";
import CookieModal from "./Cookie";
import { AndroidImportance, getPermissionsAsync, requestPermissionsAsync, scheduleNotificationAsync, setNotificationChannelAsync, setNotificationHandler } from "expo-notifications";

// Initialiser le système de notification
setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true
    }),
});

// Page d'accueil
export default function Home() {
    // Utilisateur mis en cache
    const [user, setUser] = useState(null);
    // Permission pour la position lorsque l'application est en premier plan
    const [fgLocationStatus, requestFgPermission] = useForegroundPermissions();
    // Permission pour la position en tout temps (aussi en arrière plan)
    const [locationStatus, requestPermission] = useBackgroundPermissions();
    // La tâche pour observer la position
    const [posJob, setPosJob] = useState(false);
    // État lorsque les cookies et cassages de l'utilisateur sont mis à jour
    const [update, setUpdate] = useState(true);
    // État lorsque les cookies à proximité sont mis à jour
    const [refreshCookies, setRefreshCookies] = useState(false);

    // Les cookies à proximité
    const [closeCookies, setCloseCookies] = useState(null);
    // Les cassages de l'utilisateur
    const [breakages, setBreakages] = useState(null);
    // Les cookies de l'utilisateur
    const [cookies, setCookies] = useState(null);

    // Afficher ou non la modal pour placer un cookie
    const [placeCookie, setPlaceCookie] = useState(false);
    // Cookie qui peut être cassé (modal)
    const [breakableCookie, setBreakableCookie] = useState(null);
    // Cookie cassé (modal)
    const [brokenCookie, setBrokenCookie] = useState(null);
    // Visualiser un cookie
    const [shownCookie, setShownCookie] = useState(null);

    // Mise à jour automatique toutes les 10 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            setUpdate(true);
        }, 1000 * 10);

        return () => clearInterval(interval);
    }, []);

    // Lorsque le cookie affiché est l'id du cookie (et non sa valeur) alors il est remplacé par sa valeur pour pouvoir être affiché (cas lorsqu'on clique sur "ce cookie" dans l'affichage d'un cookie)
    useEffect(() => {
        if (typeof shownCookie === "number") {
            if (cookies.some(b => b.id === shownCookie)) {
                setShownCookie(cookies.find(b => b.id === shownCookie));
            } else if (breakages.some(b => b.cookie_id === shownCookie)) {
                setShownCookie(fromBreakageToCookie(breakages.find(b => b.cookie_id === shownCookie), cookies));
            }
        }
    }, [shownCookie]);

    // Récupérer les cassages au début ou lorsqu'un nouveau cookie est cassé
    useEffect(() => {
        if (update) {
            setUpdate(false);
            getUserBreakages().then(d => setBreakages(d.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))));
        }
    }, [update]);

    // Récupérer les cookies au début ou lorsqu'un nouveau cookie est placé
    useEffect(() => {
        if (update) {
            setUpdate(false);
            getUserCookies().then(bo => setCookies(bo.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))));
        }
    }, [update]);

    // Mettre à jour le geofencing lorsque les cookies à proximité changent
    useEffect(() => {
        if (!closeCookies) return;
        if (closeCookies.length === 0) {
            hasStartedLocationUpdatesAsync("TASK_GEOFENCING").then(a => {
                if (a) {
                    stopGeofencingAsync("TASK_GEOFENCING");
                }
            });
        }
        else {
            startGeofencingAsync("TASK_GEOFENCING", closeCookies.map(a => ({ identifier: a.id.toString(), latitude: a.lat, longitude: a.lon, notifyOnExit: false, radius: a.radius * 1000 }))).catch(console.error);
        }
    }, [closeCookies]);

    // Lorsqu'un cookie est cassé, le retirer des cookies à proximité
    useEffect(() => {
        if (brokenCookie) {
            setCloseCookies(cookies => cookies.filter(b => b.id !== brokenCookie.cookieId));
        }
    }, [brokenCookie]);

    useEffect(() => {
        // Tâche lorsque le téléphone rentre dans la zone de portée d'un cookie
        defineTask("TASK_GEOFENCING", ({ data: { eventType, region }, error }) => {
            if (error) {
                console.error(error);
                return;
            }
            if (eventType === GeofencingEventType.Enter) {
                setBreakableCookie(region); // Ouvrir la fenêtre contextuelle pour le cassage d'un cookie
                if (AppState.currentState === "background") {
                    scheduleNotificationAsync({ // Envoyer une notification si l'application est en arrière plan
                        content: {
                            title: 'Fortune cookie trouvé !',
                            body: "Vous venez de rentrer dans la zone d'action d'un fortune cookie.",
                        },
                        trigger: null,
                    });
                }
            }
        });
    }, []);

    // Récupérer l'utilisateur en cache pour le mettre dans l'état "user"
    useEffect(() => {
        getCachedUser().then(setUser);
    }, []);

    // Récupérer la permission de position et lancer une tâche pour observer la position et récupérer les cookies à proximité lorsqu'elle change
    useEffect(() => {
        if (!fgLocationStatus || !locationStatus || posJob) return;
        if (fgLocationStatus.granted) {
            if (locationStatus.granted) {
                setPosJob(true);
                watchPositionAsync({ timeInterval: 10000, distanceInterval: 1000, accuracy: Accuracy.Balanced }, loc => {
                    // À chaque mise à jour de la position
                    getCookies(loc.coords.longitude, loc.coords.latitude).then(b => { // Requête au serveur pour récupérer les cookies à proximité
                        setCloseCookies(b);
                    }).catch(e => {
                        Alert.alert("Récupération des fortune cookies", e?.message || e || "Une erreur s'est produite.");
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

    // Actualiser la position et les cookies à proximité (de manière forcée)
    useEffect(() => {
        if (refreshCookies) {
            getCurrentPositionAsync({ accuracy: Accuracy.Balanced }).then(loc => {
                getCookies(loc.coords.longitude, loc.coords.latitude).then(b => {
                    setCloseCookies(b);
                }).catch(e => {
                    Alert.alert("Récupération des fortune cookies", e?.message || e || "Une erreur s'est produite.");
                }).finally(() => {
                    setRefreshCookies(false);
                });
            }).catch(e => {
                setRefreshCookies(false);
                Alert.alert("Récupération des fortune cookies", e?.message || e || "Une erreur s'est produite.");
            });
        }
    }, [refreshCookies]);

    // Demander la permission d'envoyer des notifications et configurer un canal de notification
    useEffect(() => {
        (async () => {
            const { status: existingStatus } = await getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await requestPermissionsAsync();
                finalStatus = status;
            }
            else {
                await setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: AndroidImportance.DEFAULT,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        });
    }, []);

    // Date pour récupérer un cookie supplémentaire
    const newDayDate = new Date();
    newDayDate.setUTCHours(0, 0, 0, 0);
    newDayDate.setUTCDate(newDayDate.getUTCDate() + 1);

    // Décrit si les deux types de position sont acceptés
    const locationEnabled = fgLocationStatus?.granted && locationStatus?.granted;

    // Visuel: page d'accueil contenant toutes les fenêtres contextuelles (initialement non utilisées/ouvertes), ainsi que la liste des cookies et des cassages, le nom d'utilisateur, le nombre de cookies disponibles, le nombre de cookies dans un rayon de 5 km ainsi qu'un bouton pour poser un cookie
    return (<View className={clsx("mt-6 flex-1 flex items-center", (!user || !locationEnabled) && "justify-center")}>
        {user ? !locationEnabled ?
            <Text className="text-2xl">Veuillez autoriser la localisation pour continuer.</Text>
            : <>
                <PlantCookieModal setUpdate={setUpdate} setUser={setUser} visible={placeCookie} setVisible={setPlaceCookie} />
                <BreakCookieModal setUpdate={setUpdate} cookie={breakableCookie} setCookie={setBreakableCookie} setBrokenCookie={setBrokenCookie} />
                <BrokenCookieModal setUpdate={setUpdate} brokenCookie={brokenCookie} setBrokenCookie={setBrokenCookie} setUser={setUser} />
                <CookieModal setUpdate={setUpdate} setUser={setUser} breakage={shownCookie && breakages.find(a => a.cookie_id === shownCookie.id)} reply={shownCookie && shownCookie.reply_id ? breakages.some(a => a.cookie_id === shownCookie.reply_id) ? fromBreakageToCookie(breakages.find(a => a.cookie_id === shownCookie.reply_id), cookies) : cookies.find(b => b.id === shownCookie.reply_id) : undefined} cookie={shownCookie} setCookie={setShownCookie} />
                <Text className="text-2xl">Bonjour {user?.username}</Text>
                <Text className="mt-2 text-zinc-700">Vous avez <Text className="bg-zinc-600 text-white"> {user?.remaining_cookies} </Text> /3 fortune cookies restants.</Text>
                {user?.remaining_cookies < 3 && <View className="rounded-full bg-red-600 px-4 py-1 mt-2"><Text className="text-xs text-white font-medium">+1 dans <Countdown run={() => {
                    user.remaining_cookies++;
                    setUser(user);
                    setCachedUser(user);
                }} date={newDayDate} /></Text></View>}
                <Pressable onPress={() => setPlaceCookie(true)} className={clsx("rounded-md mt-5 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center", user?.remaining_cookies <= 0 ? "bg-zinc-500" : "bg-zinc-700")} disabled={user?.remaining_cookies <= 0}>
                    <PlantCookieIcon className={clsx("w-6 h-6", user?.remaining_cookies <= 0 ? "fill-zinc-300" : "fill-white")} />
                    <Text className={user?.remaining_cookies <= 0 ? "text-zinc-300" : "text-white"}>Placer un fortune cookie</Text>
                </Pressable>
                <Text className="mt-2 text-zinc-900">Il y a <Text className="bg-zinc-600 text-white"> {closeCookies?.length} </Text> fortune cookies dans un rayon de 5 km.</Text>
                <Pressable onPress={() => { setRefreshCookies(true); setUpdate(true); }} className={clsx("rounded-md mt-4 text-xl px-6 py-2 flex flex-row gap-x-2 justify-center items-center", refreshCookies ? "bg-zinc-500" : "bg-zinc-700")} disabled={refreshCookies}>
                    <ArrowPathIcon className={clsx("w-6 h-6", refreshCookies ? "text-zinc-300" : "text-white")} />
                    <Text className={refreshCookies ? "text-zinc-300" : "text-white"}>Actualiser</Text>
                </Pressable>
                <ScrollView className="w-full mt-6 px-4 pb-4">
                    <View className="pb-4">
                        <Text className="text-3xl mb-1">Vos fortune cookies</Text>
                        <View>
                            {cookies ? cookies.length === 0 ? <Text className="text-zinc-600 mx-auto">Aucun</Text> : cookies.map(b => <CookieOverlay key={b.id} setShownCookie={setShownCookie} cookie={b} />) : <ActivityIndicator />}
                        </View>
                    </View>
                    <View>
                        <Text className="text-3xl mb-1">Vos cassages de cookies</Text>
                        <View>
                            {breakages ? breakages.length === 0 ? <Text className="text-zinc-600 mx-auto">Aucun</Text> : breakages.map(d => <CookieOverlay key={d.id} setShownCookie={setShownCookie} type="breakage" breakage={d} cookie={fromBreakageToCookie(d, cookies)} />) : <ActivityIndicator />}
                        </View>
                    </View>
                </ScrollView>
            </>
            : <ActivityIndicator size="large" />
        }
    </View>);
}