/* ==========================================================================
   CarePulse Medical Clinic - Home Page Script (Prototype Edition)
   ========================================================================== */

(function () {
  "use strict";

  const ANALYSIS_DATA = [
    { label: "General", visits: 420, satisfaction: 97 },
    { label: "Cardiology", visits: 280, satisfaction: 98 },
    { label: "Pediatrics", visits: 350, satisfaction: 99 },
    { label: "Dermatology", visits: 230, satisfaction: 96 },
    { label: "Orthopedics", visits: 210, satisfaction: 95 },
    { label: "Diagnostics", visits: 390, satisfaction: 98 }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
  }

  function initClinicAnalysisChart() {
    const chartEl = document.getElementById("clinicAnalysisChart");
    if (!chartEl) return;

    const maxVisits = 450;
    chartEl.innerHTML = ANALYSIS_DATA.map((item) => {
      const visitsHeight = Math.round((item.visits / maxVisits) * 115);
      const satHeight = Math.round((item.satisfaction / 100) * 115);
      return `
        <div class="chart-col">
          <div class="chart-col__val">${item.visits} / ${item.satisfaction}%</div>
          <div class="chart-col__pair">
            <div class="chart-bar chart-bar--navy" style="height:${visitsHeight}px" title="${escapeHtml(
              item.label
            )}: ${item.visits} monthly visits"></div>
            <div class="chart-bar chart-bar--sage" style="height:${satHeight}px" title="${escapeHtml(
              item.label
            )}: ${item.satisfaction}% satisfaction"></div>
          </div>
          <div class="chart-col__label">${escapeHtml(item.label)}</div>
        </div>
      `;
    }).join("");
  }

  function initHomeSearch() {
    const form = document.getElementById("homeSearchForm");
    const input = document.getElementById("homeSearchInput");
    const resultsBox = document.getElementById("homeSearchResults");
    if (!form || !input || !resultsBox || !window.CLINIC_DATA) return;

    function renderResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        resultsBox.hidden = true;
        resultsBox.innerHTML = "";
        return;
      }

      const matches = window.CLINIC_DATA.doctors.filter(
        (doc) =>
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.focusAreas.some((area) => area.toLowerCase().includes(q))
      );

      if (matches.length === 0) {
        resultsBox.innerHTML =
          '<div class="search-result-item"><span>No matching doctors or specialties found.</span></div>';
      } else {
        resultsBox.innerHTML = matches
          .map(
            (doc) => `
            <a class="search-result-item" href="doctorprofile.html?id=${encodeURIComponent(
              doc.id
            )}">
              <span><strong>${escapeHtml(doc.name)}</strong> &mdash; ${escapeHtml(
                doc.specialty
              )}</span>
              <span style="font-size:0.82rem;color:var(--color-sage-dark);font-weight:600;">${escapeHtml(
                doc.availability
              )}</span>
            </a>
          `
          )
          .join("");
      }
      resultsBox.hidden = false;
    }

    input.addEventListener("input", () => renderResults(input.value));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = input.value.trim();
      if (q) {
        window.location.href = `finddoctor.html?q=${encodeURIComponent(q)}`;
      } else {
        window.location.href = "finddoctor.html";
      }
    });

    document.addEventListener("click", (event) => {
      if (!form.parentElement.contains(event.target)) {
        resultsBox.hidden = true;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initNavigation();
    initClinicAnalysisChart();
    initHomeSearch();
  });
})();
