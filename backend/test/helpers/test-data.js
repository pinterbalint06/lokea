const invalidIds = [
    "gre", // only letters
    "12abc", // numbers mixed with letters
    "|", // single symbol
    "12|34", // numbers with symbols inside
    "!@#$%", // multiple special characters
    "\n", // special character
    "-5", // negative number
    "3.14", // decimal number
    "   ", // whitespace
    "0", // zero
    "\r\n", // newline characters
    "1e10", // scientific notation
    "١٢٣", // arabic numerals
    "Infinity", // infinity
    "🆔", // emoji
    "90071992547409911", // very large number
    "900719925474099234345345234242311", // even larger number
];

const invalidIdsWithNulls = [
    ...invalidIds,
    true, // boolean value
    false, // boolean value
    null, // null value
    undefined // undefined value
];

module.exports = {
    invalidIds,
    invalidIdsWithNulls
};
