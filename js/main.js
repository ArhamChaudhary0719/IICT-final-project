/* ==========================================================================
   CarePulse Medical Clinic - Home Page Interactive Logic
   ========================================================================== */

(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createAvatarSvg(doctor, size) {
    const dim = size || 72;
    const initials = doctor.name
      .replace(/^Dr\.\s*/i, "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return (
      `<svg viewBox="0 0 80 80" width="${dim}" height="${dim}" aria-hidden="true">` +
      `<rect width="80" height="80" fill="${doctor.accentColor}" opacity="0.14"/>` +
      `<circle cx="40" cy="30" r="14" fill="${doctor.accentColor}" opacity="0.88"/>` +
      `<path d="M16 74c2-15 12-22 24-22s22 7 24 22" fill="${doctor.accentColor}" opacity="0.65"/>` +
      `<text x="40" y="35" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="700" font-family="sans-serif">${escapeHtml(
        initials
      )}</text>` +
      "</svg>"
    );
  }

  function renderDoctorCard(doc) {
    return `
      <article class="card">
        <div class="doctor-card__header">
          <div class="doctor-avatar">${createAvatarSvg(doc, 72)}</div>
          <div>
            <h3 class="card__title" style="margin-bottom:0.2rem;">${escapeHtml(doc.name)}</h3>
            <div class="doctor-card__specialty">${escapeHtml(doc.specialty)}</div>
            <div class="doctor-card__creds">${escapeHtml(doc.credentials)}</div>
          </div>
        </div>
        <p class="card__text">${escapeHtml(doc.bio)}</p>
        <ul class="doctor-details">
          <li><strong>Experience:</strong> ${escapeHtml(doc.experience)} &bull; &#9733; ${escapeHtml(
            doc.rating
          )} (${doc.reviewsCount})</li>
          <li><strong>Clinic Days:</strong> ${escapeHtml(doc.availability)}</li>
          <li><strong>Languages:</strong> ${escapeHtml(doc.languages)}</li>
        </ul>
        <div class="card__footer">
          <span class="badge ${doc.availableToday ? "badge--success" : "badge--warning"}">
            ${doc.availableToday ? "Available Today" : "By Schedule"}
          </span>
          <a class="btn btn--primary btn--sm" href="#contact">Book Visit</a>
        </div>
      </article>
    `;
  }

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

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  function initHomePage() {
    const doctorsGrid = document.getElementById("homeFeaturedDoctors");
    const doctorsSection = document.getElementById("doctors");
    const quickForm = document.getElementById("homeQuickSearchForm");
    const quickInput = document.getElementById("homeQuickSearchInput");

    if (!doctorsGrid || !window.CLINIC_DATA) return;

    function renderList(query) {
      const q = (query || "").trim().toLowerCase();
      const filtered = window.CLINIC_DATA.doctors.filter((doc) => {
        if (!q) return true;
        return (
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.bio.toLowerCase().includes(q) ||
          doc.focusAreas.some((area) => area.toLowerCase().includes(q))
        );
      });

      if (filtered.length === 0) {
        doctorsGrid.innerHTML =
          '<div class="empty-state"><strong>No matching doctors found.</strong><p>Clear the search box to view all clinic specialists.</p></div>';
        return;
      }

      doctorsGrid.innerHTML = filtered.map(renderDoctorCard).join("");
    }

    if (quickInput) {
      quickInput.addEventListener("input", () => {
        renderList(quickInput.value);
      });
    }

    if (quickForm && quickInput) {
      quickForm.addEventListener("submit", (event) => {
        event.preventDefault();
        renderList(quickInput.value);
        if (doctorsSection) {
          doctorsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    renderList("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initNavigation();
    initHomePage();
  });
})();
