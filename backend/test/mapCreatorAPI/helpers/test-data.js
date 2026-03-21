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
    null, // null value
    undefined // undefined value
];

const invalidTitles = [
    "",
    "This is exactly 21 ch",
    "Very long title exceeding limits",
    "Hello World!",
    "Q&A Session",
    "Email@Address",
    "Version 1.0",
    "User, Name",
    "A+B=C",
    "(Parentheses)",
    "El Niño",
    "Façade",
    "Gutenhello ß",
    "Emoji 🚀",
    "Line\nBreak",
    "Térkép\u200Búj",
    "Térkép\u00A02",
    "Тérkép", // The 'Т' is actually a Cyrillic letter (\u0422)
    "Terkеp", // The 'е' is actually a Cyrillic letter (\u0435)
    "Title\b",
    "Title\v2",
    "[Draft] Térkép",
    "{Térkép}",
    "<Térkép>",
    "Title | Subtitle",
    "Térkép~2",
    "`Térkép`",
    "Térkép.5",
    "Térkép: Budapest",
    "Térkép; v2"
];

const validTitles = [
    "ujterkep",
    "Térkép",
    "Térkép2",
    "Térkép 3",
    "Térkép-4",
    "_",
    "-",
    "ű",
    "Ű",
    "0",

    "-a_B ",
    "     1234567890     ",
    "ABCDEFGHIJKLMNOPQRST",
    "abcdefghijklmnopqrst",
    "00000000000000000000",
    "Á1é2Í3ó4Ö5ő6Ú7ü8Ű9",
    "a-b_c-d_e-f_g-h_i-j_"
];

const invalidUVs = [
    "invalid",
    NaN,
    Infinity,
    -Infinity,
    -0.1,
    -1,
    1,
    1.5,
    100
];
const invalidDegrees = [
    "invalid",
    NaN,
    Infinity,
    -Infinity,
    -0.1,
    -10,
    360,
    360.1,
    500
];

const mockImageMetadata = {
    width: 800,
    height: 600,
    extension: ".jpg"
};

const imageStatusForPath = "pending";

module.exports = {
    invalidIds,
    invalidTitles,
    validTitles,
    invalidUVs,
    invalidDegrees,
    mockImageMetadata,
    imageStatusForPath
};