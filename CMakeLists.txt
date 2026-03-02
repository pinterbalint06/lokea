cmake_minimum_required(VERSION 3.10)

project(Lokea)

# move files to frontend by default
set(WEBASSEMBLY_FOLDER_LOCATION "${CMAKE_SOURCE_DIR}/frontend/javascript/libs/webassembly")
option(COPYFILES "Move output files to ${WEBASSEMBLY_FOLDER_LOCATION} directory" OFF)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# headers
include_directories(BEFORE ${CMAKE_SOURCE_DIR}/include)

# 1. core files
file(GLOB_RECURSE ENGINE_CORE_FILES
    "src/core/*.cpp"
    "src/utils/*.cpp"
)

file(GLOB_RECURSE TERRAIN_FILES
    "src/terrain/*.cpp"
)
file(GLOB_RECURSE EQUI_FILES
    "src/equirectangular/*.cpp"
)
file(GLOB_RECURSE MAP_VIEWER_FILES
    "src/mapViewer/*.cpp"
)

set(EQUIRECTANGULAR_JS_LIBRARY "${CMAKE_CURRENT_SOURCE_DIR}/src/equirectangular/equirectangularLibrary.js")
set(TEXTURE_JS_LIBRARY "${CMAKE_CURRENT_SOURCE_DIR}/src/core/resources/textureLibrary.js")

# emscripten flags
set(COMMON_WASM_FLAGS
    -lembind
    -sINITIAL_MEMORY=268435456
    -sALLOW_MEMORY_GROWTH
    -msimd128
    -sENVIRONMENT=["web"]
    -sEXPORTED_RUNTIME_METHODS=["UTF8ToString"]
    -sMAX_WEBGL_VERSION=2
    -sMIN_WEBGL_VERSION=2
    -sGL_SUPPORT_AUTOMATIC_ENABLE_EXTENSIONS=0
    -sINCOMING_MODULE_JS_API=[]
    -sGL_POOL_TEMP_BUFFERS=0
    -sGL_ENABLE_GET_PROC_ADDRESS=0
    -sMODULARIZE=1
    -sEXPORT_ES6=1
    -sEXPORT_NAME="ModuleBuilder"
    --js-library=${TEXTURE_JS_LIBRARY}
    --embed-file=${CMAKE_SOURCE_DIR}/resources/shaders@shaders
)

set(COMMON_WASM_COMPILATION
    -msimd128
)
# ---------------------------------------------------------
# optimized
# ---------------------------------------------------------
set(RELEASE_COMPILE_FLAGS
    -O3
    -flto
)

set(RELEASE_LINK_FLAGS
    -flto
    -sGL_TRACK_ERRORS=0
    --closure=1
)
# ---------------------------------------------------------
# debug
# ---------------------------------------------------------
# for debug js runs in frontend/js source location is two directories back fro m there
set(DEBUG_COMPILE_FLAGS
    -g
    -gsource-map
    -fsanitize=address
    -DDEBUG
)
set(DEBUG_LINK_FLAGS
    -g
    -gsource-map
    --source-map-base "http://localhost:3000/"
    -fsanitize=address
)

# ---------------------------------------------------------
# Test terrain
# ---------------------------------------------------------

# release
add_executable(terrain ${ENGINE_CORE_FILES} ${TERRAIN_FILES} src/terrain/terrainBinding.cpp)
target_link_options(terrain PUBLIC ${COMMON_WASM_FLAGS} ${RELEASE_LINK_FLAGS})
target_compile_options(terrain PUBLIC ${RELEASE_COMPILE_FLAGS} ${COMMON_WASM_COMPILATION})

# debug
add_executable(terrain_debug ${ENGINE_CORE_FILES} ${TERRAIN_FILES} src/terrain/terrainBinding.cpp)
target_link_options(terrain_debug PUBLIC ${COMMON_WASM_FLAGS} ${DEBUG_LINK_FLAGS})
target_compile_options(terrain_debug PUBLIC ${DEBUG_COMPILE_FLAGS} ${COMMON_WASM_COMPILATION})

# ---------------------------------------------------------
# Test equirectangular
# ---------------------------------------------------------

# release
add_executable(equirectangular ${ENGINE_CORE_FILES} ${EQUI_FILES} src/equirectangular/equirectangularBinding.cpp)
target_link_options(equirectangular PUBLIC
    ${COMMON_WASM_FLAGS}
    ${RELEASE_LINK_FLAGS}
    --js-library=${EQUIRECTANGULAR_JS_LIBRARY}
)
target_compile_options(equirectangular PUBLIC ${RELEASE_COMPILE_FLAGS} ${COMMON_WASM_COMPILATION})

# debug
add_executable(equirectangular_debug ${ENGINE_CORE_FILES} ${EQUI_FILES} src/equirectangular/equirectangularBinding.cpp)
target_link_options(equirectangular_debug PUBLIC
    ${COMMON_WASM_FLAGS}
    ${DEBUG_LINK_FLAGS}
    --js-library=${EQUIRECTANGULAR_JS_LIBRARY}
)
target_compile_options(equirectangular_debug PUBLIC ${DEBUG_COMPILE_FLAGS} ${COMMON_WASM_COMPILATION})

