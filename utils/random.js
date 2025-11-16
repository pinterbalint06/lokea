function lcg(seed) {
    // MMIX Donald Knuth általi random paramétereivel
    // a = 6364136223846793005=7^5, szorzó
    // c = 1442695040888963407, increment
    // m = 18446744073709552000=2^64, maradékos osztás
    // n a szám végén BigInteger hogy 64 bites számokkal is tudjon dolgozni
    return (6364136223846793005n * BigInt(seed) + 1442695040888963407n) % 18446744073709552000n;
}

function random_forgatas(x, k) {
    // (x >>> k) eltoljuk k bittel jobbra az alap szamot
    // (x << (32 - k)) az elozo lepesnel jobbra "leesett" biteket eltolja bal vegere
    // majd ezt a ket szamot vagy muvelettel osszerakjuk
    // lenyegeben a jobbra "leesett" biteket "forgattuk at" a bal oldalara 
    return (x >>> k) | (x << (32 - k));
}

function xorshift_es_random_forgatas(seed) {
    // a szám bináris alakjából kiválasszuk a legjobb oldali 5-öt és ezt átkonvertáljuk 32 bitesbe majd biztosra leszűtjük 5 bitre
    // 31 = 11111
    let bitjobb5 = Number(seed >> 59n) & 31;

    // xorshift
    // shift - >> 18n - jobb bit shiftelünk 18-al (18-al eltoljuk a bitet jobbra ami "túlmegy" azt elvetjük)
    // xor - ^ - az eredeti szam bitjein es az uj shiftelt szam bitjein xor (kizaro vagy) muveletet vegzunk
    seed ^= (seed >> 18n);

    // kivalasszuk a kozepso 32 bitet
    // eltoljuk 27bittel jobbra a jobb oldali gyenge minosegu random biteket így elvetjuk
    // es 32 bitese alakitjuk a | 0 -al (vagy) nem valtoztat rajta csak 32bitese alakitja mert a | bit muvelet 32 biten mukodik
    let szam32bites = Number(seed >> 27n) | 0;

    // vegul elvegezuk a forgatast es visszadjuk azt. a vegen >>> 0 hogy elojel nelkuli 32 bites szamkent adjuk vissza
    return random_forgatas(szam32bites, bitjobb5) >>> 0;
}

class PCG_XOR_RR {
    constructor(seed) {
        this.state = lcg(seed);
    }

    next() {
        this.state = lcg(this.state);
        return xorshift_es_random_forgatas(this.state);
    }
    nextFloat() {
        // 32 bites elojel nelkuli maximum erteke 2^32-1=4,294,967,295
        // (maximum ertek+1)-el osztjuk a random szamot igy mindig [0;1[ intervallumba esik
        // 32-bit unsigned max + 1
        this.state = lcg(this.state);
        return xorshift_es_random_forgatas(this.state) / 4294967296.0;
    }
}