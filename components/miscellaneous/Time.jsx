import { useEffect, useState } from "react";

export function Countdown({ date, run }) {
    const [time, setTime] = useState(date - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(date.getTime() - Date.now());
            if (date.getTime() - Date.now() <= 0 && date.getTime() + 1000 - Date.now() > 0) {
                run();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return (<>{hours.toString().padStart(2, "0")}h{minutes.toString().padStart(2, "0")}m</>);
}

export function FullDate({ date }) {
    return (<>{date.getDate().toString().padStart(2, "0")}/{(date.getMonth() + 1).toString().padStart(2, "0")}/{date.getFullYear().toString().slice(2).padStart(2, "0")}</>);
}

export function DateTime({ date }) {
    return (<>{date.getDate().toString().padStart(2, "0")}/{(date.getMonth() + 1).toString().padStart(2, "0")}/{date.getFullYear().toString().slice(2).padStart(2, "0")} à {date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}</>);
}