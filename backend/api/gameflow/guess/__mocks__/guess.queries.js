const mockGuessQueries = {
    saveGuess: jest.fn().mockResolvedValue(undefined),
    totalScore: jest.fn().mockResolvedValue(1000),
    incrementCurrentRound: jest.fn().mockResolvedValue(undefined),
    clearCurrentPoint: jest.fn().mockResolvedValue(undefined)
};

module.exports = mockGuessQueries;
