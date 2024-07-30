import { StatusBar, View } from "react-native";
import Header from "../components/layout/Header";
import { Slot } from "expo-router";
import Footer from "../components/layout/Footer";

export default function Layout() {
    return (<View className="flex h-full px-4 pt-24">
        <Header />
        <Slot/>
        <Footer />
        <StatusBar style="auto" />
    </View>);
}