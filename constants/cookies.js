export const COOKIE_STATES = {
    1: {
        text: "Actif",
        bgColor: "bg-green-500",
        textColor: "text-white"
    },
    2: {
        text: "Cassé",
        bgColor: "bg-zinc-900",
        textColor: "text-white"
    },
    3: {
        text: "Répondu",
        bgColor: "bg-blue-500",
        textColor: "text-white"
    }
}

export const COOKIE_RADIUS = [
    {
        value: 0.01,
        name: "10m",
        description: "Par exemple: à l'intérieur d'un bâtiment ou un endroit précis"
    },
    {
        value: 0.1,
        name: "100m",
        description: "Par exemple: dans un quartier, un petit village ou un parc"
    },
    {
        value: 1,
        name: "1 km",
        description: "Par exemple: dans une ville ou un lieu peu précis"
    },
    {
        value: 5,
        name: "5 km",
        description: "Par exemple: dans un autre pays, une autre ville, ou à la campagne"
    }
];