// Static-site SEO, navigation, and intro regression checks.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const json = (file) => JSON.parse(read(file));

test("main customer-facing pages use the shared home-style header", () => {
  const pages = [
    "index.html", "pricing.html", "mold-form.html", "press-on-nails.html", "gold-teeth-reno.html",
    "gold-teeth-tahoe.html", "service-areas.html", "blog.html", "gift-card.html",
    "tax-time-promo.html", "safety-policy.html", "partner-signup.html",
    "ambassador.html", "intro-music.html"
  ];
  for (const page of pages) {
    const html = read(page);
    assert.match(html, /<header class="ms-site-header">/, page + " header");
    assert.match(html, /assets\/site-header\.css/, page + " shared CSS");
    assert.match(html, /assets\/site-header\.js/, page + " shared navigation JS");
  }
});

test("shared navigation supports mobile open, close, and Escape", () => {
  const js = read("assets/site-header.js");
  const css = read("assets/site-header.css");
  assert.match(js, /button\.addEventListener\("click"/);
  assert.match(js, /event\.key === "Escape"/);
  assert.match(js, /aria-expanded/);
  assert.match(css, /data-open="true"/);
  assert.match(css, /max-width: 1080px/);
});

test("intro actions are native homepage links with external controller enhancements", () => {
  const html = read("index.html");
  const js = read("assets/sound.js");
  const css = read("assets/sound.css");
  const introStart = html.indexOf('<div id="videoIntro"');
  const headerStart = html.indexOf('<header class="ms-site-header">', introStart);
  const introMarkup = html.slice(introStart, headerStart);
  assert.match(introMarkup, /<a id="introPlay" href="#home"[^>]*data-intro-action="play"/);
  assert.match(introMarkup, /<a href="#home"[^>]*data-intro-action="quiet"/);
  assert.match(introMarkup, /<a href="#home"[^>]*data-intro-action="skip"/);
  assert.match(html, /<main id="home">/);
  assert.doesNotMatch(introMarkup, /<button[^>]*data-intro-action/);
  assert.match(js, /target\.closest\("a\[data-intro-action\]"\)/);
  assert.doesNotMatch(js, /event\.preventDefault\(\)[\s\S]*?data-intro-action/);
  assert.match(js, /function keepIntroVideoMoving\(\)/);
  assert.match(js, /keepIntroVideoMoving\(\);/);
  assert.doesNotMatch(js, /if \(reduceMotion && video\) video\.pause\(\)/);
  assert.match(css, /html:has\(:target\) #videoIntro \{ display: none !important; \}/);
  assert.match(html, /assets\/sound\.js\?v=20261122-intro-native-entry/);
});


test("intro dismissal persists across Home navigation and repeat visits", () => {
  const js = read("assets/sound.js");
  const html = read("index.html");
  const storeBlock = js.match(/const store = \{[\s\S]*?\n    \};/);
  assert.ok(storeBlock, "intro storage helper exists");
  const storeText = storeBlock[0];
  assert.ok(
    storeText.indexOf("window.localStorage.getItem") < storeText.indexOf("readCookie(key)") &&
    storeText.indexOf("readCookie(key)") < storeText.indexOf("window.sessionStorage.getItem"),
    "persistent storage and cookie fallback are checked before session storage"
  );
  assert.match(js, /function readCookie\(key\)/);
  assert.match(js, /function writeCookie\(key, value\)/);
  assert.match(js, /document\.cookie/);
  assert.match(js, /Max-Age=31536000/);
  assert.match(storeText, /window\.localStorage\.setItem\(key, value\)/);
  assert.match(storeText, /window\.sessionStorage\.setItem\(key, value\)/);
  assert.match(js, /if \(store\.get\("introSeen"\)\)/);
  assert.match(js, /event\.key === "introSeen" && event\.newValue === "true"/);
  assert.match(js, /function markIntroSeen\(\)/);
  assert.doesNotMatch(js, /forceIntro/);
  assert.match(html, /class="ms-site-brand" href="\/#home" aria-label="Mr\. Sprinkle home"/);
  assert.match(html, /href="\/#home">Home<\/a>/);
  assert.match(html, /assets\/sound\.js\?v=20261122-intro-native-entry/);
});

test("homepage and area hub clearly target Reno and nearby Northern Nevada", () => {
  const home = read("index.html");
  const areas = read("service-areas.html");
  assert.match(home, /Custom Grillz in Reno &amp; Sparks/);
  assert.match(home, /id="service-area"/);
  for (const place of ["Reno", "Sparks", "Spanish Springs", "Sun Valley", "Carson City", "Fernley", "Truckee"]) {
    assert.match(areas, new RegExp(place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), place);
  }
  assert.match(areas, /Envy Kutz — Braids &amp; Locs/i);
  assert.match(areas, /Appointments are by appointment only/i);
  assert.match(areas, /confirmed individually/i);
});

test("AI context pricing rules match the published pricing catalog", () => {
  const context = json("ai-context.json");
  const catalog = require("../assets/pricing-catalog.js");
  assert.deepEqual(context.publishedPricing.customCutsPerSet, {
    "diamond/dust cut": 30,
    "center/split line": 20,
    "open face/window cut": 40,
    "deep/bar cut": 30
  });
  assert.equal(context.pricingRules.stoneSettingLabor, "included in published pricing");
  assert.equal(context.pricingRules.customCuts.includes("separate sets"), true);
  assert.equal(catalog.customCuts.diamondDust, 30);
  assert.equal(catalog.customCuts.centerSplit, 20);
  assert.equal(catalog.customCuts.openFace, 40);
  assert.equal(catalog.customCuts.deepBar, 30);
  assert.equal(catalog.rules.settingLabor, "included");
});

test("structured data avoids misrepresenting the partner appointment venue as a storefront", () => {
  const schema = json("schema.json");
  const types = schema["@graph"].map((item) => item["@type"]);
  assert.ok(types.includes("Organization"));
  assert.ok(types.includes("Service"));
  assert.ok(!types.includes("LocalBusiness"));
});

test("sitemap focuses on customer-facing Nevada pages", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /service-areas\.html/);
  assert.match(sitemap, /gold-teeth-reno\.html/);
  assert.match(sitemap, /press-on-nails\.html/);
  assert.doesNotMatch(sitemap, /ambassador-portal\.html|admin-dashboard\.html|gold-teeth-seattle\.html|gold-teeth-bay-area\.html|ai-context\.json/);
});

