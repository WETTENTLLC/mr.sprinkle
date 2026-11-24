/*
 * Customer-facing 2D Grill Maker preview.
 * This is a design-planning diagram, not dental CAD or a manufacturing file.
 * Exact selected FDI teeth are highlighted; approximate counts never invent positions.
 */
(function (root) {
    "use strict";

    const NS = "http://www.w3.org/2000/svg";
    const UPPER = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
    const LOWER = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
    const METALS = {
        silver: { label: "Silver", start: "#f7f8fa", mid: "#b9c2ce", end: "#7f8b9c", stroke: "#e6ebf1" },
        gold10k: { label: "10K Gold", start: "#f7d27b", mid: "#c8912e", end: "#80531c", stroke: "#ffe2a0" },
        gold14k: { label: "14K Gold", start: "#ffdf83", mid: "#d5a43d", end: "#94631e", stroke: "#fff0b7" },
        dentalGold14k: { label: "14K Dental Gold", start: "#ffeca6", mid: "#d8b85c", end: "#94742c", stroke: "#fff7d4" },
        quote: { label: "Quote-based metal", start: "#d6b86b", mid: "#a88b47", end: "#74592d", stroke: "#ead18a" }
    };
    const EXTENSION = { medium: 7, long: 13, curved: 16, xl: 23 };

    function node(tag, attrs, text) {
        const el = document.createElementNS(NS, tag);
        Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, String(value)));
        if (text !== undefined) el.textContent = text;
        return el;
    }

    function crownPath(width, height, jaw, fang) {
        if (fang && jaw === "upper") {
            return `M ${-width * .36} ${-height / 2} Q ${-width * .5} ${-height * .28} ${-width * .43} ${height * .1} Q 0 ${height * .72} ${width * .43} ${height * .1} Q ${width * .5} ${-height * .28} ${width * .36} ${-height / 2} Z`;
        }
        if (fang && jaw === "lower") {
            return `M ${-width * .36} ${height / 2} Q ${-width * .5} ${height * .28} ${-width * .43} ${-height * .1} Q 0 ${-height * .72} ${width * .43} ${-height * .1} Q ${width * .5} ${height * .28} ${width * .36} ${height / 2} Z`;
        }
        return `M ${-width * .31} ${-height / 2} Q ${-width * .49} ${-height * .43} ${-width * .49} ${-height * .12} L ${-width * .42} ${height * .28} Q 0 ${height * .57} ${width * .42} ${height * .28} L ${width * .49} ${-height * .12} Q ${width * .49} ${-height * .43} ${width * .31} ${-height / 2} Z`;
    }

    function drawRow(svg, teeth, jaw, selected, metal, config) {
        const defs = svg.querySelector("defs");
        const rowLabelY = jaw === "upper" ? 25 : 345;
        svg.appendChild(node("text", {
            x: 18, y: rowLabelY, fill: "#665a43", "font-size": 14,
            "font-family": "Arial, sans-serif", "font-weight": "700"
        }, jaw === "upper" ? "UPPER ARCH" : "LOWER ARCH"));

        const center = 400;
        const radius = 312;
        teeth.forEach((tooth, index) => {
            const t = (index - 7.5) / 7.5;
            const x = center + radius * t;
            const curve = 62 * t * t;
            const y = jaw === "upper" ? 90 + curve : 270 - curve;
            const width = index <= 1 || index >= 14 ? 36 : (index <= 3 || index >= 12 ? 34 : (index <= 5 || index >= 10 ? 30 : 27));
            const extension = config.design === "fangs" ? (EXTENSION[config.extension] || 0) : 0;
            const height = 42 + extension;
            const rotation = t * (jaw === "upper" ? -13 : 13);
            const isSelected = selected.has(tooth);
            const group = node("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotation.toFixed(1)})` });
            const fill = isSelected ? `url(#${metal.id})` : "#fffdf8";
            const stroke = isSelected ? metal.stroke : "#b9ad99";

            group.appendChild(node("path", {
                d: crownPath(width, height, jaw, config.design === "fangs" && isSelected),
                fill, stroke, "stroke-width": isSelected ? 2 : 1.25,
                "stroke-linejoin": "round"
            }));

            if (isSelected) {
                group.appendChild(node("path", {
                    d: `M ${-width * .2} ${-height * .33} Q 0 ${-height * .42} ${width * .2} ${-height * .33}`,
                    fill: "none", stroke: "rgba(255,255,255,.62)", "stroke-width": 2,
                    "stroke-linecap": "round"
                }));
                if (config.cuts && config.cuts.length) {
                    group.appendChild(node("path", {
                        d: `M ${-width * .25} 0 L ${width * .25} 0`,
                        fill: "none", stroke: "rgba(70,45,15,.62)", "stroke-width": 1.4,
                        "stroke-dasharray": config.cuts.includes("openFace") ? "2 2" : "none"
                    }));
                }
            }
            svg.appendChild(group);

            if (isSelected) {
                const labelY = jaw === "upper" ? y + height / 2 + 15 : y + height / 2 + 15;
                svg.appendChild(node("text", {
                    x, y: labelY, fill: "#3a3022", "font-size": 13,
                    "font-family": "Arial, sans-serif", "font-weight": "700",
                    "text-anchor": "middle"
                }, tooth));
            }
        });

        // A restrained curved gum/arch guide helps make the two rows readable.
        const points = teeth.map((_, i) => {
            const t = (i - 7.5) / 7.5;
            return [center + radius * t, jaw === "upper" ? 90 + 62 * t * t - 25 : 270 - 62 * t * t + 25];
        });
        svg.appendChild(node("polyline", {
            points: points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "),
            fill: "none", stroke: jaw === "upper" ? "#bd8b80" : "#bd8b80",
            "stroke-width": 2.5, opacity: .78, "stroke-linecap": "round", "stroke-linejoin": "round"
        }));
    }

    function render(container, config) {
        if (!container) return;
        const c = config || {};
        const metal = Object.assign({ ...METALS.silver, id: "previewMetal" }, METALS[c.metal] || METALS.silver);
        metal.id = "previewMetal";
        const selected = new Set(Array.isArray(c.teeth) ? c.teeth.map(String) : []);
        container.replaceChildren();

        const meta = document.createElement("p");
        meta.className = "preview-meta";
        meta.textContent = `${metal.label} · ${{ grillz: "Standard grillz", fangs: "Fangs", gapFiller: "Gap filler" }[c.design] || "Grillz design"} · ${{ none: "No stones", natural: "Natural diamonds", labGrownDiamond: "Lab-grown diamonds", vvsMoissanite: "VVS moissanite", cubicZirconia: "Cubic zirconia" }[c.stones] || "Stone options"}`;
        container.appendChild(meta);

        const svg = node("svg", {
            class: "preview-arch", viewBox: "0 0 800 370", role: "img",
            "aria-label": "Schematic upper and lower dental arch. Selected teeth are shown in the chosen grill material.",
            preserveAspectRatio: "xMidYMid meet"
        });
        svg.appendChild(node("rect", { x: 0, y: 0, width: 800, height: 370, rx: 14, fill: "#f6f2e9" }));
        svg.appendChild(node("title", {}, "Mr. Sprinkle Grillz technical design preview"));
        svg.appendChild(node("desc", {}, "A simplified front-facing dental arch diagram. Highlighted tooth numbers match the selected FDI teeth. This illustration is not dental CAD or a manufacturing model."));
        const defs = node("defs", {});
        const gradient = node("linearGradient", { id: metal.id, x1: "0", y1: "0", x2: "0.9", y2: "1" });
        gradient.append(
            node("stop", { offset: "0%", "stop-color": metal.start }),
            node("stop", { offset: "52%", "stop-color": metal.mid }),
            node("stop", { offset: "100%", "stop-color": metal.end })
        );
        defs.appendChild(gradient);
        svg.appendChild(defs);

        drawRow(svg, UPPER, "upper", selected, metal, c);
        drawRow(svg, LOWER, "lower", selected, metal, c);
        container.appendChild(svg);

        const note = document.createElement("p");
        note.className = "preview-note";
        if (c.design === "gapFiller") {
            note.textContent = "Gap-filler geometry and exact position require mold review; this diagram does not represent the finished fit.";
        } else if (!selected.size) {
            const upper = Number(c.upperCount) || 0;
            const lower = Number(c.lowerCount) || 0;
            note.textContent = upper || lower
                ? `Approximate coverage only: ${upper} upper and ${lower} lower teeth. No exact tooth positions have been chosen, so no crowns are highlighted.`
                : "Choose exact teeth to highlight the grill coverage. Count-only selections remain approximate.";
        } else if (Number(c.stoneCount) > 0 && c.stones !== "none") {
            note.textContent = `Selected FDI teeth are highlighted. ${c.stoneCount} ${metal.label} design stone(s) are included in the estimate; use the stone placement editor below to choose exact positions on each selected tooth.`;
        } else if (c.cuts && c.cuts.length) {
            note.textContent = "Highlighted caps follow your selected teeth. Cut styling is indicated schematically; final engraving and fit require design confirmation.";
        } else {
            note.textContent = "Highlighted caps follow your selected FDI tooth numbers. Concept diagram only — final contours, thickness, fit, and manufacturing details are confirmed from the mold and approved design.";
        }
        container.appendChild(note);
    }

    root.MrSprinkleGrillPreview = Object.freeze({ render });
})(typeof window !== "undefined" ? window : globalThis);
