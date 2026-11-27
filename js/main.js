/* ==========================================================================
   DocEase Clinic - Shared Navigation, Home Search & Find Doctor Directory
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
        resultsBox.innerHTML = `
          <div class="search-result-item"><span>No matching doctors or specialties found.</span></div>
          <a class="search-result-footer" href="finddoctor.html?q=${encodeURIComponent(query.trim())}">
            <span>Search full directory for &ldquo;${escapeHtml(query.trim())}&rdquo;</span>
            <span>&rarr;</span>
          </a>
        `;
      } else {
        const itemsHtml = matches
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
        resultsBox.innerHTML = `
          ${itemsHtml}
          <a class="search-result-footer" href="finddoctor.html?q=${encodeURIComponent(query.trim())}">
            <span>View ${matches.length} ${matches.length === 1 ? "result" : "results"} in Find Doctor</span>
            <span>&rarr;</span>
          </a>
        `;
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

  function getDoctorInitials(name) {
    return String(name)
      .replace(/^Dr\.\s*/i, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  function matchesExperienceFilter(doc, filterValue) {
    if (filterValue === "all") return true;
    const years =
      typeof doc.experienceYears === "number"
        ? doc.experienceYears
        : parseInt(doc.experience, 10) || 0;
    if (filterValue === "under-10") return years < 10;
    if (filterValue === "10-11") return years >= 10 && years <= 11;
    if (filterValue === "12-plus") return years >= 12;
    return true;
  }

  function matchesAvailabilityFilter(doc, filterValue) {
    if (filterValue === "any") return true;
    if (filterValue === "today") return Boolean(doc.availableToday);
    const days = Array.isArray(doc.availabilityDays) ? doc.availabilityDays : [];
    if (filterValue === "weekdays") {
      return ["mon", "tue", "wed", "thu", "fri"].some((d) => days.includes(d));
    }
    if (filterValue === "saturday") {
      return days.includes("sat") || doc.availability.toLowerCase().includes("sat");
    }
    return true;
  }

  function initFindDoctorPage() {
    const gridEl = document.getElementById("doctorGrid");
    if (!gridEl || !window.CLINIC_DATA) return;

    const filterForm = document.getElementById("doctorFilterForm");
    const searchInput = document.getElementById("doctorSearchInput");
    const clearBtn = document.getElementById("doctorSearchClear");
    const countEl = document.getElementById("doctorResultsCount");
    const resetBtn = document.getElementById("resetDoctorFilters");
    const emptyResetBtn = document.getElementById("emptyResetBtn");
    const emptyStateEl = document.getElementById("doctorEmptyState");

    const specialtyButtons = Array.from(document.querySelectorAll("[data-specialty]"));
    const experienceButtons = Array.from(document.querySelectorAll("[data-experience]"));
    const availabilityButtons = Array.from(document.querySelectorAll("[data-availability]"));

    const doctors = window.CLINIC_DATA.doctors || [];
    const state = {
      query: "",
      specialty: "all",
      experience: "all",
      availability: "any"
    };

    function syncButtonGroup(buttons, attr, activeValue) {
      buttons.forEach((btn) => {
        const isActive = btn.getAttribute(attr) === activeValue;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    function applyInitialQueryParams() {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get("q");
      const specParam = params.get("specialty");
      const expParam = params.get("experience");
      const availParam = params.get("availability");

      if (qParam && searchInput) {
        state.query = qParam.trim();
        searchInput.value = state.query;
      }

      if (specParam) {
        const matchedSpec = specialtyButtons.find(
          (btn) => btn.getAttribute("data-specialty").toLowerCase() === specParam.trim().toLowerCase()
        );
        if (matchedSpec) {
          state.specialty = matchedSpec.getAttribute("data-specialty");
        } else if (searchInput && !state.query) {
          state.query = specParam.trim();
          searchInput.value = state.query;
        }
      }

      if (expParam && experienceButtons.some((b) => b.getAttribute("data-experience") === expParam)) {
        state.experience = expParam;
      }

      if (
        availParam &&
        availabilityButtons.some((b) => b.getAttribute("data-availability") === availParam)
      ) {
        state.availability = availParam;
      }
    }

    function syncUrlParams() {
      try {
        const url = new URL(window.location.href);
        if (state.query) url.searchParams.set("q", state.query);
        else url.searchParams.delete("q");

        if (state.specialty !== "all") url.searchParams.set("specialty", state.specialty);
        else url.searchParams.delete("specialty");

        if (state.experience !== "all") url.searchParams.set("experience", state.experience);
        else url.searchParams.delete("experience");

        if (state.availability !== "any") url.searchParams.set("availability", state.availability);
        else url.searchParams.delete("availability");

        window.history.replaceState({}, "", url.toString());
      } catch (_err) {
        // Ignore history errors in restricted environments.
      }
    }

    function renderDoctors() {
      const q = state.query.trim().toLowerCase();
      const filtered = doctors.filter((doc) => {
        const matchesQuery =
          !q ||
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.credentials.toLowerCase().includes(q) ||
          doc.bio.toLowerCase().includes(q) ||
          doc.focusAreas.some((area) => area.toLowerCase().includes(q));

        const matchesSpecialty =
          state.specialty === "all" || doc.specialty === state.specialty;

        return (
          matchesQuery &&
          matchesSpecialty &&
          matchesExperienceFilter(doc, state.experience) &&
          matchesAvailabilityFilter(doc, state.availability)
        );
      });

      syncButtonGroup(specialtyButtons, "data-specialty", state.specialty);
      syncButtonGroup(experienceButtons, "data-experience", state.experience);
      syncButtonGroup(availabilityButtons, "data-availability", state.availability);

      if (clearBtn) {
        clearBtn.hidden = !state.query.trim();
      }

      const hasActiveFilters =
        Boolean(state.query.trim()) ||
        state.specialty !== "all" ||
        state.experience !== "all" ||
        state.availability !== "any";

      if (resetBtn) {
        resetBtn.disabled = !hasActiveFilters;
      }

      if (countEl) {
        const label = doctors.length === 1 ? "Doctor" : "Doctors";
        countEl.innerHTML = `Showing <span>${filtered.length}</span> of ${doctors.length} ${label}`;
      }

      if (filtered.length === 0) {
        gridEl.innerHTML = "";
        gridEl.hidden = true;
        if (emptyStateEl) emptyStateEl.hidden = false;
        return;
      }

      gridEl.hidden = false;
      if (emptyStateEl) emptyStateEl.hidden = true;

      gridEl.innerHTML = filtered
        .map((doc) => {
          const initials = getDoctorInitials(doc.name);
          const availBadgeClass = doc.availableToday
            ? "badge-availability badge-availability--today"
            : "badge-availability badge-availability--scheduled";
          const availBadgeText = doc.availableToday
            ? "Available Today"
            : `Next: ${doc.availability}`;
          const focusTags = doc.focusAreas
            .slice(0, 3)
            .map((area) => `<span class="doctor-card__tag">${escapeHtml(area)}</span>`)
            .join("");

          return `
            <article class="doctor-card">
              <div class="doctor-card__head">
                <div class="doctor-card__avatar" aria-hidden="true">${escapeHtml(initials)}</div>
                <div>
                  <h2 class="doctor-card__name">${escapeHtml(doc.name)}</h2>
                  <p class="doctor-card__creds">${escapeHtml(doc.credentials)}</p>
                </div>
              </div>

              <div class="doctor-card__badges">
                <span class="badge-specialty">${escapeHtml(doc.specialty)}</span>
                <span class="${availBadgeClass}">${escapeHtml(availBadgeText)}</span>
              </div>

              <p class="doctor-card__bio">${escapeHtml(doc.bio)}</p>

              <div class="doctor-card__tags">${focusTags}</div>

              <div class="doctor-card__meta">
                <div class="doctor-card__meta-item">
                  <strong>Experience</strong>
                  <span>${escapeHtml(doc.experience)}</span>
                </div>
                <div class="doctor-card__meta-item">
                  <strong>Rating</strong>
                  <span>&#9733; ${escapeHtml(doc.rating)} (${doc.reviewsCount})</span>
                </div>
                <div class="doctor-card__meta-item">
                  <strong>Schedule</strong>
                  <span>${escapeHtml(doc.availability)}</span>
                </div>
                <div class="doctor-card__meta-item">
                  <strong>Location &amp; Fee</strong>
                  <span>${escapeHtml(doc.location)} &bull; ${escapeHtml(doc.consultationFee)}</span>
                </div>
              </div>

              <div class="doctor-card__actions">
                <a class="btn-primary" href="doctorprofile.html?id=${encodeURIComponent(doc.id)}">
                  View Profile
                </a>
                <a class="btn-secondary" href="tel:+15552348900" aria-label="Call to book with ${escapeHtml(
                  doc.name
                )}">
                  Book
                </a>
              </div>
            </article>
          `;
        })
        .join("");
    }

    function resetAllFilters() {
      state.query = "";
      state.specialty = "all";
      state.experience = "all";
      state.availability = "any";
      if (searchInput) searchInput.value = "";
      renderDoctors();
      syncUrlParams();
    }

    if (filterForm) {
      filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        renderDoctors();
        syncUrlParams();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        renderDoctors();
        syncUrlParams();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        state.query = "";
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        renderDoctors();
        syncUrlParams();
      });
    }

    specialtyButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.specialty = btn.getAttribute("data-specialty");
        renderDoctors();
        syncUrlParams();
      });
    });

    experienceButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.experience = btn.getAttribute("data-experience");
        renderDoctors();
        syncUrlParams();
      });
    });

    availabilityButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.availability = btn.getAttribute("data-availability");
        renderDoctors();
        syncUrlParams();
      });
    });

    if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetAllFilters);

    applyInitialQueryParams();
    renderDoctors();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initNavigation();
    initClinicAnalysisChart();
    initHomeSearch();
    initFindDoctorPage();
  });
})();
