import { StatusBar, View } from "react-native";
import Header from "../components/layout/Header";
import { Slot } from "expo-router";
import Footer from "../components/layout/Footer";

export default function Layout() {
    // La construction de chaque page de l'application: header, contenu de la page et footer, ainsi qu'une barre des tâches par défaut en haut
    return (<View className="flex h-full px-4 pt-24">
        <Header />
        <Slot/>
        <Footer />
        <StatusBar style="auto" />
    </View>);
}