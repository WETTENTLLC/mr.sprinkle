# Mr. Sprinkle Search Growth Standard
## SEO + AIO (Answer/AI Engine Optimization) + GEO (Generative Engine Optimization)

**Status:** Standing project standard  
**Owner:** Mr. Sprinkle / WETT Entertainment  
**Domain:** https://mrsprinklereno.com  
**Last researched:** 2026-11-20  
**Applies to:** All future Mr. Sprinkle website, content, local-search, product, technical, analytics, and digital-PR work.

---

## 1. Operating mandate

Every material Mr. Sprinkle website change must be evaluated against three connected disciplines:

1. **SEO — Search Engine Optimization:** make the site crawlable, indexable, technically sound, useful, fast, accessible, and relevant for high-intent search.
2. **AIO — Answer / AI Engine Optimization:** make Mr. Sprinkle's real business facts, products, services, prices, process, policies, and expertise easy for answer engines and AI assistants to retrieve, understand, verify, summarize, and link to.
3. **GEO — Generative Engine Optimization:** build durable visibility and citations in generative search and answer experiences through original expertise, a clearly understood brand entity, credible third-party corroboration, strong information architecture, and measurable evidence of visibility.

These are not three separate keyword-stuffing programs. They are one search-growth system built around the same accurate, useful source of truth.

**Default rule:** do not ship important page, template, pricing, location, product, or booking changes until the SEO/AIO/GEO implications have been reviewed. Emergency security or availability fixes are the exception; add the search review to the follow-up release.

This is an operating standard, not a promise of rankings, AI citations, revenue, or a particular traffic outcome.

## 2. Strategic positioning and brand facts

The site should establish one consistent entity:

- **Brand:** Mr. Sprinkle
- **Primary website:** https://mrsprinklereno.com
- **Primary market:** Reno, Nevada
- **Core commercial topic:** custom grillz / gold teeth / custom dental jewelry and related customization
- **Brand presentation:** premium urban luxury; black, champagne gold and platinum/silver; real product photography and authentic process evidence.
- **Primary conversion actions:** start a grill design/estimate, request a quote, submit a mold/appointment request, call, and complete an agreed booking process.

Use the current owner-approved product catalog and the current site as source-of-truth inputs. Never invent price, material composition, karat, stone grade, fit, safety, durability, turnaround, warranty, return, deposit, shipping, or appointment claims.

### Claims and terminology guardrails

- Do not call Mr. Sprinkle a dentist, dental clinic, medical provider, or licensed dental professional unless the business owner supplies verifiable qualifications and the claim is legally appropriate.
- Do not state that grillz are medical-grade, medically safe, non-toxic, guaranteed not to tarnish, safe to eat/drink/smoke in, or suitable for every customer without appropriate substantiation and review.
- Do not present a partner salon as a Mr. Sprinkle storefront or imply it is permanently staffed by Mr. Sprinkle unless this is factually true.
- Distinguish custom jewelry / grillz from dental treatment. Avoid health outcomes or treatment claims.
- Use first-hand evidence: actual work, real customer-approved photos, genuine process descriptions, real reviews, and owner-approved expertise.
- Do not manufacture testimonials, review counts, awards, certifications, press mentions, years in business, or customer outcomes.

## 3. Architecture and release constraints

The currently verified production pipeline publishes GitHub Pages from `master`. Preserve the existing custom domain and DNS configuration unless the owner separately approves a hosting migration. The old `gh-pages` branch is not the current deployment target based on the most recent successful Pages deployment.

GitHub Pages is static hosting. Keep PHP, database access, credentials, transactional email, and other server-side capabilities on a separately configured backend. Never assume PHP files in the repository execute on GitHub Pages. Never move forms or customer data flows to an unverified endpoint as part of an SEO change.

