# Lokalizációs készségfejlesztő alkalmazás

## Buildelés

### 1. Követelmények

- **CMake** (minimum 3.10-es verzió (https://cmake.org/download/))
- **Emscripten** SDK (https://emscripten.org/docs/getting_started/downloads.html)

### 2. Lépések

1.  **Build könyvtár létrehozása:**
    Hozzon létre egy build nevű könyvtárat

    ```bash
    mkdir build
    cd build/
    ```

2.  **A build konfigurálása**
    Futtassa a "emcmake cmake"-et a build könyvtárból a projekt konfigurálásához.

    ```bash
    emcmake cmake ..
    ```

    Ha azt szeretnénk, hogy a build fájlokat átmásolja a frontend/javascript mappába.

    ```bash
    emcmake cmake -DCOPYFILES=ON ..
    ```

3.  **Buildelés**
    A konfigurálás után futtassa a build parancsot.

    ##### A. Adott **verzió** build

    A Release build teljesetmínyre optimalizált.

    ```bash
    cmake --build . --target verzióneve
    ```

    ##### B. **Mindegyik** buildelése

    Mindkét verzót buildeli.

    ```bash
    cmake --build .
    ```

4.  **Verziók:**

    #### 1. terrain

    A terrain és webgl oldalakhoz használt fájlok. A domborzat generálás tesztelésének optimalizált verziója.

    #### 2. terrain_debug

    A terrain és webgl oldalakhoz használt fájlok. A domborzat generálás tesztelésének debugolható verziója.

    #### 3. equirectangular

    Az equirectangular oldalon használt fájlok. Az ekvirektanguláris képek megjelenítés tesztelésének optimalizált verziója.

    #### 4. equirectangular_debug

    Az equirectangular oldalon használt fájlok. Az ekvirektanguláris képek megjelenítés tesztelésének debugolható verziója.
