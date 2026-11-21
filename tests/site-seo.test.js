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

test("intro controls remain clickable and enter on the first Play click", () => {
  const html = read("index.html");
  const js = read("assets/sound.js");
  const css = read("assets/sound.css");
  assert.match(html, /id="introPlay"/);
  assert.match(html, /Enter quietly/);
  assert.match(html, /id="introStatus"/);
  assert.match(js, /function enterWithSound\(\)\s*\{\s*startAudioFromGesture\(\);\s*closeIntro\(\);/);
  assert.match(js, /document\.addEventListener\("click"[\s\S]*?true\)/);
  assert.match(js, /target\.closest\('a\[data-track="buy"\]'\)[\s\S]*?markIntroSeen\(\)/);
  assert.match(js, /function markIntroSeen\(\)/);
  assert.doesNotMatch(js, /play\(\)\.then/);
  assert.match(css, /Intro interaction hotfix/);
  assert.match(css, /#videoIntro \.ms-intro__content[\s\S]*?z-index:\s*20/);
  assert.match(css, /#videoIntro \.ms-track[\s\S]*?z-index:\s*5/);
  assert.match(css, /pointer-events: none/);
  assert.match(html, /assets\/sound\.js\?v=/);
  assert.match(html, /assets\/sound\.css\?v=/);
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
