/*
 * Mr. Sprinkle Grill Maker estimate engine.
 * One calculation used by both pricing.html (what the customer sees) and
 * mold-form.html (what is submitted), so the two can never disagree.
 * Prices come only from assets/pricing-catalog.js.
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("./pricing-catalog.js"));
    } else {
        root.MrSprinkleEstimate = factory(root.MrSprinklePricing);
    }
})(typeof window !== "undefined" ? window : globalThis, function (catalog) {
    "use strict";

    const UPPER = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
    const LOWER = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
    const DESIGNS = { grillz: "Grillz", fangs: "Fangs set", gapFiller: "Gap filler" };
    const METALS = { silver: "Silver", gold10k: "10K Gold", gold14k: "14K Gold", dentalGold14k: "14K Dental Gold", quote: "18K / White Gold / Platinum" };
    const STONES = { none: "No stones", natural: "Natural diamond", labGrownDiamond: "Lab-grown diamond", vvsMoissanite: "VVS Moissanite", cubicZirconia: "Cubic Zirconia" };
    const CLARITY = { commercial: "Commercial", si: "SI", vs: "VS", vvs: "VVS" };
    const SIZES = ["1.3", "1.5", "2.0", "3.0"];
    const EXTENSIONS = { medium: "Medium (+2mm)", long: "Long (+4mm)", curved: "Curved design", xl: "XL fangs (8mm+)" };

    const money = (n) => "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
    const int = (v) => (v === "" || v === null || v === undefined ? NaN : Number(v));

    function jawOf(tooth) {
        if (UPPER.includes(tooth)) return "upper";
        if (LOWER.includes(tooth)) return "lower";
        return null;
    }

    /** Normalise raw input (form values or URL params) into a clean config. */
    function normalize(raw) {
        const r = raw || {};
        const teethList = (Array.isArray(r.teeth) ? r.teeth : String(r.teeth || "").split(","))
            .map((t) => String(t).trim()).filter((t) => jawOf(t));
        const teeth = Array.from(new Set(teethList));
        const cuts = (Array.isArray(r.cuts) ? r.cuts : String(r.cuts || "").split(","))
            .map((c) => String(c).trim()).filter((c) => c in catalog.customCuts);
        const hasStoneTeeth = Object.prototype.hasOwnProperty.call(r, "stoneTeeth");
        const stoneTeethRaw = Array.isArray(r.stoneTeeth) ? r.stoneTeeth : String(r.stoneTeeth || "").split(",");
        const stoneTeeth = Array.from(new Set(stoneTeethRaw.map((t) => String(t).trim())))
            .filter((t) => jawOf(t) && teeth.includes(t));
        const stoneShape = r.stoneShape === "square" ? "square" : "round";
        const stoneLayout = typeof r.stoneLayoutSerialized === "string"
            ? r.stoneLayoutSerialized
            : (typeof r.stoneLayout === "string" ? r.stoneLayout : "");
        return {
            design: r.design in DESIGNS ? r.design : "grillz",
            metal: r.metal in METALS ? r.metal : "silver",
            teeth,
            upperCount: teeth.length ? teeth.filter((t) => jawOf(t) === "upper").length : int(r.upperCount ?? 0),
            lowerCount: teeth.length ? teeth.filter((t) => jawOf(t) === "lower").length : int(r.lowerCount ?? 0),
            finish: r.finish === "custom" ? "custom" : "standard",
            shipping: r.shipping === "rush" ? "rush" : "standard",
            extension: r.extension in EXTENSIONS ? r.extension : "",
            stones: r.stones in STONES ? r.stones : "none",
            clarity: r.clarity in CLARITY ? r.clarity : "commercial",
            size: SIZES.includes(String(r.size)) ? String(r.size) : "1.3",
            stoneCount: int(r.stoneCount ?? 0),
            stoneShape,
            stoneTeeth: hasStoneTeeth ? stoneTeeth : teeth.slice(),
            stoneLayout,
            cuts: Array.from(new Set(cuts))
        };
    }

    /**
     * Returns { ok, error, status, lines[], knownSubtotal, total, quoteReasons[], notes[], config, version }.
     * status: "estimate" (every line has a published price) or "quote" (some part needs a quote).
     * total is null whenever status is "quote" — a final total is never invented.
     */
    function calculate(raw) {
        const c = normalize(raw);
        const out = { ok: false, error: "", status: "quote", lines: [], knownSubtotal: 0, total: null, quoteReasons: [], notes: [], config: c, version: catalog.version };
        const add = (label, amount) => { out.lines.push({ label, amount }); out.knownSubtotal += amount; };

        const validCount = (n) => Number.isInteger(n) && n >= 0 && n <= 16;
        if (!validCount(c.upperCount) || !validCount(c.lowerCount)) {
            out.error = "Enter a whole number from 0 to 16 for each jaw, or select exact teeth.";
            return out;
        }
        const toothCount = c.upperCount + c.lowerCount;
        if (c.design === "grillz" && toothCount === 0) {
            out.error = "Enter an approximate tooth count for either jaw, or choose exact teeth, to see an estimate.";
            return out;
        }
        const minStones = c.stones === "none" ? 0 : 1;
        if (!Number.isInteger(c.stoneCount) || c.stoneCount < minStones || c.stoneCount > 100) {
            out.error = c.stones === "none" ? "Enter a whole number of stones from 0 to 100." : "Enter an approximate stone count from 1 to 100.";
            return out;
        }

        // Base piece
        if (c.metal === "quote") {
            out.quoteReasons.push("18K gold, white gold, and platinum are quote-based");
        } else if (c.design === "grillz") {
            const per = catalog.grillz[c.metal].perTooth;
            add(`${METALS[c.metal]} grillz: ${toothCount} ${toothCount === 1 ? "tooth" : "teeth"} × ${money(per)} (${c.upperCount} upper, ${c.lowerCount} lower)`, per * toothCount);
        } else {
            const price = catalog.specialPieces[c.metal] && catalog.specialPieces[c.metal][c.design];
            if (typeof price === "number") add(`${METALS[c.metal]} ${DESIGNS[c.design].toLowerCase()}`, price);
            else out.quoteReasons.push(`${METALS[c.metal]} ${DESIGNS[c.design].toLowerCase()} is not in the published catalog`);
        }

        // Fang extension
        if (c.design === "fangs" && c.extension) add(`Fang extension: ${EXTENSIONS[c.extension]}`, catalog.fangExtensions[c.extension]);

        // Stones (setting labor is included per owner decision)
        if (c.stones !== "none") {
            const table = c.stones === "natural" ? catalog.naturalDiamonds[c.clarity] : catalog.alternativeStones[c.stones];
            const each = table[c.size];
            const name = c.stones === "natural" ? `${CLARITY[c.clarity]} natural diamond` : STONES[c.stones];
            add(`Stones: ${c.stoneCount} × ${name} ${c.size}mm at ${money(each)}`, each * c.stoneCount);
            out.notes.push("Stone setting labor is included in published pricing.");
        } else if (c.stoneCount > 0) {
            out.notes.push(`About ${c.stoneCount} stones planned — choose a stone type to price them.`);
        }

        // Custom cuts: charged once per set (each upper or lower piece)
        if (c.cuts.length) {
            const sets = c.design === "grillz" ? (c.upperCount > 0 ? 1 : 0) + (c.lowerCount > 0 ? 1 : 0) : 1;
            c.cuts.forEach((cut) => {
                const each = catalog.customCuts[cut];
                add(`${catalog.customCutLabels[cut]}: ${money(each)} per set × ${sets} ${sets === 1 ? "set" : "sets"}`, each * sets);
            });
        }
        if (c.finish === "custom") out.quoteReasons.push("custom finishes are priced per design");

        // Shipping: rush replaces standard
        if (c.shipping === "rush") {
            add("Rush shipping (replaces standard shipping)", catalog.products.rushDelivery);
            out.notes.push("Rush eligibility and production capacity are confirmed by the team before the order is accepted.");
        } else {
            add("Standard FedEx shipping", catalog.products.standardGrillzShipping);
        }

        out.knownSubtotal = Math.round(out.knownSubtotal * 100) / 100;
        out.ok = true;
        out.status = out.quoteReasons.length ? "quote" : "estimate";
        out.total = out.status === "estimate" ? out.knownSubtotal : null;
        return out;
    }

    /** Plain-text summary used in the submitted order so the owner sees exactly what the customer saw. */
    function summaryText(est) {
        if (!est.ok) return "";
        const parts = est.lines.map((l) => `${l.label}: ${money(l.amount)}`);
        if (est.status === "estimate") parts.push(`ESTIMATE TOTAL: ${money(est.total)}`);
        else {
            parts.push(`Known subtotal: ${money(est.knownSubtotal)}`);
            parts.push(`CUSTOM QUOTE REQUIRED: ${est.quoteReasons.join("; ")}`);
        }
        est.notes.forEach((n) => parts.push(n));
        parts.push(`Pricing version: ${est.version}`);
        return parts.join("\n");
    }

    /** Serialise a config to URL params for the pricing page → order form hand-off. */
    function toParams(c) {
        return {
            quote: "configurator", design: c.design, metal: c.metal,
            upperCount: String(c.upperCount), lowerCount: String(c.lowerCount), teeth: c.teeth.join(","),
            finish: c.finish, shipping: c.shipping, extension: c.extension,
            stones: c.stones, clarity: c.clarity, size: c.size, stoneCount: String(c.stoneCount),
            cuts: c.cuts.join(","), stoneShape: c.stoneShape,
            stoneTeeth: (c.stoneTeeth || []).join(","),
            stoneLayout: c.stoneLayoutSerialized || c.stoneLayout || "",
            pv: catalog.version
        };
    }

    return { calculate, normalize, summaryText, toParams, money, jawOf, labels: { DESIGNS, METALS, STONES, CLARITY, EXTENSIONS } };
});
