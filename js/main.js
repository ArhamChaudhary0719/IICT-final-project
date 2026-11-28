/* ==========================================================================
   DocEase Clinic - Shared Navigation, Home Search, Find Doctor & Profile
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

  function getDoctorInitials(name) {
    return String(name)
      .replace(/^Dr\.\s*/i, "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
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
          .map((doc) => {
            const thumb = doc.photo
              ? `<img class="search-result-thumb" src="${escapeHtml(doc.photo)}" alt="${escapeHtml(
                  doc.name
                )}">`
              : `<span class="search-result-initials" aria-hidden="true">${escapeHtml(
                  getDoctorInitials(doc.name)
                )}</span>`;
            return `
            <a class="search-result-item" href="doctorprofile.html?id=${encodeURIComponent(
              doc.id
            )}">
              <span class="search-result-item__doctor">
                ${thumb}
                <span><strong>${escapeHtml(doc.name)}</strong> &mdash; ${escapeHtml(
                  doc.specialty
                )}</span>
              </span>
              <span style="font-size:0.82rem;color:var(--color-sage-dark);font-weight:600;">${escapeHtml(
                doc.consultationFee
              )} &bull; ${escapeHtml(doc.nextAvailable || doc.availability)}</span>
            </a>
          `;
          })
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

  function matchesVisitFormatFilter(doc, filterValue) {
    if (filterValue === "all") return true;
    const format = (doc.visitFormat || "").toLowerCase();
    if (filterValue === "video") return format.includes("video");
    if (filterValue === "in-clinic") return format.includes("only");
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
    const visitFormatButtons = Array.from(document.querySelectorAll("[data-visit-format]"));

    const doctors = window.CLINIC_DATA.doctors || [];
    const state = {
      query: "",
      specialty: "all",
      experience: "all",
      availability: "any",
      visitFormat: "all"
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
      const formatParam = params.get("format");

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

      if (
        formatParam &&
        visitFormatButtons.some((b) => b.getAttribute("data-visit-format") === formatParam)
      ) {
        state.visitFormat = formatParam;
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

        if (state.visitFormat !== "all") url.searchParams.set("format", state.visitFormat);
        else url.searchParams.delete("format");

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
          matchesAvailabilityFilter(doc, state.availability) &&
          matchesVisitFormatFilter(doc, state.visitFormat)
        );
      });

      syncButtonGroup(specialtyButtons, "data-specialty", state.specialty);
      syncButtonGroup(experienceButtons, "data-experience", state.experience);
      syncButtonGroup(availabilityButtons, "data-availability", state.availability);
      syncButtonGroup(visitFormatButtons, "data-visit-format", state.visitFormat);

      if (clearBtn) {
        clearBtn.hidden = !state.query.trim();
      }

      const hasActiveFilters =
        Boolean(state.query.trim()) ||
        state.specialty !== "all" ||
        state.experience !== "all" ||
        state.availability !== "any" ||
        state.visitFormat !== "all";

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
            : `Next: ${doc.nextAvailable || doc.availability}`;
          const focusTags = doc.focusAreas
            .slice(0, 3)
            .map((area) => `<span class="doctor-card__tag">${escapeHtml(area)}</span>`)
            .join("");

          const avatarMarkup = doc.photo
            ? `<div class="doctor-card__avatar doctor-card__avatar--photo"><img src="${escapeHtml(
                doc.photo
              )}" alt="${escapeHtml(doc.name)}" loading="lazy"></div>`
            : `<div class="doctor-card__avatar" aria-hidden="true">${escapeHtml(initials)}</div>`;

          return `
            <article class="doctor-card">
              <div class="doctor-card__head">
                ${avatarMarkup}
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
                  <span>${escapeHtml(doc.experience)} &bull; &#9733; ${escapeHtml(doc.rating)}</span>
                </div>
                <div class="doctor-card__meta-item">
                  <strong>Next Available</strong>
                  <span>${escapeHtml(doc.nextAvailable || doc.availability)}</span>
                </div>
                <div class="doctor-card__meta-item">
                  <strong>Visit Format</strong>
                  <span>${escapeHtml(doc.visitFormat || "In-Clinic Visit")}</span>
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
                <a class="btn-secondary" href="doctorprofile.html?id=${encodeURIComponent(
                  doc.id
                )}&book=1">
                  Book Visit
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
      state.visitFormat = "all";
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

    visitFormatButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.visitFormat = btn.getAttribute("data-visit-format");
        renderDoctors();
        syncUrlParams();
      });
    });

    if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetAllFilters);

    applyInitialQueryParams();
    renderDoctors();
  }

  function buildDoctorPortraitMarkup(doc) {
    const initials = getDoctorInitials(doc.name);
    const statusText = doc.availableToday ? "Available Today" : `Next: ${doc.availability}`;
    const statusClass = doc.availableToday
      ? "portrait-status portrait-status--today"
      : "portrait-status";

    const mediaMarkup = doc.photo
      ? `<div class="portrait-photo-wrap">
           <img class="portrait-photo" src="${escapeHtml(doc.photo)}" alt="Portrait of ${escapeHtml(
             doc.name
           )}">
         </div>`
      : `<svg class="portrait-svg" viewBox="0 0 280 300" role="img" aria-label="Portrait illustration of ${escapeHtml(
          doc.name
        )}">
          <defs>
            <linearGradient id="portraitBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#e7f0e9" />
              <stop offset="100%" stop-color="#e8eef6" />
            </linearGradient>
          </defs>
          <rect width="280" height="300" rx="14" fill="url(#portraitBg)" />
          <circle cx="140" cy="112" r="52" fill="#162d50" />
          <circle cx="140" cy="112" r="45" fill="${escapeHtml(doc.accentColor || "#162d50")}" />
          <text x="140" y="124" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700">
            ${escapeHtml(initials)}
          </text>
          <path d="M58 278c10-56 44-84 82-84s72 28 82 84" fill="#ffffff" stroke="#162d50" stroke-width="4" />
          <path d="M114 196l26 38 26-38" fill="none" stroke="#5f8567" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M98 206v28a42 42 0 0 0 84 0v-28" fill="none" stroke="#162d50" stroke-width="4.5" stroke-linecap="round" />
          <circle cx="140" cy="264" r="9" fill="#5f8567" stroke="#ffffff" stroke-width="2.5" />
        </svg>`;

    return `
      <div class="portrait-frame">
        <div class="portrait-frame__top">
          <span class="portrait-dept-tag">${escapeHtml(doc.specialty)}</span>
          <span class="${statusClass}">${escapeHtml(statusText)}</span>
        </div>

        ${mediaMarkup}

        <div class="portrait-frame__caption">
          <strong>${escapeHtml(doc.name)}</strong>
          <span>${escapeHtml(doc.location)}</span>
        </div>
      </div>
    `;
  }

  function initDoctorProfilePage() {
    const switchSelect = document.getElementById("physicianSwitch");
    if (!switchSelect || !window.CLINIC_DATA) return;

    const doctors = window.CLINIC_DATA.doctors || [];
    const timeSlots = window.CLINIC_DATA.timeSlots || [];
    if (doctors.length === 0) return;

    const portraitCard = document.getElementById("doctorPortraitCard");
    const bioTextEl = document.getElementById("doctorBioText");
    const eduListEl = document.getElementById("doctorEducationList");
    const introBarEl = document.getElementById("doctorIntroBar");
    const nameEl = document.getElementById("doctorName");
    const credsEl = document.getElementById("doctorCredentials");
    const highlightsEl = document.getElementById("doctorHighlights");
    const detailsGridEl = document.getElementById("doctorDetailsGrid");
    const metricFeeEl = document.getElementById("metricFee");
    const metricAvailableEl = document.getElementById("metricAvailable");
    const metricScheduleDaysEl = document.getElementById("metricScheduleDays");
    const metricFormatEl = document.getElementById("metricFormat");
    const metricLocationSubEl = document.getElementById("metricLocationSub");
    const reviewsScoreEl = document.getElementById("reviewsScoreBadge");
    const reviewsListEl = document.getElementById("doctorReviewsList");

    const bookBtn = document.getElementById("bookAppointmentBtn");
    const compareBtn = document.getElementById("compareFeeBtn");

    // Booking modal elements
    const bookingModal = document.getElementById("bookingModal");
    const closeBookingModalBtn = document.getElementById("closeBookingModal");
    const cancelBookingBtn = document.getElementById("cancelBookingBtn");
    const bookingDoctorSummary = document.getElementById("bookingDoctorSummary");
    const bookingForm = document.getElementById("bookingForm");
    const bookingFormatSelect = document.getElementById("bookingFormatSelect");
    const bookingDateInput = document.getElementById("bookingDateInput");
    const bookingTimeSlotsEl = document.getElementById("bookingTimeSlots");
    const patientNameInput = document.getElementById("patientNameInput");
    const patientPhoneInput = document.getElementById("patientPhoneInput");
    const visitNotesInput = document.getElementById("visitNotesInput");
    const bookingConfirmation = document.getElementById("bookingConfirmation");
    const confirmationHeading = document.getElementById("confirmationHeading");
    const confirmationDetails = document.getElementById("confirmationDetails");
    const bookAnotherBtn = document.getElementById("bookAnotherBtn");
    const doneBookingBtn = document.getElementById("doneBookingBtn");

    // Compare Fee modal elements
    const compareModal = document.getElementById("compareFeeModal");
    const closeCompareModalBtn = document.getElementById("closeCompareModal");
    const compareFeeSummary = document.getElementById("compareFeeSummary");
    const compareSortSelect = document.getElementById("compareSortSelect");
    const compareFeeTableBody = document.getElementById("compareFeeTableBody");

    let activeDoctor = doctors[0];
    let selectedSlot = timeSlots[0] || "09:00 AM";

    // Populate Switch Physician dropdown
    switchSelect.innerHTML = doctors
      .map(
        (doc) =>
          `<option value="${escapeHtml(doc.id)}">${escapeHtml(doc.name)} &mdash; ${escapeHtml(
            doc.specialty
          )}</option>`
      )
      .join("");

    function syncProfileUrl(docId) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("id", docId);
        window.history.replaceState({}, "", url.toString());
      } catch (_err) {
        // Ignore in restricted contexts.
      }
    }

    function renderDoctorProfile(doc) {
      activeDoctor = doc;
      switchSelect.value = doc.id;
      document.title = `DocEase Clinic | ${doc.name}`;

      if (portraitCard) portraitCard.innerHTML = buildDoctorPortraitMarkup(doc);
      if (bioTextEl) bioTextEl.textContent = doc.bio;

      if (eduListEl) {
        eduListEl.innerHTML = (doc.education || [])
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("");
      }

      if (introBarEl) {
        introBarEl.innerHTML = `
          <span class="profile-intro-bar__tag">${escapeHtml(doc.specialty)}</span>
          <p class="profile-intro-bar__text">${escapeHtml(doc.shortIntro || doc.bio)}</p>
        `;
      }

      if (nameEl) nameEl.textContent = doc.name;
      if (credsEl) credsEl.textContent = doc.credentials;

      if (highlightsEl) {
        highlightsEl.innerHTML = `
          <span class="profile-highlight-pill">${escapeHtml(doc.experience)}</span>
          <span class="profile-highlight-pill">&#9733; ${escapeHtml(doc.rating)} (${doc.reviewsCount} reviews)</span>
          <span class="profile-highlight-pill">${escapeHtml(doc.languages)}</span>
        `;
      }

      if (detailsGridEl) {
        const scheduleHtml = (doc.schedule || [])
          .map((s) => `${escapeHtml(s.day)}: ${escapeHtml(s.hours)}`)
          .join("<br>");
        const focusHtml = (doc.focusAreas || [])
          .map((area) => `<span class="doctor-card__tag">${escapeHtml(area)}</span>`)
          .join("");

        detailsGridEl.innerHTML = `
          <div class="profile-detail-item">
            <strong>Clinic Location</strong>
            <span>${escapeHtml(doc.location)}</span>
          </div>
          <div class="profile-detail-item">
            <strong>Languages Spoken</strong>
            <span>${escapeHtml(doc.languages)}</span>
          </div>
          <div class="profile-detail-item">
            <strong>Weekly Schedule</strong>
            <span>${scheduleHtml}</span>
          </div>
          <div class="profile-detail-item">
            <strong>Clinical Focus</strong>
            <div class="profile-focus-tags">${focusHtml}</div>
          </div>
        `;
      }

      if (metricFeeEl) metricFeeEl.textContent = doc.consultationFee;
      if (metricAvailableEl) metricAvailableEl.textContent = doc.nextAvailable || doc.availability;
      if (metricScheduleDaysEl) metricScheduleDaysEl.textContent = doc.availability;
      if (metricFormatEl) metricFormatEl.textContent = doc.visitFormat || "In-Clinic Visit";
      if (metricLocationSubEl) metricLocationSubEl.textContent = doc.location;

      if (reviewsScoreEl) {
        reviewsScoreEl.textContent = `★ ${doc.rating} • ${doc.reviewsCount} Verified Reviews`;
      }

      if (reviewsListEl) {
        const reviews = doc.reviews || [];
        reviewsListEl.innerHTML = reviews
          .map(
            (rev) => `
            <blockquote class="profile-review-item">
              <p>&ldquo;${escapeHtml(rev.comment)}&rdquo;</p>
              <footer>&mdash; ${escapeHtml(rev.patient)}</footer>
            </blockquote>
          `
          )
          .join("");
      }
    }

    function openModal(modalEl) {
      if (!modalEl) return;
      modalEl.hidden = false;
      modalEl.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal(modalEl) {
      if (!modalEl) return;
      modalEl.hidden = true;
      modalEl.setAttribute("aria-hidden", "true");
      if (bookingModal?.hidden && compareModal?.hidden) {
        document.body.style.overflow = "";
      }
    }

    function renderBookingModal() {
      if (!bookingDoctorSummary) return;

      const avatarMarkup = activeDoctor.photo
        ? `<img class="booking-doctor-summary__photo" src="${escapeHtml(
            activeDoctor.photo
          )}" alt="${escapeHtml(activeDoctor.name)}">`
        : `<div class="booking-doctor-summary__avatar">${escapeHtml(
            getDoctorInitials(activeDoctor.name)
          )}</div>`;

      bookingDoctorSummary.innerHTML = `
        ${avatarMarkup}
        <div>
          <strong>${escapeHtml(activeDoctor.name)}</strong>
          <span>${escapeHtml(activeDoctor.specialty)} &bull; ${escapeHtml(
            activeDoctor.consultationFee
          )} &bull; ${escapeHtml(activeDoctor.location)}</span>
        </div>
      `;

      if (bookingFormatSelect) {
        const formats = activeDoctor.visitFormats || [activeDoctor.visitFormat || "In-Clinic Visit"];
        bookingFormatSelect.innerHTML = formats
          .map((fmt) => `<option value="${escapeHtml(fmt)}">${escapeHtml(fmt)}</option>`)
          .join("");
      }

      if (bookingDateInput) {
        const today = new Date().toISOString().split("T")[0];
        bookingDateInput.min = today;
        if (!bookingDateInput.value) bookingDateInput.value = today;
      }

      if (bookingTimeSlotsEl) {
        selectedSlot = timeSlots[0] || "09:00 AM";
        bookingTimeSlotsEl.innerHTML = timeSlots
          .map(
            (slot, idx) => `
            <button
              type="button"
              class="slot-pill ${idx === 0 ? "is-selected" : ""}"
              data-slot="${escapeHtml(slot)}"
              aria-pressed="${idx === 0 ? "true" : "false"}"
            >
              ${escapeHtml(slot)}
            </button>
          `
          )
          .join("");
      }

      if (bookingForm) bookingForm.hidden = false;
      if (bookingConfirmation) bookingConfirmation.hidden = true;
    }

    function renderCompareFeeTable(sortMode) {
      if (!compareFeeTableBody) return;

      const sorted = [...doctors];
      if (sortMode === "fee-asc") {
        sorted.sort((a, b) => (a.feeAmount || 0) - (b.feeAmount || 0));
      } else if (sortMode === "fee-desc") {
        sorted.sort((a, b) => (b.feeAmount || 0) - (a.feeAmount || 0));
      }

      const fees = doctors.map((d) => d.feeAmount || parseInt(d.consultationFee.replace(/\D/g, ""), 10) || 0);
      const minFee = Math.min(...fees);
      const maxFee = Math.max(...fees);

      if (compareFeeSummary) {
        compareFeeSummary.textContent = `Clinic consultation fees range from $${minFee} to $${maxFee}. Currently viewing ${activeDoctor.name} (${activeDoctor.consultationFee}).`;
      }

      compareFeeTableBody.innerHTML = sorted
        .map((doc) => {
          const isCurrent = doc.id === activeDoctor.id;
          const thumb = doc.photo
            ? `<img class="compare-doctor-thumb" src="${escapeHtml(doc.photo)}" alt="${escapeHtml(
                doc.name
              )}">`
            : `<span class="compare-doctor-initials" aria-hidden="true">${escapeHtml(
                getDoctorInitials(doc.name)
              )}</span>`;
          return `
            <tr class="${isCurrent ? "is-current-row" : ""}">
              <td>
                <div class="compare-doctor-cell">
                  ${thumb}
                  <div>
                    <strong>${escapeHtml(doc.name)}</strong>
                    <div class="compare-sub">${escapeHtml(doc.credentials)}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge-specialty">${escapeHtml(doc.specialty)}</span></td>
              <td><strong class="compare-fee-cell">${escapeHtml(doc.consultationFee)}</strong></td>
              <td>${escapeHtml(doc.nextAvailable || doc.availability)}</td>
              <td>${escapeHtml(doc.visitFormat || "In-Clinic Visit")}</td>
              <td>
                <button
                  type="button"
                  class="${isCurrent ? "btn-secondary" : "btn-primary"} btn-table-select"
                  data-select-doctor="${escapeHtml(doc.id)}"
                >
                  ${isCurrent ? "Current Profile" : "Select Physician"}
                </button>
              </td>
            </tr>
          `;
        })
        .join("");
    }

    // Event listeners
    switchSelect.addEventListener("change", () => {
      const nextDoc = doctors.find((d) => d.id === switchSelect.value) || doctors[0];
      renderDoctorProfile(nextDoc);
      syncProfileUrl(nextDoc.id);
    });

    if (bookBtn) {
      bookBtn.addEventListener("click", () => {
        renderBookingModal();
        openModal(bookingModal);
      });
    }

    if (compareBtn) {
      compareBtn.addEventListener("click", () => {
        renderCompareFeeTable(compareSortSelect ? compareSortSelect.value : "default");
        openModal(compareModal);
      });
    }

    if (bookingTimeSlotsEl) {
      bookingTimeSlotsEl.addEventListener("click", (event) => {
        const pill = event.target.closest("[data-slot]");
        if (!pill) return;
        selectedSlot = pill.getAttribute("data-slot");
        bookingTimeSlotsEl.querySelectorAll("[data-slot]").forEach((btn) => {
          const active = btn === pill;
          btn.classList.toggle("is-selected", active);
          btn.setAttribute("aria-pressed", String(active));
        });
      });
    }

    if (bookingForm) {
      bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const patientName = patientNameInput ? patientNameInput.value.trim() : "Patient";
        const visitFormat = bookingFormatSelect ? bookingFormatSelect.value : "In-Clinic Visit";
        const visitDate = bookingDateInput ? bookingDateInput.value : "Next Available";
        const refCode = `DE-${Math.floor(1000 + Math.random() * 9000)}`;

        if (confirmationHeading) {
          confirmationHeading.textContent = `Confirmed for ${patientName} (${refCode})`;
        }
        if (confirmationDetails) {
          confirmationDetails.innerHTML = `
            You are scheduled with <strong>${escapeHtml(activeDoctor.name)}</strong> (${escapeHtml(
              activeDoctor.specialty
            )}) on <strong>${escapeHtml(visitDate)}</strong> at <strong>${escapeHtml(
              selectedSlot
            )}</strong> via <strong>${escapeHtml(visitFormat)}</strong>. Consultation fee: <strong>${escapeHtml(
              activeDoctor.consultationFee
            )}</strong> at ${escapeHtml(activeDoctor.location)}.
          `;
        }

        bookingForm.hidden = true;
        if (bookingConfirmation) bookingConfirmation.hidden = false;
      });
    }

    if (bookAnotherBtn) {
      bookAnotherBtn.addEventListener("click", () => {
        if (visitNotesInput) visitNotesInput.value = "";
        renderBookingModal();
      });
    }

    if (doneBookingBtn) {
      doneBookingBtn.addEventListener("click", () => closeModal(bookingModal));
    }
    if (closeBookingModalBtn) {
      closeBookingModalBtn.addEventListener("click", () => closeModal(bookingModal));
    }
    if (cancelBookingBtn) {
      cancelBookingBtn.addEventListener("click", () => closeModal(bookingModal));
    }

    if (compareSortSelect) {
      compareSortSelect.addEventListener("change", () => {
        renderCompareFeeTable(compareSortSelect.value);
      });
    }

    if (compareFeeTableBody) {
      compareFeeTableBody.addEventListener("click", (event) => {
        const selectBtn = event.target.closest("[data-select-doctor]");
        if (!selectBtn) return;
        const docId = selectBtn.getAttribute("data-select-doctor");
        const chosen = doctors.find((d) => d.id === docId);
        if (chosen) {
          renderDoctorProfile(chosen);
          syncProfileUrl(chosen.id);
          closeModal(compareModal);
        }
      });
    }

    if (closeCompareModalBtn) {
      closeCompareModalBtn.addEventListener("click", () => closeModal(compareModal));
    }

    [bookingModal, compareModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal(modal);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (bookingModal && !bookingModal.hidden) closeModal(bookingModal);
        if (compareModal && !compareModal.hidden) closeModal(compareModal);
      }
    });

    // Load doctor & modal state from URL params
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const initialDoc = doctors.find((d) => d.id === idParam) || doctors[0];
    renderDoctorProfile(initialDoc);

    if (params.get("book") === "1") {
      renderBookingModal();
      openModal(bookingModal);
    } else if (params.get("compare") === "1") {
      renderCompareFeeTable("default");
      openModal(compareModal);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initNavigation();
    initClinicAnalysisChart();
    initHomeSearch();
    initFindDoctorPage();
    initDoctorProfilePage();
  });
})();
