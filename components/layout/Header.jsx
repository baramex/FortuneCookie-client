import { Image, Text, View } from "react-native";
import logo from "../../assets/favicon.png";

export default function Header() {
    return (
        <View className="absolute top-12 left-4 flex flex-row gap-2 items-center">
            <Image source={logo} className="w-7 h-7" />
            <Text className="font-medium text-3xl">BlastNote</Text>
        </View>
    );
}