SEO/AIO/GEO enhancements should respect the static deployment model:
- Prefer server-delivered, crawlable HTML and static JSON-LD where possible.
- Ensure important content is present in the initial HTML, not exclusively injected after user interaction.
- Keep the pricing engine and visible pricing catalog synchronized.
- Keep generated estimate URLs and configurator states from creating duplicate indexable pages. Set canonical/noindex behavior intentionally and test it.
- Do not modify DNS, Pages source settings, backend endpoints, secrets, or production form actions without a specific approved change and validation plan.

## 4. Technical SEO foundation — release gate

### Crawl and index controls
- Audit `robots.txt`, XML sitemap, canonical tags, redirects, response codes, robots meta directives, and internal links.
- Allow legitimate search crawlers to access public pages and required assets. Verify actual access through hosting, firewall, CDN, and bot-protection layers; a robots.txt Allow rule is not enough if the server returns 403/429.
- Keep private/admin, test, thank-you, duplicate parameter, internal, and sensitive pages out of search where appropriate.
- Use one preferred HTTPS hostname and consistent trailing-slash/canonical behavior.
- Make every important page reachable through descriptive crawlable links.
- Include only canonical, useful, indexable URLs in the sitemap; keep `lastmod` accurate.
- Submit sitemap and inspect representative URLs in Google Search Console and Bing Webmaster Tools.
- Check for broken links, redirect chains, 404s, soft 404s, duplicate titles, missing descriptions, duplicate H1s, accidental noindex, and incorrect canonicals after releases.

### Page-level quality
Each indexable page must have:
- A unique, accurate title and meta description written for the actual search intent.
- One clear primary heading and a logical heading hierarchy.
- A concise opening explanation of what the page offers and who it serves.
- Helpful, specific, original content that answers customer decisions.
- Descriptive internal links and a clear next step.
- Real images with useful file names, contextual alt text, and appropriate dimensions.
- Mobile-first layout, accessible controls, readable contrast, fast loading, and no horizontal overflow.
- Canonical URL and appropriate Open Graph/social metadata.

### Performance and experience
Measure Core Web Vitals and real-user performance where data is available. Prioritize mobile LCP, INP, and CLS; optimize image formats and dimensions; lazy-load below-the-fold imagery; avoid heavy third-party scripts; and test the actual 320px-to-desktop range. Do not sacrifice the working grill designer or form completion path for decorative effects.

## 5. Structured data and entity clarity

Use JSON-LD that matches visible, owner-verified page content. Validate it with Google's Rich Results Test and URL Inspection after publishing.

Potential schema layers, only when factually applicable:
- `Organization` on the homepage/about page for brand identity, logo, website, verified contact details, and official `sameAs` profiles.
- `WebSite` for site identity.
- `BreadcrumbList` on pages with a real visible breadcrumb trail.
- `Product` and `Offer` only on real product pages with accurate, visible price, currency, item details, and availability. Do not label an estimate as a fixed offer or invent inventory.
- `Service` for actual custom-design, mold, or related services where details are visible on the page.
- `LocalBusiness` / a suitable subtype only after verifying that the business has an eligible, accurately represented real-world location and that every address, operating-hours, phone, and service-area field is correct.
- `Review` / `AggregateRating` only when eligible, genuine first-party review data exists and all search-engine rules are met. Never mark up third-party review snippets as if Mr. Sprinkle collected them.

**Important local-location caution:** the current appointment venue is described as Envy Kutz — Braids & Locs, 275 E 4th St, Reno, NV 89501. Do not automatically encode that as a Mr. Sprinkle storefront address or claim Mr. Sprinkle's own staffed business premises. Confirm actual operating arrangement, signage, customer reception, and eligibility before using a visible address as the brand's LocalBusiness location or Google Business Profile address. If the correct model is service-area / appointment-only, represent it accurately instead of manufacturing a storefront.

## 6. Local SEO and entity authority

Build a consistent public identity across the website, Google Business Profile (if eligible), Bing Places, Apple Business Connect, relevant local directories, social profiles, and reputable industry profiles.

