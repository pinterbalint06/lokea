const ERRORS = {
    COMMON: {
        MISSING_DATA: "Hiányzó adatok!",
        MISSING_IMAGE: "Nem adott meg képet!",
        FILE_TOO_LARGE: "Túl nagy fájlméret! (Max 10MB)",
        FILE_UPLOAD_ERROR: "Fájlfeltöltési hiba történt!",
        IMAGE_PROCESSING_ERROR: "Hiba a kép feldolgozásakor!",
        UNEXPECTED_ERROR: "Váratlan hiba történt!",
        INVALID_RESOLUTION: "Helytelen felbontás!",
        FILE_NOT_FOUND: "A fájl nem létezik vagy helytelen!",
        INVALID_IMAGE_TYPE: "Érvénytelen fájltípus! Csak JPG, PNG, WEBP és GIF képek engedélyezettek!"
    },

    GAMEMAP: {
        INVALID_ID: "Helytelen pálya ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a pályához!",
        COVER_IMAGE_UPDATE_FAILED: "A borítókép frissítése nem sikerült!",
        NOT_FOUND: "A pálya nem létezik!"
    },

    MAP: {
        INVALID_ID: "Helytelen térkép ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a térképhez!",
        NOT_FOUND: "A térkép nem létezik!",

        RENAME_FAILED: "A térkép átnevezése nem sikerült!",
        SAVE_FAILED: "A térkép mentése nem sikerült!",
        DELETE_FAILED: "A térkép törlése nem sikerült!",
        IMAGE_DELETIONS_FAILED: "A térkép képeinek törlése nem sikerült!",

        TITLE_EMPTY: "A térképnév megadása kötelező!",
        TITLE_TOO_LONG: "A térképnév maximum 20 karakter hosszú lehet!",
        TITLE_INVALID_CHARS: "A térképnév csak betűket, számokat, szóközöket, kötőjeleket és alulvonásokat tartalmazhat!"
    },

    POINT: {
        INVALID_ID: "Helytelen pont ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a ponthoz!",
        NOT_FOUND: "A pont nem létezik!",

        ALREADY_EXISTS: "Ezen a térképen már létezik pont ezeken a koordinátákon!",

        COORDINATES_UPDATE_FAILED: "A pont koordinátáinak frissítése nem sikerült!",
        IMAGE_PATH_UPDATE_FAILED: "A pont útvonalának frissítése nem sikerült!",
        OLD_IMAGE_DELETION_FAILED: "A régi kép törlése nem sikerült!",
        IMAGE_DELETETION_FAILED: "A kép törlése nem sikerült!",
        DELETE_FAILED: "A pont törlése nem sikerült!",
        NORTH_DIRECTION_UPDATE_FAILED: "A pont északirányának frissítése nem sikerült!",

        UV_INVALID_TYPE: "A koordinátának számnak kell lennie!",
        UV_MIN_ERROR: "A koordináta nem lehet negatív!",
        UV_MAX_ERROR: "A koordinátának kisebbnek kell lennie, mint 1!",
        UV_REQUIRED: "A koordináták megadása kötelező!",

        NORTH_DIRECTION_TYPE: "Az északiránynak számnak kell lennie!",
        NORTH_DIRECTION_MIN: "Az északirány nem lehet negatív (0-nál kisebb)!",
        NORTH_DIRECTION_MAX: "Az északiránynak 360 foknál kisebbnek kell lennie!",
        NORTH_DIRECTION_REQUIRED: "Az északirány megadása kötelező!"
    },

    CONNECTION: {
        INVALID_ID: "Helytelen kapcsolat ID!",
        INVALID_START_ID: "Helytelen kezdőpont ID!",
        INVALID_END_ID: "Helytelen végpont ID!",

        NO_ACCESS: "Nincs hozzáférése ehhez a kapcsolathoz!",

        MISSING_DIRECTION_BODY: "Nem adott meg módosítandó irányt!",

        ALREADY_EXISTS: "A megadott pontok már össze vannak kapcsolva!",

        NOT_ON_SAME_GAME_MAP: "A megadott pontok nem ugyanahhoz a pályához tartoznak!",

        UPDATE_FAILED: "A kapcsolat frissítése nem sikerült!",
        DELETE_FAILED: "A kapcsolat törlése nem sikerült!",

        NOT_CROSSMAP: "Csak térképek közötti kapcsolatok irányát lehet módosítani!",
        DIRECTION_NOT_GIVEN_FOR_CROSSMAP: "Térképek közötti kapcsolat létrehozásához meg kell adni mindkét irányt!",

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