import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function Countdown({ date }) {
    const [time, setTime] = useState(date - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(date.getTime() - Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return (<>{hours.toString().padStart(2, "0")}h{minutes.toString().padStart(2, "0")}m</>);
}