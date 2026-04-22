const {
    invalidIds,
    invalidIdsWithNulls,
    invalidTypeNumbers,
    negativeNumbers
} = require("../../helpers/test-data.js");

const emptyTitles = [
    "",
    "   ",
    "\t",
    "\n"
];

const tooLongTitles = [
    "This is exactly 21 ch",
    "Very long title exceeding limits",
    "Egy_Nagyon_Hosszu_Terkepnev_Ami_Tul_Hosszu"
];

const invalidCharTitles = [
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
    "Тérkép", // The "Т" is actually a Cyrillic letter (\u0422)
    "Terkеp", // The "е" is actually a Cyrillic letter (\u0435)
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

const tooBigUV = [
    1.0,
    123,
    143,
    353453
];

const tooBigDegrees = [
    360.1,
    361,
    720,
    1080,
    1000
];

const imageStatusForPath = "pending";

module.exports = {
    invalidIds,
    invalidIdsWithNulls,
    emptyTitles,
    tooLongTitles,
    invalidCharTitles,
    validTitles,
    tooBigUV,
    invalidTypeNumbers,
    negativeNumbers,
    tooBigDegrees,
    imageStatusForPath,
};