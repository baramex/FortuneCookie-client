import { Image, Text, View } from "react-native";
import logo from "../assets/icon.png";

export default function Header() {
    return (
        <View>
            <Image source={logo} className="w-5" />
            <Text className="font-medium text-3xl">NoteBlast</Text>
        </View>
    );
}