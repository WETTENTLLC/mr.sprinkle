// Static-site SEO, navigation, and intro regression checks.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const json = (file) => JSON.parse(read(file));

test("main customer-facing pages use the shared home-style header", () => {
  const pages = [
    "index.html", "pricing.html", "mold-form.html", "gold-teeth-reno.html",
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

test("intro controls use external click handlers and survive inline-script restrictions", () => {
  const html = read("index.html");
  const js = read("assets/sound.js");
  const css = read("assets/sound.css");
  const introStart = html.indexOf('<div id="videoIntro"');
  const headerStart = html.indexOf('<header class="ms-site-header">', introStart);
  const introMarkup = html.slice(introStart, headerStart);
  assert.match(introMarkup, /id="introPlay"[^>]*data-intro-action="play"/);
  assert.match(introMarkup, /data-intro-action="quiet"/);
  assert.match(introMarkup, /data-intro-action="skip"/);
  assert.doesNotMatch(introMarkup, /onclick=/i);
  assert.doesNotMatch(html, /mrSprinkleIntroAction/);
  assert.match(js, /function bindIntroActions\(\)/);
  assert.match(js, /intro\.querySelectorAll\("\[data-intro-action\]"\)/);
  assert.match(js, /button\.addEventListener\("click"/);
  assert.match(js, /action === "play"\) enterWithSound\(\)/);
  assert.match(js, /action === "quiet"\) enterQuietly\(button\)/);
  assert.match(js, /action === "skip"\) closeIntro\(\)/);
  assert.match(js, /function enterWithSound\(\)\s*\{\s*startAudioFromGesture\(\);\s*closeIntro\(\);/);
  assert.match(js, /document\.addEventListener\("click"[\s\S]*?true\)/);
  assert.match(js, /target\.closest\('a\[data-track="buy"\]'\)[\s\S]*?markIntroSeen\(\)/);
  assert.match(js, /function markIntroSeen\(\)/);
  assert.doesNotMatch(js, /play\(\)\.then/);
  assert.match(css, /Intro interaction hotfix/);
  assert.match(css, /#videoIntro \.ms-intro__content[\s\S]*?z-index:\s*20/);
  assert.match(css, /#videoIntro \.ms-track[\s\S]*?z-index:\s*5/);
  assert.match(css, /pointer-events: none/);
  assert.match(html, /assets\/sound\.js\?v=20261121-intro-controls-external-wiring/);
  assert.match(html, /assets\/sound\.css\?v=/);
});


test("intro dismissal persists for returning visitors and across Home navigation", () => {
  const js = read("assets/sound.js");
  const html = read("index.html");
  const storeBlock = js.match(/const store = \{[\s\S]*?\n    \};/);
  assert.ok(storeBlock, "intro storage helper exists");
  const storeText = storeBlock[0];
  assert.ok(
    storeText.indexOf("window.localStorage.getItem") < storeText.indexOf("window.sessionStorage.getItem"),
    "persistent storage is checked before session storage"
  );
  assert.match(storeText, /window\.localStorage\.setItem\(key, value\)/);
  assert.match(storeText, /window\.sessionStorage\.setItem\(key, value\)/);
  assert.match(js, /if \(store\.get\("introSeen"\)\)/);
  assert.match(js, /event\.key === "introSeen" && event\.newValue === "true"/);
  assert.doesNotMatch(js, /forceIntro/);
  assert.match(html, /assets\/sound\.js\?v=20261121-intro-controls-external-wiring/);
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

test("booking form continues to use the existing approved Formspree endpoint", () => {
  assert.match(read("mold-form.html"), /https:\/\/formspree\.io\/f\/myzpanyg/);
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


test("intro buttons call a direct entry action and the fallback works without the music controller", () => {
  const html = read("index.html");
  assert.match(html, /window\.mrSprinkleIntroAction = function \(action, button\)/);
  assert.match(html, /onclick="return window\.mrSprinkleIntroAction\('play', this\);"/);
  assert.match(html, /onclick="return window\.mrSprinkleIntroAction\('quiet', this\);"/);
  assert.match(html, /onclick="return window\.mrSprinkleIntroAction\('skip', this\);"/);
  assert.match(html, /window\.localStorage\.setItem\("introSeen", "true"\)/);
  assert.match(html, /intro\.hidden = true/);
  assert.match(html, /assets\/sound\.js\?v=20261121-intro-controls-external-wiring/);
  assert.match(html, /assets\/sound\.css\?v=20261121-intro-controls-external-wiring/);
  assert.doesNotMatch(read("assets/sound.js"), /target\.closest\("#introPlay"\)/);
});
