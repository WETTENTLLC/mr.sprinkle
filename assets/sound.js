/*
 * Homepage intro and site music player.
 * One <audio id="siteAudio"> element is shared by the intro and the header player,
 * so music started in the intro keeps playing after the visitor enters the site.
 * Track details come from assets/site-track.js.
 */
(function () {
    "use strict";
    const track = window.MrSprinkleTrack || {};
    const audio = document.getElementById("siteAudio");
    const intro = document.getElementById("videoIntro");
    const video = document.getElementById("introVideo");
    const playBtn = document.getElementById("introPlay");
    const skipBtns = Array.from(document.querySelectorAll("[data-intro-skip]"));
    const headerBtn = document.getElementById("musicToggle");
    const headerPlayer = document.getElementById("siteSound");
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INTRO_MS = 30000;
    let introTimer = null;

    const store = {
        get(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
    };

    // Fill in track details everywhere they appear.
    if (audio && track.src) {
        const source = audio.querySelector("source");
        if (source && source.getAttribute("src") !== track.src) { source.setAttribute("src", track.src); audio.load(); }
    }
    document.querySelectorAll("[data-track]").forEach((el) => {
        const key = el.getAttribute("data-track");
        if (key === "cover" && track.cover) { el.setAttribute("src", track.cover); el.setAttribute("alt", `${track.title} cover art`); }
        else if (key === "buy" && track.buyUrl) {
            el.setAttribute("href", track.buyUrl);
            el.setAttribute("aria-label", `Buy ${track.title} for ${track.price}`);
            if (el.hasAttribute("data-price-text")) el.textContent = el.getAttribute("data-price-text").replace("{price}", (track.price || "").replace(".00", ""));
        }
        else if (key === "explicit") el.hidden = !track.explicit;
        else if (track[key] !== undefined) el.textContent = track[key];
    });

    function setPlayingUI(playing) {
        if (headerBtn) {
            headerBtn.setAttribute("aria-pressed", String(playing));
            headerBtn.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${track.title || "music"}`);
        }
        if (headerPlayer) headerPlayer.classList.toggle("is-playing", playing);
        if (playBtn) {
            const label = playBtn.querySelector("[data-label]");
            if (label) label.textContent = playing ? "Enter the site" : "Play with sound";
            playBtn.dataset.state = playing ? "playing" : "idle";
        }
    }

    function play() {
        if (!audio) return Promise.resolve(false);
        return audio.play().then(() => true).catch(() => { setPlayingUI(false); return false; });
    }

    if (audio) {
        audio.addEventListener("play", () => setPlayingUI(true));
        audio.addEventListener("pause", () => setPlayingUI(false));
        audio.addEventListener("ended", () => setPlayingUI(false));
    }

    if (headerBtn) {
        headerBtn.addEventListener("click", () => {
            if (!audio) return;
            if (audio.paused) play(); else audio.pause();
        });
    }

    // ---------- Intro ----------
    function closeIntro() {
        if (!intro || intro.hidden) return;
        clearTimeout(introTimer);
        store.set("introSeen", "true");
        intro.classList.add("is-leaving");
        document.documentElement.classList.remove("ms-intro-open");
        const finish = () => {
            intro.hidden = true;
            if (video) video.pause();
        };
        if (reduceMotion) finish(); else setTimeout(finish, 800);
        const target = headerBtn || document.querySelector("main a, main button");
        if (target && document.activeElement && intro.contains(document.activeElement)) target.focus({ preventScroll: true });
    }
    window.skipIntro = closeIntro; // kept for any existing inline references

    if (intro) {
        if (store.get("introSeen")) {
            intro.hidden = true;
            if (video) { video.removeAttribute("autoplay"); video.pause(); }
        } else {
            document.documentElement.classList.add("ms-intro-open");
            if (reduceMotion && video) video.pause();
            if (playBtn) {
                playBtn.addEventListener("click", () => {
                    if (playBtn.dataset.state === "playing") { closeIntro(); return; }
                    play();
                });
                setTimeout(() => playBtn.focus({ preventScroll: true }), 50);
            }
            skipBtns.forEach((b) => b.addEventListener("click", () => {
                if (b.hasAttribute("data-intro-mute") && audio) audio.pause();
                closeIntro();
            }));
            intro.addEventListener("keydown", (e) => {
                if (e.key === "Escape") { e.preventDefault(); closeIntro(); return; }
                if (e.key !== "Tab") return;
                const f = Array.from(intro.querySelectorAll("button, a[href]")).filter((el) => el.offsetParent !== null);
                if (!f.length) return;
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            });
            // Same as before: the intro closes on its own after 30 seconds.
            introTimer = setTimeout(closeIntro, INTRO_MS);
        }
    }
    setPlayingUI(false);
})();
