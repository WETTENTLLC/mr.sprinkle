(function (root) {
const catalog = Object.freeze({
    // Bump this whenever any price or pricing rule changes.
    version: "2026-11-24-approved-pair-addons",
    grillz: Object.freeze({
        silver: Object.freeze({ perTooth: 100, label: "Silver", teeth: Object.freeze({ 1: 100, 6: 600, 12: 1200 }) }),
        gold10k: Object.freeze({ perTooth: 240, label: "10K Gold", teeth: Object.freeze({ 1: 240, 6: 1440, 12: 2880 }) }),
        gold14k: Object.freeze({ perTooth: 300, label: "14K Gold", teeth: Object.freeze({ 1: 300, 6: 1800, 12: 3600 }) }),
        dentalGold14k: Object.freeze({ perTooth: 320, label: "14K Dental Gold", teeth: Object.freeze({ 1: 320, 6: 1920, 12: 3840 }) })
    }),
    specialPieces: Object.freeze({
        silver: Object.freeze({ fangs: 180, gapFiller: 170 }),
        dentalGold14k: Object.freeze({ fangs: 480, gapFiller: 480 })
    }),
    fangExtensions: Object.freeze({
        medium: 20,
        long: 35,
        curved: 45,
        xl: 60
    }),
    // Retail stone pricing: wholesale x 2.5, rounded UP to the next dollar,
    // with a $5 minimum per stone. Source: owner's E GOLD USA wholesale sheet.
    // Sizes are millimeters; values are per stone.
    naturalDiamonds: Object.freeze({
        commercial: Object.freeze({
            "1.3": 10, "1.4": 13, "1.5": 15, "1.6": 18, "1.7": 20, "1.8": 23,
            "1.9": 28, "2.0": 30, "2.1": 38, "2.2": 40, "2.3": 48, "2.4": 55,
            "2.5": 63, "2.6": 73, "2.7": 80, "2.8": 90, "2.9": 103, "3.0": 110
        }),
        si: Object.freeze({
            "1.3": 13, "1.4": 15, "1.5": 18, "1.6": 23, "1.7": 25, "1.8": 30,
            "1.9": 35, "2.0": 40, "2.1": 48, "2.2": 53, "2.3": 60, "2.4": 70,
            "2.5": 70, "2.6": 93, "2.7": 100, "2.8": 115, "2.9": 128, "3.0": 140
        }),
        vs: Object.freeze({
            "1.3": 15, "1.4": 20, "1.5": 25, "1.6": 30, "1.7": 33, "1.8": 40,
            "1.9": 45, "2.0": 53, "2.1": 63, "2.2": 70, "2.3": 80, "2.4": 93,
            "2.5": 95, "2.6": 118, "2.7": 130, "2.8": 148, "2.9": 165, "3.0": 180
        }),
        vvs: Object.freeze({
            "1.3": 20, "1.4": 25, "1.5": 30, "1.6": 38, "1.7": 40, "1.8": 50,
            "1.9": 58, "2.0": 65, "2.1": 78, "2.2": 88, "2.3": 103, "2.4": 115,
            "2.5": 118, "2.6": 145, "2.7": 160, "2.8": 183, "2.9": 205, "3.0": 223
        })
    }),
    alternativeStones: Object.freeze({
        labGrownDiamond: Object.freeze({
            "1.3": 5, "1.4": 5, "1.5": 5, "1.6": 6, "1.7": 7, "1.8": 9,
            "1.9": 10, "2.0": 11, "2.1": 16, "2.2": 18, "2.3": 21, "2.4": 24,
            "2.5": 24, "2.6": 28, "2.7": 30, "2.8": 35, "2.9": 39, "3.0": 42
        }),
        vvsMoissanite: Object.freeze({
            "1.3": 5, "1.4": 5, "1.5": 5, "1.6": 5, "1.7": 5, "1.8": 5,
            "1.9": 5, "2.0": 5, "2.1": 6, "2.2": 6, "2.3": 7, "2.4": 8,
            "2.5": 8, "2.6": 10, "2.7": 10, "2.8": 12, "2.9": 13, "3.0": 14
        }),
        // CZ supplier pricing is quoted by point/shape/parcel, not a matching
        // per-mm unit table. Keep the previously approved published CZ prices
        // until its wholesale basis is reconciled separately.
        cubicZirconia: Object.freeze({ "1.3": 5, "1.5": 5, "2.0": 6, "3.0": 8 })
    }),
    // Owner wholesale sheet: CZ and specialty stones are point/parcel priced,
    // so keep them separate from the mm-based diamond selector.
    cubicZirconiaByPoint: Object.freeze({
        standard: Object.freeze({ 2: 8, 4: 10, 6: 15, 8: 20, 10: 28, 15: 33, 20: 50, 25: 63, 50: 88 }),
        specialCut: Object.freeze({ 10: 50, 12: 55, 15: 65, 20: 100, 25: 125, 35: 150, 50: 200 }),
        roundParcel: Object.freeze({ small: 100, medium: 113, large: 125, xlarge: 150 }),
        princessParcel: Object.freeze({ small: 100, medium: 113, large: 125, xlarge: 150 })
    }),
    specialtyStones: Object.freeze({
        syntheticOpal: 300,
        genuineOpal: 400,
        motherOfPearl: 400,
        ruby: 400,
        sapphire: 400,
        emerald: 400,
        citrine: 400,
        blueLapis: 400,
        onyx: 400
    }),
    enamelRetailRange: Object.freeze({ minimum: 500, maximum: 1250, basis: "design complexity; estimate only" }),
    customToothArtwork: Object.freeze({ quoteRequired: true, setupFee: null, examples: Object.freeze(["names", "initials", "logos", "rocket ships", "symbols", "original artwork"]), quoteInputs: Object.freeze(["reference artwork", "design complexity", "production requirements"]) }),
    // Owner-approved Nov 22, 2026: individual fabrication and deep/bar work
    // are priced per pair of teeth. The other finish cuts remain per arch piece.
    customCuts: Object.freeze({
        individualFabrication: 10,
        diamondDust: 30,
        centerSplit: 20,
        openFace: 40,
        deepBar: 15
    }),
    pairBasedCuts: Object.freeze(["individualFabrication", "deepBar"]),
    customCutLabels: Object.freeze({
        individualFabrication: "Individual-tooth fabrication",
        diamondDust: "Diamond / Dust cut",
        centerSplit: "Center / Split line",
        openFace: "Open face / Window cut",
        deepBar: "Deep / Bar cut"
    }),
    rules: Object.freeze({
        // Owner decision Nov 20, 2026: any tooth count is priced per tooth.
        grillzPricing: "perTooth",
        customCutBasis: "mixed",
        // Owner decision Nov 20, 2026: setting labor is already included.
        settingLabor: "included",
        // Owner decision Nov 20, 2026: rush ($150) replaces standard shipping ($60).
        rushReplacesStandardShipping: true,
        stoneRetailFormula: "wholesale x 2.5, rounded up to next dollar; $5 minimum; point and parcel stones remain separately priced"
    }),
    products: Object.freeze({
        rushDelivery: 150,
        standardGrillzShipping: 60,
        shippedMoldKit: 40,
        wettShades: 65,
        standardAtmClip: 10,
        customAtmClip: 15
    }),
    giftCards: Object.freeze({ minimum: 100, maximum: 1500 }),
    quoteOnlyMaterials: Object.freeze(["18K Gold", "White Gold", "Platinum"]),
    quoteOnlyServices: Object.freeze(["Custom jewelry", "Tooth gems", "Gold press-on nails"])
});
if (typeof module === "object" && module.exports) module.exports = catalog;
else root.MrSprinklePricing = catalog;
})(typeof window !== "undefined" ? window : globalThis);