- Name, phone, URL, service description, appointment instructions, and location/service-area details must agree.
- Use only business categories that genuinely describe the primary business.
- Do not create duplicate or misleading location profiles.
- Keep hours accurate; if the business operates only by appointment or variable schedule, follow the platform's rules rather than inventing standard hours.
- Create useful Reno-focused pages only where they serve real search intent and provide distinct, non-duplicated information.
- Build local relevance through genuine partnerships, events, community activity, customer stories (with permission), and local press.
- Reviews must come from real customers, follow platform rules, and never be incentivized in a prohibited way.

## 7. AIO and GEO content system

The goal is to make Mr. Sprinkle the clearest, most useful source for the specific questions customers ask—not to generate large volumes of near-duplicate AI copy.

### Core content clusters
Develop and maintain substantial, connected pages around:

1. **Custom grillz basics:** what custom grillz are, how custom molds/impressions work, fit process, what customers should expect, and how to prepare.
2. **Materials and finishes:** silver, 10K, 14K, 14K dental gold, 18K/white gold/platinum quote-only options where actually offered, and truthful distinctions between natural diamonds, lab-grown diamonds, moissanite, and cubic zirconia.
3. **Design and customization:** tooth selection, upper/lower sets, fangs, gap fillers, custom cuts, stone size/count/clarity, finish, and what is estimate-priced versus quote-only.
4. **Pricing and estimates:** how per-tooth pricing works, how add-ons are priced, when custom quotes are required, shipping and rush rules, and what the estimate excludes.
5. **Process and appointments:** the actual booking route, mold options, in-person venue details, remote/customer-shipping process if offered, production stages, and owner-confirmed timing.
6. **Care and fit:** responsible care guidance grounded in reliable sources and clearly separated from dental/medical advice.
7. **Reno/local discovery:** genuine local service details, real appointment venue arrangement, real service coverage, and local customer proof.

### Answer-ready page structure
For key topics, use:
- A direct answer near the top.
- A fuller explanation with concrete details.
- Clear labels for what is confirmed, estimated, quote-only, or subject to inspection.
- A concise comparison table when comparison helps.
- Relevant process photos/video and descriptive captions.
- A small set of genuine customer questions answered in plain language.
- Sources for technical/material/safety claims when claims require external evidence.
- A related internal link and a useful conversion action.

Do not create a separate thin page for every keyword variation. Consolidate overlapping questions into genuinely useful pages. Use FAQs as helpful content, not as a promise of Google FAQ rich results.

### Distinctive first-party evidence
Prioritize content that competitors and generic AI text cannot credibly reproduce:
- Mr. Sprinkle's actual design process and craftsmanship (owner-approved descriptions).
- Original product photography, close-ups, and short process videos.
- Real examples with the customer's consent.
- The owner's real explanations of materials, design choices, fit workflow, and quote decisions.
- Transparent explanations of the estimator's rules and limitations.
- Genuine local relationships and operating details.

AI may assist drafting, research organization, editing, and schema generation. A human must verify factual claims, prices, expertise, images, and final copy before publication. Never use scaled AI-generated doorway pages, fake author credentials, fabricated sources, or fake off-site mentions.

## 8. Crawler access and AI discovery

Audit crawler access for:
- Googlebot
- Bingbot
- OAI-SearchBot (for ChatGPT search discovery)
- Other legitimate user-agent crawlers only where the business has a reason to support them.

For OpenAI, OAI-SearchBot is the relevant crawler to allow for inclusion in ChatGPT search summaries/snippets. GPTBot is a separate crawler used for model-training-related purposes; do not treat permission for search discovery as blanket permission for training crawling. Decide GPTBot policy explicitly with the owner. Also inspect CDN/firewall rules and published crawler IP guidance when access problems are suspected.

Do not add `llms.txt`, special AIO meta tags, or custom schema under the assumption that these are required for Google AI Overviews or AI Mode. Google's current guidance says existing SEO fundamentals remain the basis, no special AI schema or machine-readable text file is required, and there is no ideal word count or special chunking recipe. Add experimental files only if a clearly defined platform or workflow justifies them and the benefit is testable.

