/* ==========================================================================
   DocEase Clinic - Services & Specialties Page Script
   ========================================================================== */

(function () {
  "use strict";

  function initNavigation() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  function initViewAllServices() {
    const viewAllBtn = document.getElementById("viewAllServicesBtn");
    const targetSection = document.getElementById("all-specialties");
    if (!viewAllBtn || !targetSection) return;

    viewAllBtn.addEventListener("click", () => {
      window.setTimeout(() => {
        targetSection.focus({ preventScroll: true });
      }, 450);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    initNavigation();
    initViewAllServices();
  });
})();
