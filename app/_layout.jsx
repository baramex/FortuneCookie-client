import { StatusBar, View } from "react-native";
import Header from "../components/layout/Header";
import { Slot } from "expo-router";

export default function Layout() {
    return (<View className="flex h-full px-4 pt-12">
        <Header />
        <Slot />
        <StatusBar style="auto" />
    </View>);
}