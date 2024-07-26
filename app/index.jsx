import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ArrowCircleRightIcon } from 'react-native-heroicons/solid';

export default function App() {
    return (
        <View className="flex-1 bg-white items-center justify-center">
            <Text>Bienvenue</Text>
            <TextInput placeholder="Entrez votre nom d'utilisateur" className="border-2 border-gray-300" />
            <Pressable>
                <ArrowCircleRightIcon className="w-5 text-gray-300" />
                <Text>Continuer</Text>
            </Pressable>
            <StatusBar style="auto" />
        </View>
    );
}