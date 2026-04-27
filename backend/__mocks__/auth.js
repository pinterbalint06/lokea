const defaultGameSession = () => ({
    userid: 1,
    game: {
        activeSessionId: 1,
        gameMapId: 100,
        currentCycle: 1,
        sharpness: -3,
        rounds: 5,
        currentRound: 0,
        roundTime: 60,
        gameTitle: "Test Game",
        mapInfo: [{ mapId: 1, width: 800, height: 600 }],
        point: {
            pointId: 10,
            pointu: 0.5,
            pointv: 0.5,
            north_direction: 0,
            mapId: 1,
            image: {
                id: 1,
                mimeType: "image/jpeg",
                base64: "dGVzdA==",
                width: 800,
                height: 600
            }
        },
        roundStartedAt: Date.now() - 5000
    }
});

module.exports = {
    checkAuth: jest.fn((request, response, next) => {
        request.session = { userid: 1 };
        next();
    }),
    checkGameSession: jest.fn((request, response, next) => {
        request.session = defaultGameSession();
        next();
    })
};