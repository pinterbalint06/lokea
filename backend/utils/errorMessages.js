const ERRORS = {
    COMMON: {
        MISSING_DATA: "Hiányzó adatok!",
        MISSING_IMAGE: "Nem adott meg képet!"
    },

    GAMEMAP: {
        INVALID_ID: "Helytelen pálya ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a pályához"
    },

    MAP: {
        INVALID_ID: "Helytelen térkép ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a térképhez",

        TITLE_EMPTY: "A térképnév megadása kötelező!",
        TITLE_TOO_LONG: "A térképnév maximum 20 karakter hosszú lehet!",
        TITLE_INVALID_CHARS: "A térképnév csak betűket, számokat, szóközöket, kötőjeleket és alulvonásokat tartalmazhat!"
    },

    POINT: {
        INVALID_ID: "Helytelen pont ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a ponthoz",

        UV_INVALID_TYPE: "A koordinátának számnak kell lennie!",
        UV_MIN_ERROR: "A koordináta nem lehet negatív!",
        UV_MAX_ERROR: "A koordinátának kisebbnek kell lennie, mint 1!",
        UV_REQUIRED: "A koordináta megadása kötelező!",

        NORTH_DIRECTION_TYPE: "Az északiránynak számnak kell lennie!",
        NORTH_DIRECTION_MIN: "Az északirány nem lehet negatív (0-nál kisebb)!",
        NORTH_DIRECTION_MAX: "Az északiránynak 360 foknál kisebbnek kell lennie!",
        NORTH_DIRECTION_REQUIRED: "Az északirány megadása kötelező!"
    },

    CONNECTION: {
        INVALID_ID: "Helytelen kapcsolat ID!",
        INVALID_START_ID: "Helytelen kezdőpont ID!",
        INVALID_END_ID: "Helytelen végpont ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a kapcsolathoz",

        MISSING_DIRECTION_BODY: "Nem adott meg módosítandó irányt!",

        SAME_START_END: "A kezdőpont és a végpont nem lehet ugyanaz!",
        END_MUST_BE_GREATER: "A kisebbik ID-val rendelkező pontnak kell a kezdőpontnak lennie!",

        START_TO_END_TYPE: "A kezdőpontból végpontba iránynak számnak kell lennie!",
        START_TO_END_MIN: "A kezdőpontból végpontba irány nem lehet negatív (0-nál kisebb)!",
        START_TO_END_MAX: "A kezdőpontból végpontba iránynak 360 foknál kisebbnek kell lennie!",

        END_TO_START_TYPE: "A végpontból kezdőpontba iránynak számnak kell lennie!",
        END_TO_START_MIN: "A végpontból kezdőpontba irány nem lehet negatív (0-nál kisebb)!",
        END_TO_START_MAX: "A végpontból kezdőpontba iránynak 360 foknál kisebbnek kell lennie!",

        ATLEAST_ONE_DIRECTION: "Nem adott meg módosítandó irányt!"
    }
};

module.exports = ERRORS;