# ---------------------------------------------------------
# Test map viewer
# ---------------------------------------------------------

# release
add_executable(mapViewer ${ENGINE_CORE_FILES} ${MAP_VIEWER_FILES} src/mapViewer/mapViewerEngineBinding.cpp)
target_link_options(mapViewer PUBLIC
    ${COMMON_WASM_FLAGS}
    ${RELEASE_LINK_FLAGS}
)
target_compile_options(mapViewer PUBLIC ${RELEASE_COMPILE_FLAGS} ${COMMON_WASM_COMPILATION})

# debug
add_executable(mapViewer_debug ${ENGINE_CORE_FILES} ${MAP_VIEWER_FILES} src/mapViewer/mapViewerEngineBinding.cpp)
target_link_options(mapViewer_debug PUBLIC
    ${COMMON_WASM_FLAGS}
    ${DEBUG_LINK_FLAGS}
)
target_compile_options(mapViewer_debug PUBLIC ${DEBUG_COMPILE_FLAGS} ${COMMON_WASM_COMPILATION})

if (COPYFILES)
    # ---------------------------------------------------------
    # Test terrain
    # ---------------------------------------------------------
    set(TERRAIN_TARGET_LOCATION "${WEBASSEMBLY_FOLDER_LOCATION}/terrain")

    #release
    add_custom_command(TARGET terrain POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/terrain.js"
            "${TERRAIN_TARGET_LOCATION}/terrain.js"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/terrain.wasm"
            "${TERRAIN_TARGET_LOCATION}/terrain.wasm"

        COMMENT "Copy terrain to ${TERRAIN_TARGET_LOCATION}"
    )
    
    #debug
    add_custom_command(TARGET terrain_debug POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/terrain_debug.js"
            "${TERRAIN_TARGET_LOCATION}/terrain_debug.js"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/terrain_debug.wasm"
            "${TERRAIN_TARGET_LOCATION}/terrain_debug.wasm"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/terrain_debug.wasm.map"
            "${TERRAIN_TARGET_LOCATION}/terrain_debug.wasm.map"

        COMMENT "Copy terrain debug to ${TERRAIN_TARGET_LOCATION}"
    )
    
    # ---------------------------------------------------------
    # Test equirectangular
    # ---------------------------------------------------------
    set(EQUIRECTANGULAR_TARGET_LOCATION "${WEBASSEMBLY_FOLDER_LOCATION}/equirectangular")

    #release
    add_custom_command(TARGET equirectangular POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/equirectangular.js"
            "${EQUIRECTANGULAR_TARGET_LOCATION}/equirectangular.js"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/equirectangular.wasm"
            "${EQUIRECTANGULAR_TARGET_LOCATION}/equirectangular.wasm"

        COMMENT "Copy equirectangular to ${EQUIRECTANGULAR_TARGET_LOCATION}"
    )

    #debug
    add_custom_command(TARGET equirectangular_debug POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/equirectangular_debug.js"
            "${EQUIRECTANGULAR_TARGET_LOCATION}/equirectangular_debug.js"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/equirectangular_debug.wasm"
            "${EQUIRECTANGULAR_TARGET_LOCATION}/equirectangular_debug.wasm"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/equirectangular_debug.wasm.map"
            "${EQUIRECTANGULAR_TARGET_LOCATION}/equirectangular_debug.wasm.map"

        COMMENT "Copy equirectangular debug to ${EQUIRECTANGULAR_TARGET_LOCATION}"
    )
    
    # ---------------------------------------------------------
    # Test map viewer
    # ---------------------------------------------------------
    set(MAP_VIEWER_TARGET_LOCATION "${WEBASSEMBLY_FOLDER_LOCATION}/mapViewer")

    #release
    add_custom_command(TARGET mapViewer POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/mapViewer.js"
            "${MAP_VIEWER_TARGET_LOCATION}/mapViewer.js"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/mapViewer.wasm"
            "${MAP_VIEWER_TARGET_LOCATION}/mapViewer.wasm"

        COMMENT "Copy map viewer to ${MAP_VIEWER_TARGET_LOCATION}"
    )

    #debug
    add_custom_command(TARGET mapViewer_debug POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/mapViewer_debug.js"
            "${MAP_VIEWER_TARGET_LOCATION}/mapViewer_debug.js"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/mapViewer_debug.wasm"
            "${MAP_VIEWER_TARGET_LOCATION}/mapViewer_debug.wasm"

        COMMAND ${CMAKE_COMMAND} -E copy_if_different 
            "${CMAKE_CURRENT_BINARY_DIR}/mapViewer_debug.wasm.map"
            "${MAP_VIEWER_TARGET_LOCATION}/mapViewer_debug.wasm.map"

        COMMENT "Copy map viewer debug to ${MAP_VIEWER_TARGET_LOCATION}"
    )
endif()