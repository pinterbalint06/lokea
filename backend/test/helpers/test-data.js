const tooBigNumbers = [
    "90071992547409911", // very large number
    "900719925474099234345345234242311", // even larger number
    Number.MAX_SAFE_INTEGER + 1, // exceeds javascript safe integer
    "900719925474099234345345234242311", // bigint type instead of standard number
    1e308 // reaches max float limit
];

const negativeNumbers = [
    -0.0021, // negative decimal number
    -100, // negative integer
    -1231231231231231, // large negative integer
    -12312, // negative integer
    "-5", // negative number
    -1 // basic negative number
];

const invalidTypeNumbers = [
    "invalid", // word instead of number
    true, // boolean value
    false, // boolean value
    NaN, // not a number
    Infinity, // infinity
    -Infinity, // negative infinity
    12312313438576238462384823746284, // exceeds safe integer limit
    "[]", // array
    "{}", // object
];

const invalidStringFormats = [
    "gre", // only letters
    "12abc", // numbers mixed with letters
    "|", // single symbol
    "12|34", // numbers with symbols inside
    "!@#$%", // multiple special characters
    "\n", // special character
    "3.14", // decimal number
    "   ", // whitespace
    "0", // zero
    "\r\n", // newline characters
    "1e10", // scientific notation
    "١٢٣", // arabic numerals
    "Infinity", // infinity
    "🆔", // emoji
    "0x1A", // hex string format
    "<script>alert(1)</script>", // cross-site scripting payload
    "1; DROP TABLE users" // sql injection payload
];

const invalidIds = [
    ...tooBigNumbers,
    ...negativeNumbers,
    ...invalidTypeNumbers,
    ...invalidStringFormats
];

const invalidIdsWithNulls = [
    ...invalidIds,
    true, // boolean value
    false, // boolean value
    null, // null value
    undefined // undefined value
];

module.exports = {
    tooBigNumbers,
    negativeNumbers,
    invalidTypeNumbers,
    invalidStringFormats,
    invalidIds,
    invalidIdsWithNulls
};
