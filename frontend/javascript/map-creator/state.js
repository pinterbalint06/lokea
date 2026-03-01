export const appState = {
    mapViewer: null,
    equirectangularViewer: null,
    maps: {},
    connectionsList: [],
    connectionsLoadPromise: null,
    activeMapId: -1,
    gameMapID: null
};

export const editorState = {
    isConnectingMarkers: false,
    unsavedConnections: [],
    temporaryConnectionID: -1,
    pendingFiles: {
        equirectangular: null,
        map: null
    },
    isSaving: {
        point: false,
        map: false,
        connections: false
    },
    equiAbortController: null
}

export const uiState = {
    toasts: {
        clickOnMap: null,
        connection: null
    },
    animations: {
        isCollapsing: false,
        fovSyncID: null
    }
};
