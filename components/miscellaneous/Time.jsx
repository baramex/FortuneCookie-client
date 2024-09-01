import { useEffect, useState } from "react";

export function Countdown({ date, run }) {
    const [time, setTime] = useState(date - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(date.getTime() - Date.now());
            if (date.getTime() - Date.now() <= 0) {
                run();
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);

    return (<>{hours.toString().padStart(2, "0")}h{minutes.toString().padStart(2, "0")}m</>);
}

export function CountdownTime({ time, run }) {
    const [remaining, setRemaining] = useState(time);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemaining(r => {
                r -= 1000;
                if (r < 0) {
                    run();
                    clearInterval(interval);
                }
                return r;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const seconds = Math.floor((remaining / 1000) % 60);
    const minutes = Math.floor((remaining / 1000 / 60) % 60);
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);

    return (<>{hours ? hours.toString().padStart(2, "0") + "h" : ""}{minutes ? minutes.toString().padStart(2, "0") + "m" : ""}{seconds && !minutes && !hours ? seconds : ""}</>);
}

export function FullDate({ date }) {
    return (<>{date.getDate().toString().padStart(2, "0")}/{(date.getMonth() + 1).toString().padStart(2, "0")}/{date.getFullYear().toString().slice(2).padStart(2, "0")}</>);
}

export function DateTime({ date }) {
    return (<>{date.getDate().toString().padStart(2, "0")}/{(date.getMonth() + 1).toString().padStart(2, "0")}/{date.getFullYear().toString().slice(2).padStart(2, "0")} à {date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}</>);
}