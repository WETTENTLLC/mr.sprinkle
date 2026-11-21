window.MrSprinklePricing = Object.freeze({
    grillz: Object.freeze({
        silver: Object.freeze({ label: "Silver", teeth: Object.freeze({ 1: 100, 6: 600, 12: 1200 }) }),
        gold10k: Object.freeze({ label: "10K Gold", teeth: Object.freeze({ 1: 240, 6: 1440, 12: 2880 }) }),
        gold14k: Object.freeze({ label: "14K Gold", teeth: Object.freeze({ 1: 300, 6: 1800, 12: 3600 }) }),
        dentalGold14k: Object.freeze({ label: "14K Dental Gold", teeth: Object.freeze({ 1: 320, 6: 1920, 12: 3840 }) })
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
    naturalDiamonds: Object.freeze({
        commercial: Object.freeze({ "1.3": 6, "1.5": 8, "2.0": 14, "3.0": 46 }),
        si: Object.freeze({ "1.3": 7, "1.5": 9, "2.0": 18, "3.0": 58 }),
        vs: Object.freeze({ "1.3": 8, "1.5": 12, "2.0": 23, "3.0": 74 }),
        vvs: Object.freeze({ "1.3": 10, "1.5": 14, "2.0": 28, "3.0": 91 })
    }),
    alternativeStones: Object.freeze({
        labGrownDiamond: Object.freeze({ "1.3": 3.3, "1.5": 4, "2.0": 6.3, "3.0": 18.7 }),
        vvsMoissanite: Object.freeze({ "1.3": 2.5, "1.5": 2.8, "2.0": 3.7, "3.0": 7.6 }),
        cubicZirconia: Object.freeze({ "1.3": 5, "1.5": 5, "2.0": 6, "3.0": 8 })
    }),
    customCuts: Object.freeze({
        diamondDust: 15,
        centerSplit: 10,
        openFace: 20,
        deepBar: 15
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
