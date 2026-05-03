const mockMapsQueries = {
    getAllMaps: jest.fn(),
    getMapDimensions: jest.fn().mockResolvedValue({ width: 800, height: 600 })
};

module.exports = mockMapsQueries;
