(function () {
  "use strict";

  const DB_NAME = "MrSprinkleDesignHandoff";
  const DB_VERSION = 1;
  const STORE_NAME = "handoff";
  const RECORD_KEY = "current-design";

  function openDatabase() {
    return new Promise(function (resolve, reject) {
      if (!("indexedDB" in window)) {
        reject(new Error("This browser cannot carry artwork between pages. Please upload the reference again on the booking page."));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function () {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error("Could not open the design handoff storage.")); };
      request.onblocked = function () { reject(new Error("Design handoff storage is busy. Please refresh and try again.")); };
    });
  }

  async function save(payload) {
    const data = payload || {};
    const file = data.file || null;
    const notes = String(data.notes || "").trim();

    if (file && file.size > 25 * 1024 * 1024) {
      throw new Error("Reference images must be 25 MB or smaller.");
    }
    if (file && !String(file.type || "").startsWith("image/")) {
      throw new Error("Please choose an image file for your artwork reference.");
    }

    const db = await openDatabase();
    try {
      await new Promise(function (resolve, reject) {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        if (!file && !notes) {
          store.delete(RECORD_KEY);
        } else {
          store.put({
            file: file,
            fileName: file ? file.name : "",
            fileType: file ? file.type : "",
            fileLastModified: file ? file.lastModified : 0,
            notes: notes,
            savedAt: new Date().toISOString()
          }, RECORD_KEY);
        }
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error || new Error("Could not save your artwork reference.")); };
        tx.onabort = function () { reject(tx.error || new Error("Artwork handoff was interrupted.")); };
      });
    } finally {
      db.close();
    }
  }

  async function load() {
    const db = await openDatabase();
    try {
      return await new Promise(function (resolve, reject) {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(RECORD_KEY);
        request.onsuccess = function () { resolve(request.result || null); };
        request.onerror = function () { reject(request.error || new Error("Could not restore your artwork reference.")); };
      });
    } finally {
      db.close();
    }
  }

  async function clear() {
    const db = await openDatabase();
    try {
      await new Promise(function (resolve, reject) {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(RECORD_KEY);
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error || new Error("Could not clear the saved design handoff.")); };
        tx.onabort = function () { reject(tx.error || new Error("Could not clear the saved design handoff.")); };
      });
    } finally {
      db.close();
    }
  }

  window.MrSprinkleArtworkHandoff = Object.freeze({
    save: save,
    load: load,
    clear: clear
  });
})();
