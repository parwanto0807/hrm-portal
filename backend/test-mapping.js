const row = {
    TPPH21: "2271333",
    PPH_THR: "0",
    PTKP: "30240000",
    PPH_EMPL: "2271333",
    JKK: "0.0000",
    JKM: "0.0000",
    JPK: "0.0000"
};

const gajiData = {
    tPph21: row.TPPH21 || 0,
    pphThr: row.PPH_THR || 0,
    pphEmpl: row.PPH_EMPL || 0,
    ptkpAmount: row.PTKP || 0,
    jkk: row.JKK || 0,
    jkm: row.JKM || 0,
    jpk: row.JPK || 0,
};

console.log('MAPPED_DATA:', JSON.stringify(gajiData, null, 2));
console.log('pphEmpl Type:', typeof gajiData.pphEmpl);
