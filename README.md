# Lokea — Lokalizációs készségfejlesztő alkalmazás

A Lokea egy vizsgaprojektként fejlesztett webes alkalmazás, amely a téri tájékozódást és a térképolvasási készséget hivatott fejleszteni. A játékmenet a panorámakép-alapú helymeghatározós játékok logikájára épül: a felhasználóknak egy 360 fokos kép alapján kell beazonosítaniuk a helyzetüket, majd megjelölni azt egy virtuális térképen.

Bármelyik regisztrált felhasználó készíthet saját helyszíneket. A rögzített pontokat össze lehet kötni, így a játékosok lépkedhetnek is a pontok között. Játék indításakor testreszabható a körök száma, a körök ideje és a nehézség is, a megszerzett pontok pedig egy globális ranglistára kerülnek.

## Felépítés

A projekt fő moduljai:

- `frontend/`: Kliensoldali fájlok (HTML, CSS, JS).
- `backend/`: Node.js és Express alapú REST API. Ez felel a szerveroldali logikáért: játékmenedzsment, képek feldolgozása (Multer, Sharp), felhasználókezelés, és a MySQL adatbázis-műveletek.
- `engine/`: Egy saját fejlesztésű, C++ nyelven írt WebAssembly motor. Ez végzi a 360 fokos panorámaképek és a térkép renderelését közvetlenül a böngészőben.
- `database/`: MySQL adatbázis sémák és konfigurációs segédletek.

## Telepítés és futtatás

A futtatáshoz **Node.js v18** vagy újabb verzió szükséges. 

A szerver alapértelmezett beállításokkal azonnal indul, de a `backend/` mappában létrehozott `.env` fájlban felülírhatók az olyan alapértékek, mint a `SERVER_IP`, `PORT`, `EMAIL_USER`, `EMAIL_PASS`, vagy a MySQL-hez szükséges `DB_PASS`.

Leklónozás és függőségek telepítése:
```bash
git clone https://github.com/pinterbalint06/lokea.git
cd lokea/backend
npm install
```

Fejlesztői környezet indítása (Nodemon):
```bash
npm run dev
```

Tesztek futtatása (Jest):
```bash
npm test
```

Éles szerver indítása:
```bash
npm start
```

## Kreditek

A vizsgaprojektet fejlesztette: Eördögh Erik, Pintér Bálint és Varga Norbert.

A sablonért (ISC licenc) külön köszönet Kardos Krisztiánnak.