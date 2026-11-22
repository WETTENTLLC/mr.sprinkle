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

    const store = {
        get(key) {
            // Persistent storage wins: dismissing the intro is a first-visit event,
            // not a per-tab event. This keeps Home navigation and later visits clean.
            try {
                const localValue = window.localStorage.getItem(key);
                if (localValue) return localValue;
            } catch (error) {
                // Continue to session storage when persistent storage is restricted.
            }

            // Migrate the old session-only flag into persistent storage so returning
            // visitors who already dismissed the intro do not see it again.
            try {
                const sessionValue = window.sessionStorage.getItem(key);
                if (sessionValue) {
                    try { window.localStorage.setItem(key, sessionValue); }
                    catch (error) { /* Keep the session value when local storage is blocked. */ }
                    return sessionValue;
                }
            } catch (error) {
                // Both storage APIs may be restricted by browser privacy settings.
            }
            return null;
        },
        set(key, value) {
            // Write to both stores. localStorage survives navigation, tabs and
            // future browser sessions; sessionStorage remains a fallback.
            try { window.localStorage.setItem(key, value); }
            catch (error) { /* Fall back to session storage below. */ }
            try { window.sessionStorage.setItem(key, value); }
            catch (error) { /* Both storage APIs may be disabled by privacy settings. */ }
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

    // Bind controls from this same-origin external file instead of inline onclick handlers.
    function bindIntroActions() {
        if (!intro) return;
        intro.querySelectorAll("[data-intro-action]").forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                if (intro.hidden) return;
                const action = button.getAttribute("data-intro-action");
                if (action === "play") enterWithSound();
                else if (action === "quiet") enterQuietly(button);
                else if (action === "skip") closeIntro();
            });
        });
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
        bindIntroActions();

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

            // One delegated capture handler works for mouse, touchscreen and keyboard
            // activation, and saves the visit before the browser follows a link.
            document.addEventListener("click", function (event) {
                const target = event.target instanceof Element ? event.target : null;
                if (!target) return;

                const buyLink = target.closest('a[data-track="buy"]');
                if (buyLink && !intro.hidden) {
                    markIntroSeen();
                    return; // Let the normal navigation to the music page continue.
                }

                // Explicit intro buttons call window.mrSprinkleIntroAction directly.
                // This delegated listener only handles the track purchase link above.
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
