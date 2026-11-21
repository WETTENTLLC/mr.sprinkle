/* Accessible mobile navigation shared by customer-facing Mr. Sprinkle pages. */
(function () {
  "use strict";
  const header = document.querySelector(".ms-site-header");
  if (!header) return;
  const button = header.querySelector(".ms-menu-toggle");
  const nav = header.querySelector(".ms-primary-nav");
  if (!button || !nav) return;

  function setOpen(open) {
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.setAttribute("data-open", String(open));
  }
  button.addEventListener("click", function () {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      button.focus();
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1080) setOpen(false);
  }, { passive: true });
})();