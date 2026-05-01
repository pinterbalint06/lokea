function isIdUpdateSuccessful(result) {
    const match = result?.info?.match(/Rows matched:\s*(\d+)/);
    const rowsMatched = match ? parseInt(match[1]) : 0;

    return rowsMatched == 1;
}

module.exports = {
    isIdUpdateSuccessful
};