## 9. Digital PR, reputation, and off-site corroboration

Build real-world authority:
- Earn coverage from legitimate Reno/Northern Nevada media and community outlets.
- Pursue relevant jewelry, fashion, music, culture, and craftsmanship features where there is a genuine story.
- Secure accurate partner mentions and links from legitimate partners.
- Publish original photo/video assets that can be credited and referenced.
- Encourage honest, policy-compliant customer reviews and testimonials.
- Maintain complete, consistent official social profiles and link them to the website.

Never buy bulk links, fake reviews, fake citations, mass directory submissions, or paid placements represented as independent editorial endorsements. Evaluate any PR/SEO vendor by methods, deliverables, transparency, reporting, and policy compliance—not by a guaranteed ranking or AI-citation claim.

## 10. Measurement, analytics, and experimentation

Establish a pre-change baseline before major search work. Configure access and reporting in:
- Google Search Console
- Google Analytics 4 (or another owner-approved analytics platform)
- Bing Webmaster Tools, including its AI Performance report
- Call/form/booking/conversion tracking
- A structured AI visibility prompt-and-citation monitoring log

Track at minimum:
- Index coverage and crawl errors.
- Organic clicks, impressions, CTR, and query/page performance.
- Non-branded versus branded search.
- Local visibility and qualified local actions.
- AI citations and cited URLs where platforms expose this data.
- Bing AI Performance citations and grounding queries.
- Referral sessions from AI/search sources.
- Grill designer starts, completed configurations, estimate views, quote requests, phone taps, appointment requests, and completed bookings.
- Qualified lead rate and revenue attribution where safely available.

Important metric distinctions:
- An AI citation is not a click, ranking, lead, or sale.
- A reported AI visibility trend is not proof that one SEO edit caused the change.
- Search impressions and rank movement are leading indicators, not business outcomes.
- Judge the program on qualified demand, conversion quality, and profitable growth—not vanity dashboards alone.

Use a controlled prompt set to monitor visibility across Google AI experiences, ChatGPT search, Copilot/Bing, and other relevant platforms. Record exact test date, prompt, market/location context, whether Mr. Sprinkle is mentioned, whether the official site is cited, cited competitors/sources, recommendation wording, and next action. Do not mistake anecdotal prompt checks for a complete measurement of every AI answer.

## 11. High-investment operating model

A premium program can exceed $10,000/month, but spend should buy accountable expertise and execution—not a magic SEO subscription.

Illustrative $10k–$20k+ monthly operating mix (not vendor quotes):
- Technical SEO, engineering QA, schema, crawl/index management, and release monitoring.
- Senior strategy and analytics, including attribution and experiment design.
- Original expert-led content, product photography, short-form video, and content refreshes.
- Digital PR and legitimate local/industry relationship development.
- Local SEO and reputation operations.
- Conversion-rate optimization of the grill designer, estimates, forms, and booking flows.
- Monitoring software for search visibility, technical health, and AI citation trends.

Before approving any large monthly retainer:
1. Audit the site, Google/Bing visibility, GBP eligibility, analytics, technical health, and conversion funnel.
2. Establish baseline demand, lead economics, close rate, average order value, and gross margin.
3. Define a 90-day plan with named deliverables, owners, acceptance tests, and reporting.
4. Separate labor/media/software/vendor costs.
5. Set access ownership, account ownership, data export rights, and termination/handoff terms.
6. Require transparent monthly work logs and a clear explanation of what changed.
7. Reject guarantees of a #1 ranking, guaranteed AI citations, or access to secret Google/OpenAI ranking metrics.

No recommendation to spend $10k+ per month should be made until the baseline and expected business economics justify it.

## 12. Implementation sequence for the next site release

