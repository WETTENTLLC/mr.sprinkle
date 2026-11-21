/*
 * The site's featured track. To change the song, edit ONLY this file:
 *  1. Put the new MP3 (and cover image) in assets/.
 *  2. Update src, cover, title, artist, explicit, and price below.
 *  3. Create a new PayPal hosted button for the new song and paste its ID in paypalButtonId.
 * The homepage intro, the header music player, and intro-music.html all read from here.
 */
window.MrSprinkleTrack = Object.freeze({
    title: "Damn",
    artist: "Mr. Sprinkle Intro Music",
    label: "WETT Entertainment LLC",
    src: "assets/Damn.mp3",
    cover: "assets/Damn Cover.png",
    explicit: true,
    price: "$1.00",
    buyUrl: "intro-music.html",
    paypalButtonId: "PYSZ68LTCB2VW",
    copyrightYear: 2025
});
