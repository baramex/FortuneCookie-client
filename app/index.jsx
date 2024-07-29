import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { CircleArrowIcon } from '../components/miscellaneous/Icons';
import { useEffect, useRef, useState } from 'react';
import { isAuthenticated, register } from '../scripts/authentification';
import { getUser } from '../scripts/user';
import { clearCachedSession, setCachedUser } from '../scripts/cache';

export default function App({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");

    useEffect(() => {
        (async () => {
            if (await isAuthenticated()) {
                const user = await getUser();
                if (!user) await clearCachedSession();
                await setCachedUser(user);
                navigation.navigate("Home");
            }
            else {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <View className="flex-1 items-center justify-center">
            {loading ?
                <ActivityIndicator size="large" />
                : <>
                    <Text className="text-2xl">Bienvenue</Text>
                    <TextInput onChangeText={setUsername} defaultValue={username} placeholder="Entrez votre nom d'utilisateur" className="border-2 border-gray-300 mt-3 px-4 py-1.5 rounded-md" />
                    <Pressable onPress={() => onRegister(setLoading, username, navigation)} className="flex flex-row gap-x-2 items-center justify-center py-1.5 px-4 mt-2">
                        <CircleArrowIcon className="w-6 h-6 text-black" />
                        <Text>Continuer</Text>
                    </Pressable>
                </>}
        </View>
    );
}

async function onRegister(setLoading, username, navigation) {
    setLoading(true);
    try {
        const user = await register(username);
        await setCachedUser(user);
        navigation.navigate("Home");
    } catch (error) {
        setLoading(false);
        Alert.alert('Création de compte', error.message || error || "Une erreur s'est produite.");
    }
}