### Phase 0 — Baseline and fact verification
- Crawl the current production site and inventory canonical URLs, metadata, internal links, indexability, images, forms, and structured data.
- Confirm Google Search Console, Bing Webmaster Tools, Analytics, and Business Profile ownership/access.
- Verify the actual customer-facing appointment arrangement, hours, service coverage, contact details, approved brand claims, and published pricing.
- Record current conversions, queries, pages, and AI visibility baseline.

### Phase 1 — Technical foundation before page rollout
- Implement and validate robots.txt, sitemap.xml, canonical tags, redirects, metadata, crawlable internal links, image optimization, and error handling.
- Add validated Organization/WebSite/Breadcrumb/Product/Service schema only where facts support it.
- Confirm OAI-SearchBot/Bingbot/Googlebot access; decide GPTBot policy separately.
- Preserve GitHub Pages deployment from master and existing DNS; test a preview before production release.

### Phase 2 — Search-ready page architecture
- Build dedicated, substantial pages for core products/services and high-intent customer questions.
- Connect all pages through useful internal linking and navigation.
- Ensure the pricing catalog, estimator, pricing page, and order/appointment form share one verified pricing source.
- Prevent quote-only selections or custom estimate URLs from being indexed as misleading fixed-price product pages.

### Phase 3 — Local entity and authority
- Correct the local business representation and profiles.
- Complete accurate official profiles and partner references.
- Start the editorial, customer-proof, video, and legitimate local-PR program.

### Phase 4 — AI visibility and conversion optimization
- Monitor citations and grounding queries where available.
- Review the controlled AI prompt set monthly.
- Improve pages based on real query gaps, customer questions, and conversion friction.
- A/B test meaningful changes to the grill design flow and booking actions without compromising pricing accuracy.

### Phase 5 — Ongoing quality control
Every release must pass:
- Search crawler / indexability check.
- Metadata, canonical, sitemap, and structured-data validation.
- Mobile/accessibility/performance regression checks.
- Pricing/estimate regression tests.
- Form and booking-path verification.
- Claim and source verification.
- Analytics/conversion event verification.
- Production smoke test after deployment.

---

## 13. Reference sources (official platform guidance)

These references are the starting point for future reviews. Re-check current platform documentation before implementing platform-specific changes.

- Google, **Optimizing your website for generative AI features on Google Search**: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google, **AI features and your website**: https://developers.google.com/search/docs/appearance/ai-features
- Google, **SEO Starter Guide**: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google, **Organization structured data**: https://developers.google.com/search/docs/appearance/structured-data/organization
- Google, **LocalBusiness structured data**: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Google Business Profile, **Guidelines for representing your business**: https://support.google.com/business/answer/3038177
- Bing Webmaster Tools, **AI Performance**: https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c
- OpenAI, **Publishers and Developers FAQ**: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq

### Platform facts to remember
- Google's guidance: generative AI visibility is built on strong Search fundamentals and valuable original content; there is no special GEO schema, no required `llms.txt`, no fixed ideal page length, and no magic content-chunking recipe.
- Google's guidance: pages must be crawlable and eligible for Search; even compliance does not guarantee crawling, indexing, ranking, or serving.
- Google's Organization schema guidance: accurate organization identity and applicable contact/address/social properties help disambiguate the entity; structured data must follow visible page content and be validated.
- Google Business Profile rules: a business must represent its real-world operation accurately; an unstaffed partner/virtual address is not automatically an eligible storefront.
- Bing AI Performance: use cited-page and grounding-query trends as directional evidence; citations are not clicks, rankings, authority, or sales.
- OpenAI search discovery: allow OAI-SearchBot if the goal is inclusion in ChatGPT search summaries/snippets; make sure hosting/CDN protections permit the crawler.

---

**Standing instruction for all future Mr. Sprinkle work:** apply this standard automatically when planning, writing, reviewing, coding, measuring, or publishing website and marketing changes. If a requested change conflicts with factual accuracy, platform policy, customer trust, security, or the verified production architecture, flag the conflict and propose a compliant alternative before shipping.