test("OAI search discovery is allowed and current GPTBot policy is preserved", () => {
  const robots = read("robots.txt");
  assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//s);
  assert.match(robots, /User-agent: GPTBot\s+Allow: \//s);
  assert.match(robots, /Sitemap: https:\/\/mrsprinklereno\.com\/sitemap\.xml/);
});

test("nonlocal Bay Area and Seattle pages are noindex", () => {
  assert.match(read("gold-teeth-bay-area.html"), /name="robots" content="noindex, follow"/);
  assert.match(read("gold-teeth-seattle.html"), /name="robots" content="noindex, follow"/);
});

test("published pages do not reintroduce unsupported gold safety guarantees", () => {
  const reno = read("gold-teeth-reno.html").toLowerCase();
  const blog = read("blog.html").toLowerCase();
  assert.doesNotMatch(reno, /medical-grade|0% tarnish|tarnish-free/);
  assert.doesNotMatch(blog, /0% tarnish guarantee|tarnish-free|hypoallergenic formulations/);
});

test("booking form continues to use the existing approved Formspree endpoint and requires artwork references on custom requests", () => {
  const form = read("mold-form.html");
  assert.match(form, /https:\/\/formspree\.io\/f\/myzpanyg/);
  assert.ok(form.includes('enctype="multipart/form-data"'));
  assert.ok(form.includes('id="customArtworkNotice"'));
  assert.ok(form.includes('referenceImageInput.required = true'));
  assert.ok(form.includes('imageDescriptionInput.required = true'));
  assert.ok(form.includes('custom_artwork_request:'));
});


test("Grill Maker booking handoff avoids repeated design questions and carries artwork forward", () => {
  const pricing = read("pricing.html");
  const form = read("mold-form.html");
  const handoff = read("assets/grill-artwork-handoff.js");
  const thanks = read("thank-you.html");

  assert.match(pricing, /id="grillArtworkReference"/);
  assert.match(pricing, /id="grillArtworkNotes"/);
  assert.match(pricing, /MrSprinkleArtworkHandoff\.save\(\{ file, notes \}\)/);
  assert.match(handoff, /indexedDB\.open\(DB_NAME, DB_VERSION\)/);
  assert.match(handoff, /file: file/);
  assert.match(form, /urlParams.get\('quote'\) === 'configurator'/);
  assert.match(form, /data-configurator-duplicate="materialType"/);
  assert.match(form, /data-configurator-duplicate="budget"/);
  assert.match(form, /data-configurator-duplicate="diamondType"/);
  assert.match(form, /id="configuratorBookingIntro"/);
  assert.match(form, /id="configuratorDesignText"/);
  assert.match(form, /referenceImageInput\.files = transfer\.files/);
  assert.match(form, /getElementById\('appointmentDate'\)\.required = true/);
  assert.match(form, /getElementById\('preferredTime'\)\.required = true/);
  assert.match(form, /step = '1800'/);
  assert.match(form, /within 24 hours to confirm availability/);
  assert.match(form, /body: formData/);
  assert.match(form, /appointment_availability_status: isConfiguratorBooking/);
  assert.match(form, /thank-you\.html\?booking=grillz/);
  assert.match(thanks, /grillBookingConfirmation/);
  assert.match(thanks, /contact you within 24 hours/);
});

test("custom press-on nails use individual impressions and catalog-based per-nail estimates without collecting card data", () => {
  const page = read("press-on-nails.html");
  const script = read("assets/press-on-nails.js");
  const home = read("index.html");
  const styles = read("styles.css");
  const catalog = read("assets/pricing-catalog.js");

  assert.match(page, /id="pressNailOrderForm"/);
  assert.match(page, /individual impression/i);
  assert.match(page, /name="nailFinger\[\]"/);
  assert.match(page, /10K Gold/);
  assert.match(page, /14K Gold/);
  assert.match(page, /assets\/pricing-catalog\.js/);
  assert.match(script, /catalog\.grillz\[metal\.value\]/);
  assert.match(script, /selectedMetal\.perTooth/);
  assert.match(catalog, /gold10k: Object\.freeze\(\{ perTooth: 240/);
  assert.match(catalog, /gold14k: Object\.freeze\(\{ perTooth: 300/);
  assert.match(script, /press_on_nails_order_request/);
  assert.match(page, /formspree\.io/);
  assert.match(page, /secure payment link/);
  assert.doesNotMatch(page, /name=["'](?:cardNumber|creditCard|cvv|cvc)["']/i);
  assert.match(home, /href="press-on-nails\.html"/);
  assert.match(home, /Build Your Nail Set/);
  assert.match(styles, /\.service-image img[\s\S]*?object-fit: contain/);
  assert.match(styles, /\.gallery-item img[\s\S]*?object-fit: contain/);
});

test("homepage service and gallery product photos are fully contained instead of cover-cropped", () => {
  const css = read("styles.css");
  const service = css.match(/\.service-image img\s*\{([^}]+)\}/);
  const gallery = css.match(/\.gallery-item img\s*\{([^}]+)\}/);
  assert.ok(service && /object-fit:\s*contain/.test(service[1]));
  assert.ok(gallery && /object-fit:\s*contain/.test(gallery[1]));
  assert.match(css, /\.gallery-item:hover img\s*\{[^}]*filter:/);
});

test("primary indexable pages have unique titles, descriptions, and canonical URLs", () => {
  const pages = [
    "index.html", "pricing.html", "mold-form.html", "gold-teeth-reno.html",
    "service-areas.html", "gold-teeth-tahoe.html", "blog.html",
    "gift-card.html", "safety-policy.html"
  ];
  const titles = new Map();
  for (const page of pages) {
    const html = read(page);
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    assert.ok(title, page + " title");
    assert.ok(description && description.length >= 70, page + " useful meta description");
    assert.ok(canonical, page + " canonical URL");
    assert.equal(canonical, "https://mrsprinklereno.com/" + (page === "index.html" ? "" : page), page + " canonical target");
    assert.ok(!titles.has(title), page + " title must be unique (also used by " + titles.get(title) + ")");
    titles.set(title, page);
  }
});

test("thank-you, partner intake, and expired 2025 promotion pages are excluded from indexing", () => {
  for (const page of ["thank-you.html", "partner-signup.html", "tax-time-promo.html"]) {
    assert.match(read(page), /<meta\s+name=["']robots["']\s+content=["']noindex,?\s*(?:nofollow|follow)["']/i, page + " noindex policy");
  }
  const sitemap = read("sitemap.xml");
  for (const page of ["thank-you.html", "partner-signup.html", "tax-time-promo.html", "gold-teeth-seattle.html", "gold-teeth-bay-area.html"]) {
    assert.equal(sitemap.includes(page), false, page + " excluded from sitemap");
  }
});

test("sitemap contains only canonical customer-facing URLs without duplicates", () => {
  const sitemap = read("sitemap.xml");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.ok(urls.length >= 8);
  assert.equal(new Set(urls).size, urls.length, "sitemap URLs are unique");
  for (const url of urls) {
    assert.match(url, /^https:\/\/mrsprinklereno\.com\//);
    const page = url.endsWith("/") ? "index.html" : url.split("/").pop();
    const html = read(page);
    const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
    assert.equal(canonical, url, page + " canonical equals sitemap URL");
    assert.doesNotMatch(html, /<meta\s+name=["']robots["']\s+content=["']noindex/i, page + " must be indexable");
  }
});

test("inline JSON-LD on the key search pages is valid JSON", () => {
  const pages = ["index.html", "pricing.html", "gold-teeth-reno.html", "service-areas.html", "gold-teeth-tahoe.html"];
  for (const page of pages) {
    const html = read(page);
    const blocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
    assert.ok(blocks.length > 0, page + " has structured data");
    for (const block of blocks) assert.doesNotThrow(() => JSON.parse(block[1]), page + " JSON-LD parses");
  }
});


test("archived 2025 giveaway page cannot accept payments or new entries", () => {
  const archive = read("tax-time-promo.html");
  assert.match(archive, /promotion has ended/i);
  assert.match(archive, /entries are closed/i);
  assert.match(archive, /retained for reference only/i);
  assert.doesNotMatch(archive, /paypal\.com\/cgi-bin\/webscr/i);
  assert.doesNotMatch(archive, /id=["']entryForm["']|id=["']freeEntryForm["']/i);
  assert.doesNotMatch(archive, /Buy \$10 Pass|Submit Free Entry/i);
  assert.doesNotMatch(archive, /const ENTRIES_FILE|Entry Submitted!/i);
});

test("blog content reflects the current grillz catalog and individual tooth-selection workflow", () => {
  const blog = read("blog.html");
  assert.match(blog, /per tooth/i);
  assert.match(blog, /select the exact upper and\s*\/or lower teeth/i);
  assert.match(blog, /not fixed tooth layouts/i);
  assert.match(blog, /\$100 \/ \$600 \/ \$1,200/);
  assert.match(blog, /\$240 \/ \$1,440 \/ \$2,880/);
  assert.match(blog, /\$300 \/ \$1,800 \/ \$3,600/);
  assert.match(blog, /\$320 \/ \$1,920 \/ \$3,840/);
  assert.match(blog, /Stone-setting labor is included/i);
  assert.doesNotMatch(blog, /Trends for 2025|January 2025|40-50% cost savings|opal inlays|\+\$150-\$300 per stone/i);
  assert.doesNotMatch(blog, /conflict-free certified|VS\+ clarity|medical-grade|tarnish-free|safe to eat, drink, or smoke/i);
  assert.doesNotMatch(blog, /gold-teeth-seattle\.html|gold-teeth-bay-area\.html/);
  assert.match(blog, /id="copyrightYear"/);
});

test("blog uses page-level collection and breadcrumb structured data", () => {
  const html = read("blog.html");
  const blocks = [...html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  assert.equal(blocks.length, 1);
  const graph = JSON.parse(blocks[0][1]);
  assert.ok(graph["@graph"].some((item) => item["@type"] === "CollectionPage"));
  assert.ok(graph["@graph"].some((item) => item["@type"] === "BreadcrumbList"));
});

test("Jekyll production output excludes public admin tools, backend source, and operational data", () => {
  const config = read("_config.yml");
  for (const pattern of [
    '"*.php"', '"**/*.php"', '"*.sql"', '"**/*.sql"',
    '"*.md"', '"**/*.md"', '"*.bat"', '"*.pdf"', '"*.zip"',
    '"admin-dashboard.html"', '"ai-sales-coach-24-7-final.html"',
    '"site-check.html"', '"test-script.html"', '"entries.json"',
    '"live-prospects.json"', '"scripts/"', '"tests/"',
    '"google-apps-script.js"', '"entry-tracking-setup.js"'
  ]) assert.ok(config.includes(`- ${pattern}`), `production exclusion: ${pattern}`);
  for (const publicPage of ["index.html", "pricing.html", "mold-form.html", "gold-teeth-reno.html", "service-areas.html", "blog.html"]) {
    assert.doesNotMatch(config, new RegExp(`- ["']${publicPage.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}['"]`));
  }
});

test("robots.txt advises crawlers to avoid internal and data endpoints without blocking public discovery", () => {
  const robots = read("robots.txt");
  assert.match(robots, /User-agent: \*\s+Allow: \/[\s\S]*Disallow: \/admin-dashboard\.html/);
  for (const path of ["/ai-sales-coach-24-7-final.html", "/site-check.html", "/test-script.html", "/entries.json", "/live-prospects.json", "/*.php$", "/*.sql$"]) {
    assert.ok(robots.includes(`Disallow: ${path}`), `crawler disallow: ${path}`);
  }
  assert.match(robots, /Sitemap: https:\/\/mrsprinklereno\.com\/sitemap\.xml/);
});


test("customer pages do not expose model-provider API keys or call model APIs from the browser", () => {
  for (const page of ["index.html", "pricing.html", "mold-form.html", "blog.html", "gold-teeth-reno.html"]) {
    const html = read(page);
    assert.doesNotMatch(html, /api\.x\.ai\/v1\/chat\/completions|YOUR_GROK_API_KEY|YOUR_API_KEY_HERE/i, page + " has no browser model API key/call");
  }
  for (const page of ["mold-form.html", "blog.html"]) {
    assert.match(read(page), /href="sms:\+15302140676"/i, page + " retains direct customer contact");
  }
});


test("grill designer renders a dental-arch diagram without changing the estimate engine", () => {
  const html = read("pricing.html");
  const preview = read("assets/grill-preview.js");
  assert.match(html, /assets\/grill-preview\.js/);
  assert.match(html, /MrSprinkleGrillPreview\.render\(designPreview, config\)/);
  assert.match(preview, /viewBox: "0 0 800 370"/);
  assert.match(preview, /UPPER ARCH/);
  assert.match(preview, /LOWER ARCH/);
  assert.match(preview, /aria-label/);
  assert.match(preview, /metal\.start/);
  assert.match(preview, /selected\.has\(tooth\)/);
  assert.match(preview, /No exact tooth positions have been chosen/);
  assert.match(preview, /exact stone positions are not captured/);
  assert.match(preview, /not dental CAD or a manufacturing model/);
  assert.doesNotMatch(html, /preview-tooth/);
  // Price logic is kept in the dedicated estimate file; preview code only reads its normalized configuration.
  assert.doesNotMatch(preview, /calculate\(|catalog\.grillz|knownSubtotal/);
});


test("Sprinkle Studio 3D uses exact arch selection and a pinned live mockup", () => {
  const html = read("pricing.html");
  const model = read("assets/grill-studio-3d.js");
  const css = read("assets/grill-studio.css");
  const stoneCss = read("assets/grill-stone-editor.css");
  assert.match(html, /three@0\.187\.0\/build\/three\.module\.js/);
  assert.match(html, /id="upperTeeth" class="tooth-arch-picker"/);
  assert.match(html, /id="lowerTeeth" class="tooth-arch-picker"/);
  assert.match(html, /id="grill3DViewport"/);
  assert.match(html, /Close-up smile view/);
  assert.doesNotMatch(html, /data-grill-view=/);
  assert.match(html, /data-metal-swatch="gold14k"/);
  assert.match(html, /id="selectUpperTeeth"/);
  assert.match(html, /id="selectLowerTeeth"/);
  assert.doesNotMatch(html, /estimateUpperCount|estimateLowerCount/);
  assert.match(html, /window\.MrSprinkleGrillSelectTooth/);
  assert.match(model, /const UPPER = \["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"\]/);
  assert.match(model, /const LOWER = \["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"\]/);
  assert.match(model, /new THREE\.WebGLRenderer/);
  assert.match(model, /new THREE\.MeshPhysicalMaterial/);
  assert.doesNotMatch(model, /OrbitControls/);
  assert.match(model, /function setFrontCamera/);
  assert.doesNotMatch(model, /function createDentalCastBase/);
  assert.match(model, /function createOralCavity/);
  assert.match(model, /function toothClass\(index\)/);
  assert.match(model, /if \(centerDistance >= 6\) return "incisor"/);
  assert.match(model, /if \(centerDistance === 5\) return "canine"/);
  assert.match(model, /if \(centerDistance >= 3\) return "premolar"/);
  assert.match(model, /function makeLipGeometry\(isUpper\)/);
  assert.match(model, /const crownZ = isUpper \? 0\.45 : -0\.45/);
  assert.match(model, /function createSmileLips/);
  assert.match(model, /const crownZ = isUpper \? 0\.45 : -0\.45/);
  assert.match(model, /innerZ = 0\.84 \* taper/);
  assert.match(model, /innerZ = -0.84 \* taper/);
  assert.ok(model.includes("camera.position.set(0.02, -4.8, 0.58)"));
  assert.match(html, /grill-3d-viewport--smile/);
  assert.match(html, /Your smile\. Your design\./);
  assert.match(stoneCss, /\.grill-3d-viewport--smile/);
  assert.match(model, /function addDesignDetails/);
  assert.match(model, /function crownFrontSurfaceY/);
  assert.match(model, /function samplePaveConfig/);
  assert.match(model, /stoneCount: sampleTeeth.length \* 25/);
  assert.match(model, /Sample full-pavé grill/);
  assert.match(stoneCss, /aspect-ratio:1\.105 \/ 1/);
  assert.match(html, /contoured-crowns-v1/);
  assert.match(model, /function buildReferenceSampleLayer/);
  assert.doesNotMatch(model, /assets\/grill-reference\.webp\.b64/);
  assert.doesNotMatch(model, /grill-reference-tooth-hit/);
  assert.match(model, /function setReferenceSampleVisible\(\)/);
  assert.match(model, /renderer\.domElement\.style\.opacity = "1"/);
  assert.match(model, /design reference only/);
  assert.doesNotMatch(model, /permanent visual foundation during customization/);
  assert.match(model, /window\.MrSprinkleGrillSelectTooth\(toothNumber\)/);
  assert.match(model, /renderer\.domElement\.addEventListener\("pointerup", handlePointerUp\)/);
  assert.match(model, /function makeBrilliantCutGeometry/);
  assert.match(model, /Four polished micro-prongs make each round stone read as a real setting/);
  assert.match(stoneCss, /height:390px;min-height:360px/);
  assert.match(model, /new THREE\.CylinderGeometry\(fitDiameter \* 0\.53/);
  assert.doesNotMatch(model, /surfaceRatio/);
  assert.match(model, /const jawSign = item\.jaw === "upper" \? -1 : 1/);
  assert.match(model, /function addEnamelOverlay/);
  assert.match(css, /\.tooth-arch-picker/);
  assert.match(css, /\.grill-3d-viewport/);
  assert.match(stoneCss, /\.grill-3d-viewport--mouth/);
  assert.match(css, /\.grill-metal-swatches/);
});

test("Sprinkle Studio renders one complete 16-tooth arch per jaw", () => {
  const html = read("pricing.html");
  const script = html.slice(html.indexOf("const toothGroups = ["), html.indexOf("const SVG_NS", html.indexOf("const toothGroups = [")));
  assert.match(script, /label: 'Upper jaw', teeth: Stone\.upper\.slice\(\)/);
  assert.match(script, /label: 'Lower jaw', teeth: Stone\.lower\.slice\(\)/);
  assert.doesNotMatch(script, /Upper right|Upper left|Lower right|Lower left/);
  assert.match(html, /data-tooth-kind/);
  assert.match(html, /central-incisor/);
  assert.match(html, /lateral-incisor/);
  assert.match(html, /tooth-groove/);
});

test("customers can choose stone-bearing teeth and edit round or square per-tooth positions", () => {
  const html = read("pricing.html");
  const model = read("assets/grill-studio-3d.js");
  const layout = read("assets/grill-stone-layout.js");
  const css = read("assets/grill-stone-editor.css");
  assert.match(html, /id="toothModeStones"/);
  assert.match(html, /id="stoneTargetTeeth"/);
  assert.match(html, /id="stoneEditToothChips"/);
  assert.match(html, /function selectActiveStoneTooth/);
  assert.match(html, /data-stone-shape="round"/);
  assert.match(html, /data-stone-shape="square"/);
  assert.match(html, /id="stonePlacementGrid"/);
  assert.match(html, /data-stone-material="natural"/);
  assert.match(html, /data-stone-material="cubicZirconia"/);
  assert.match(html, /id="stoneColorPicker"/);
  assert.match(html, /data-stone-color="#f3a8c8"/);
  assert.match(html, /function handleStoneCellClick/);
  assert.match(html, /className = 'stone-target-remove'/);
  assert.match(html, /button\.addEventListener\('dragstart'/);
  assert.match(html, /Stone\.serialize\(layoutState\)/);
  assert.match(layout, /function createDefault\(targets, requestedCount, options\)/);
  assert.match(layout, /function move\(/);
  assert.match(layout, /function allowedCells\(size\)/);
  assert.match(model, /placements\[item\.number\]/);
  assert.match(model, /stoneProfiles\[item\.number\]/);
  assert.match(model, /materialForStone\(stoneType, stoneColor\)/);
  assert.match(model, /RoundedBoxGeometry/);
  assert.match(css, /\.stone-placement-grid/);
  assert.match(css, /\.stone-slot\[data-stone-shape="square"\]/);
  assert.match(html, /id="enamelStudioHeading"/);
  assert.match(html, /id="enamelTargetTeeth"/);
  assert.match(html, /data-enamel-color="#f3a8c8"/);
  assert.match(html, /id="customArtworkQuoteLink"/);
  assert.match(html, /customHandoff\.set\('customArtwork', 'true'\)/);
  assert.match(css, /\.grill-enamel-studio/);
  assert.match(css, /\.custom-artwork-request/);
});

test("intro video remains playable and the native entry links bypass the overlay", () => {
  const html = read("index.html");
  const js = read("assets/sound.js");
  const videoStart = html.indexOf('<video id="introVideo"');
  const videoEnd = html.indexOf("</video>", videoStart);
  const videoTag = html.slice(videoStart, videoEnd);
  assert.match(videoTag, /autoplay muted loop playsinline/);
  assert.match(js, /video\.muted = true/);
  assert.match(js, /const attempt = video\.play\(\)/);
  assert.doesNotMatch(js, /if \(reduceMotion && video\) video\.pause\(\)/);
  assert.match(html, /href="#home"[^>]*data-intro-action="skip"/);
  assert.match(html, /<main id="home">/);
});


test("3D crowns use a contoured tooth-specific occlusal surface rather than a flat cap", () => {
  const model = read("assets/grill-studio-3d.js");
  assert.match(model, /Build a contoured occlusal\/incisal surface instead of closing the crown/);
  assert.match(model, /const topRings = \[\];/);
  assert.match(model, /cuspProfile\(kind, nx, ny\)/);
  assert.match(model, /const connectedRings = topRings\.concat\(\[topStart\]\)/);
  assert.match(model, /if \(sign > 0\) indices\.push\(a, b, d, b, c, d\)/);
  assert.match(model, /if \(sign > 0\) indices\.push\(topCenter, innerStart \+ segment, innerStart \+ next\)/);
});


test("Grill Maker status uses correct singular and plural tooth terminology", () => {
  const model = read("assets/grill-studio-3d.js");
  const pricing = read("pricing.html");
  assert.match(model, /count === 1 \? " selected tooth" : " selected teeth"/);
  assert.match(pricing, /stoneTargets\.length === 1 \? ' selected tooth holds ' : ' selected teeth hold '/);
  assert.doesNotMatch(model, /selected tooth" \+ \(count === 1 \? "" : "s"\)/);
  assert.doesNotMatch(pricing, /target tooth\/tooth surfaces/);
});
