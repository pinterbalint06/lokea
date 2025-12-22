cmake_minimum_required(VERSION 3.10)

project(TerrainGameEngine)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# headers
include_directories(BEFORE ${CMAKE_SOURCE_DIR}/include)

# 1. core files
file(GLOB_RECURSE ENGINE_CORE_FILES
    "src/core/*.cpp"
    "src/utils/*.cpp"
)

# emscripten flags
set(COMMON_WASM_FLAGS
    -lembind
    -sINITIAL_MEMORY=268435456
    -sALLOW_MEMORY_GROWTH
    -msimd128
    -sFILESYSTEM=0
    -sENVIRONMENT=["web"]
)

# ---------------------------------------------------------
# optimized
# ---------------------------------------------------------
set(RELEASE_COMPILE_FLAGS -O3 -flto)
# ---------------------------------------------------------
# debug
# ---------------------------------------------------------
set(DEBUG_COMPILE_FLAGS -g)

# ---------------------------------------------------------
# Test terrain
# ---------------------------------------------------------

# release
add_executable(testTerrainWASM ${ENGINE_CORE_FILES} src/testTerrain.cpp)
target_link_options(testTerrainWASM PUBLIC ${COMMON_WASM_FLAGS})
target_compile_options(testTerrainWASM PUBLIC ${RELEASE_COMPILE_FLAGS})

# debug
add_executable(testTerrainWASM_debug ${ENGINE_CORE_FILES} src/testTerrain.cpp)
target_link_options(testTerrainWASM_debug PUBLIC ${COMMON_WASM_FLAGS})
target_compile_options(testTerrainWASM_debug PUBLIC ${DEBUG_COMPILE_FLAGS})

# ---------------------------------------------------------
# Test equirectangular
# ---------------------------------------------------------


# release
add_executable(testEquirectangularWASM ${ENGINE_CORE_FILES} src/testEquirectangular.cpp)
target_link_options(testEquirectangularWASM PUBLIC ${COMMON_WASM_FLAGS})
target_compile_options(testEquirectangularWASM PUBLIC ${RELEASE_COMPILE_FLAGS})

# debug
add_executable(testEquirectangularWASM_debug ${ENGINE_CORE_FILES} src/testEquirectangular.cpp)
target_link_options(testEquirectangularWASM_debug PUBLIC ${COMMON_WASM_FLAGS})
target_compile_options(testEquirectangularWASM_debug PUBLIC ${DEBUG_COMPILE_FLAGS})