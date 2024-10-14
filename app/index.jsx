import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { CircleArrowIcon } from '../components/miscellaneous/Icons';
import { useEffect, useState } from 'react';
import { isAuthenticated, register } from '../scripts/authentification';
import { getUser } from '../scripts/user';
import { setCachedUser } from '../scripts/cache';
import { useRouter } from 'expo-router';

export default function App({ }) {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const router = useRouter();

    // Vérifier si l'utilisateur a déjà un compte -> récupération du token et vérification avec le serveur
    useEffect(() => {
        (async () => {
            try {
                if (await isAuthenticated()) { // Si une clé est enregistrée dans les fichiers de l'application
                    const user = await getUser(); // Récupérer l'utilisateur avec cette clé
                    await setCachedUser(user);
                }
                else {
                    setLoading(false);
                    return;
                }
            } catch (error) {
                return showAlert();
            }

            router.replace("/home");
        })();
    }, []);

    // Visuel: titre bienvenue avec un champ pour le nom d'utilisateur et un bouton pour continuer
    return (
        <View className="flex-1 items-center justify-center">
            {loading ?
                <ActivityIndicator size="large" />
                : <>
                    <Text className="text-2xl">Bienvenue</Text>
                    <TextInput onChangeText={setUsername} defaultValue={username} placeholder="Entrez votre nom d'utilisateur" className="border-2 border-zinc-300 mt-3 px-4 py-1.5 rounded-md" />
                    <Pressable onPress={() => onRegister(setLoading, username, router)} className="flex flex-row gap-x-2 items-center justify-center py-1.5 px-4 mt-2">
                        <CircleArrowIcon className="w-6 h-6 text-black" />
                        <Text>Continuer</Text>
                    </Pressable>
                </>}
        </View>
    );
}

// Afficher une erreur d'authentification (à l'infini)
function showAlert() {
    Alert.alert('Authentification', "Une erreur inattendue s'est produite, merci de réessayer ultérieurement.", [{
        text: 'OK',
        onPress: showAlert
    }], { cancelable: false });
}

// Lorsqu'un utilisateur crée son compte
async function onRegister(setLoading, username, router) {
    setLoading(true);
    try {
        const user = await register(username); // Envoyer au serveur la création d'un compte
        await setCachedUser(user); // Enregistrer localement l'utilisateur
        router.replace("/home"); // Se diriger vers la page d'accueil
    } catch (error) {
        setLoading(false);
        Alert.alert('Création de compte', error?.message || error || "Une erreur s'est produite.");
    }
}