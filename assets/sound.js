/*
 * Mr. Sprinkle intro and site music controller.
 * Intro dismissal is deliberately independent of media playback success:
 * visitors must always be able to enter, even if autoplay or the audio asset fails.
 */
(function () {
    "use strict";

    const track = window.MrSprinkleTrack || {};
    const audio = document.getElementById("siteAudio");
    const intro = document.getElementById("videoIntro");
    const video = document.getElementById("introVideo");
    const playBtn = document.getElementById("introPlay");
    const headerBtn = document.getElementById("musicToggle");
    const headerPlayer = document.getElementById("siteSound");
    const status = document.getElementById("introStatus");
    const reduceMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INTRO_MS = 30000;
    let introTimer = null;
    let closing = false;

    function readCookie(key) {
        try {
            const prefix = encodeURIComponent(key) + "=";
            const entry = document.cookie.split(";").map(function (part) {
                return part.trim();
            }).find(function (part) { return part.indexOf(prefix) === 0; });
            return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
        } catch (error) {
            return null;
        }
    }

    function writeCookie(key, value) {
        try {
            const secure = window.location && window.location.protocol === "https:" ? "; Secure" : "";
            const host = window.location && window.location.hostname || "";
            const domain = /(^|\\.)mrsprinklereno\\.com$/i.test(host) ? "; Domain=.mrsprinklereno.com" : "";
            document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) +
                "; Max-Age=31536000; Path=/; SameSite=Lax" + secure + domain;
        } catch (error) {
            // Web storage remains the primary store when cookies are unavailable.
        }
    }

    const store = {
        get(key) {
            // Persistent browser storage wins whenever it is available.
            try {
                const localValue = window.localStorage.getItem(key);
                if (localValue) return localValue;
            } catch (error) {
                // Continue to the cookie and session fallbacks.
            }

            // Cookie fallback also covers navigation between www and apex hosts.
            const cookieValue = readCookie(key);
            if (cookieValue) {
                try { window.localStorage.setItem(key, cookieValue); } catch (error) { /* Cookie remains authoritative. */ }
                try { window.sessionStorage.setItem(key, cookieValue); } catch (error) { /* Cookie remains authoritative. */ }
                return cookieValue;
            }

            // Migrate the earlier session-only flag so existing visitors stay entered.
            try {
                const sessionValue = window.sessionStorage.getItem(key);
                if (sessionValue) {
                    try { window.localStorage.setItem(key, sessionValue); } catch (error) { /* Cookie fallback below. */ }
                    writeCookie(key, sessionValue);
                    return sessionValue;
                }
            } catch (error) {
                // All browser storage APIs may be restricted by privacy settings.
            }
            return null;
        },
        set(key, value) {
            try { window.localStorage.setItem(key, value); } catch (error) { /* Use fallbacks below. */ }
            try { window.sessionStorage.setItem(key, value); } catch (error) { /* Use cookie fallback below. */ }
            writeCookie(key, value);
        }
    };

    function markIntroSeen() {
        // Save synchronously before navigation (especially the Buy Track link).
        store.set("introSeen", "true");
    }

    function setPlayingUI(playing) {
        if (headerBtn) {
            headerBtn.setAttribute("aria-pressed", String(playing));
            headerBtn.setAttribute("aria-label",
                (playing ? "Pause " : "Play ") + (track.title || "music"));
        }
        if (headerPlayer) headerPlayer.classList.toggle("is-playing", playing);
        if (playBtn) {
            playBtn.dataset.state = playing ? "playing" : "idle";
            const label = playBtn.querySelector("[data-label]");
            if (label) label.textContent = playing ? "Music playing — enter site" : "Play with sound";
        }
    }

    function startAudioFromGesture() {
        if (!audio) return false;
        try {
            // Invoke play() immediately inside the user's click event. Never wait for
            // its promise before dismissing the intro.
            const result = audio.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    setPlayingUI(false);
                    if (status) status.textContent =
                        "Sound could not start. You can turn it on after entering.";
                });
            }
            return true;
        } catch (error) {
            setPlayingUI(false);
            if (status) status.textContent =
                "Sound could not start. You can turn it on after entering.";
            return false;
        }
    }

    function closeIntro() {
        if (!intro || intro.hidden || closing) return;
        closing = true;
        markIntroSeen();
        clearTimeout(introTimer);
        intro.classList.add("is-leaving");
        document.documentElement.classList.remove("ms-intro-open");

        const finish = function () {
            intro.hidden = true;
            if (video) {
                video.pause();
                video.removeAttribute("autoplay");
            }
            closing = false;
        };
        if (reduceMotion) finish();
        else window.setTimeout(finish, 450);

        const target = headerBtn || document.querySelector("main a, main button");
        if (target && document.activeElement && intro.contains(document.activeElement)) {
            window.setTimeout(function () {
                try { target.focus({ preventScroll: true }); }
                catch (error) { target.focus(); }
            }, 0);
        }
    }

    function enterWithSound() {
        startAudioFromGesture();
        closeIntro();
    }

    function enterQuietly(button) {
        if (button && button.hasAttribute("data-intro-mute") && audio) {
            audio.pause();
        }
        closeIntro();
    }

    // Expose safe entry points for integration and testing.
    window.skipIntro = closeIntro;
    window.MrSprinkleIntro = Object.freeze({
        close: closeIntro,
        enterQuietly: function (button) { enterQuietly(button || null); },
        playAndEnter: enterWithSound
    });

    if (audio) {
        audio.addEventListener("play", function () { setPlayingUI(true); });
        audio.addEventListener("pause", function () { setPlayingUI(false); });
        audio.addEventListener("ended", function () { setPlayingUI(false); });
    }

    if (headerBtn) {
        headerBtn.addEventListener("click", function () {
            if (!audio) return;
            if (audio.paused) startAudioFromGesture();
            else audio.pause();
        });
    }

    // Keep track details and purchase URLs synchronized from one source.
    if (audio && track.src) {
        const source = audio.querySelector("source");
        if (source && source.getAttribute("src") !== track.src) {
            source.setAttribute("src", track.src);
            audio.load();
        }
    }
    document.querySelectorAll("[data-track]").forEach(function (element) {
        const key = element.getAttribute("data-track");
        if (key === "cover" && track.cover) {
            element.setAttribute("src", track.cover);
            element.setAttribute("alt", (track.title || "Featured") + " cover art");
        } else if (key === "buy" && track.buyUrl) {
            element.setAttribute("href", track.buyUrl);
            element.setAttribute("aria-label", "Buy " + (track.title || "featured track") +
                " for " + (track.price || ""));
            if (element.hasAttribute("data-price-text")) {
                element.textContent = element.getAttribute("data-price-text")
                    .replace("{price}", (track.price || "").replace(".00", ""));
            }
        } else if (key === "explicit") {
            element.hidden = !track.explicit;
        } else if (track[key] !== undefined) {
            element.textContent = track[key];
        }
    });

    if (intro) {
        // Keep other already-open tabs in sync when one tab completes the intro.
        window.addEventListener("storage", function (event) {
            if (event.key === "introSeen" && event.newValue === "true") closeIntro();
        });

        if (store.get("introSeen")) {
            intro.hidden = true;
            document.documentElement.classList.remove("ms-intro-open");
            if (video) {
                video.removeAttribute("autoplay");
                video.pause();
            }
        } else {
            document.documentElement.classList.add("ms-intro-open");
            if (reduceMotion && video) video.pause();

            // A single capture-phase handler owns every intro action. It runs before
            // target/bubble listeners, so no other page script can leave a visible
            // control inert. The same handler also persists the visit before links navigate.
            document.addEventListener("click", function (event) {
                const target = event.target instanceof Element ? event.target : null;
                if (!target) return;

                const actionButton = target.closest("[data-intro-action]");
                if (actionButton && intro.contains(actionButton) && !intro.hidden) {
                    event.preventDefault();
                    const action = actionButton.getAttribute("data-intro-action");
                    if (action === "play") enterWithSound();
                    else if (action === "quiet") enterQuietly(actionButton);
                    else if (action === "skip") closeIntro();
                    return;
                }

                const buyLink = target.closest('a[data-track="buy"]');
                if (buyLink && intro.contains(buyLink) && !intro.hidden) {
                    markIntroSeen();
                    return; // Let the normal navigation to the music page continue.
                }
            }, true);

            // Clicking the empty cinematic background is also a quiet-entry path.
            intro.addEventListener("click", function (event) {
                if (event.target === intro || event.target === video ||
                    (event.target instanceof Element && event.target.classList.contains("ms-intro__veil"))) {
                    enterQuietly(null);
                }
            });

            intro.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    closeIntro();
                    return;
                }
                if (event.key !== "Tab") return;
                const focusable = Array.from(
                    intro.querySelectorAll("button, a[href]")
                ).filter(function (element) {
                    return !element.disabled && element.offsetParent !== null;
                });
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            });

            if (playBtn) {
                window.setTimeout(function () {
                    try { playBtn.focus({ preventScroll: true }); }
                    catch (error) { playBtn.focus(); }
                }, 50);
            }

            // Existing timed fallback remains; it can never trap a visitor.
            introTimer = window.setTimeout(closeIntro, INTRO_MS);
        }
    }

    setPlayingUI(false);
})();
