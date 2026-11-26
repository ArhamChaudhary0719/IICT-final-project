/* ==========================================================================
   CarePulse Medical Clinic - 3-Page Interactive Logic
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "carepulse_appointments_v1";

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

  function getStoredAppointments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveAppointments(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_err) {
      // Ignore storage errors in restricted environments
    }
  }

  function setFieldError(inputEl, message) {
    const group = inputEl.closest(".form-group");
    const errEl = group ? group.querySelector(".form-error") : null;
    if (message) {
      inputEl.classList.add("is-invalid");
      inputEl.setAttribute("aria-invalid", "true");
      if (errEl) errEl.textContent = message;
    } else {
      inputEl.classList.remove("is-invalid");
      inputEl.removeAttribute("aria-invalid");
      if (errEl) errEl.textContent = "";
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
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
          <a class="btn btn--primary btn--sm" href="doctorprofile.html?id=${encodeURIComponent(
            doc.id
          )}">View Profile</a>
        </div>
      </article>
    `;
  }

  /* ------------------------------------------------------------------------
     Shared Navigation
     ------------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------------
     Home Page (Quick Doctor Search + Featured Doctors)
     ------------------------------------------------------------------------ */
  function initHomePage() {
    const featuredGrid = document.getElementById("homeFeaturedDoctors");
    const quickForm = document.getElementById("homeQuickSearchForm");
    const quickInput = document.getElementById("homeQuickSearchInput");

    if (quickForm && quickInput) {
      quickForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const q = quickInput.value.trim();
        const target = q ? `finddoctor.html?q=${encodeURIComponent(q)}` : "finddoctor.html";
        window.location.href = target;
      });
    }

    if (featuredGrid && window.CLINIC_DATA) {
      featuredGrid.innerHTML = window.CLINIC_DATA.doctors
        .slice(0, 3)
        .map(renderDoctorCard)
        .join("");
    }
  }

  /* ------------------------------------------------------------------------
     Find Doctor Page (Search + Specialty Filter + Available Today Toggle)
     ------------------------------------------------------------------------ */
  function initFindDoctorPage() {
    const grid = document.getElementById("findDoctorsGrid");
    if (!grid || !window.CLINIC_DATA) return;

    const searchInput = document.getElementById("doctorSearchInput");
    const filterButtons = document.querySelectorAll("[data-doctor-filter]");
    const availableOnlyCheckbox = document.getElementById("availableTodayOnly");
    const countEl = document.getElementById("doctorsCount");

    const params = new URLSearchParams(window.location.search);
    let activeSpecialty = params.get("specialty") || "all";
    let searchTerm = params.get("q") || "";
    let availableOnly = false;

    if (searchInput && searchTerm) {
      searchInput.value = searchTerm;
    }

    filterButtons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.doctorFilter === activeSpecialty);
    });

    function renderDoctors() {
      const q = searchTerm.trim().toLowerCase();
      const filtered = window.CLINIC_DATA.doctors.filter((doc) => {
        const matchesSpecialty =
          activeSpecialty === "all" || doc.departmentId === activeSpecialty;
        const matchesAvail = !availableOnly || doc.availableToday;
        const matchesQuery =
          !q ||
          doc.name.toLowerCase().includes(q) ||
          doc.specialty.toLowerCase().includes(q) ||
          doc.bio.toLowerCase().includes(q) ||
          doc.focusAreas.some((area) => area.toLowerCase().includes(q));
        return matchesSpecialty && matchesAvail && matchesQuery;
      });

      if (countEl) {
        countEl.textContent = `Showing ${filtered.length} of ${window.CLINIC_DATA.doctors.length} doctors`;
      }

      if (filtered.length === 0) {
        grid.innerHTML =
          '<div class="empty-state"><strong>No matching doctors found.</strong><p>Try clearing your search, unchecking "Available Today", or choosing "All Specialties".</p></div>';
        return;
      }

      grid.innerHTML = filtered.map(renderDoctorCard).join("");
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeSpecialty = btn.dataset.doctorFilter;
        renderDoctors();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        searchTerm = searchInput.value;
        renderDoctors();
      });
    }

    if (availableOnlyCheckbox) {
      availableOnlyCheckbox.addEventListener("change", () => {
        availableOnly = availableOnlyCheckbox.checked;
        renderDoctors();
      });
    }

    renderDoctors();
  }

  /* ------------------------------------------------------------------------
     Doctor Profile Page (Dynamic Profile + Inline Appointment Booking)
     ------------------------------------------------------------------------ */
  function initDoctorProfilePage() {
    const profileRoot = document.getElementById("doctorProfileHeader");
    if (!profileRoot || !window.CLINIC_DATA) return;

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    const doctor =
      window.CLINIC_DATA.doctors.find((d) => d.id === requestedId) ||
      window.CLINIC_DATA.doctors[0];

    document.title = `${doctor.name} | CarePulse Medical Clinic`;

    const breadcrumbName = document.getElementById("profileBreadcrumbName");
    if (breadcrumbName) breadcrumbName.textContent = doctor.name;

    // Doctor quick switcher
    const switcherEl = document.getElementById("doctorSwitcher");
    if (switcherEl) {
      switcherEl.innerHTML = window.CLINIC_DATA.doctors
        .map(
          (doc) =>
            `<a class="filter-pill ${
              doc.id === doctor.id ? "is-active" : ""
            }" href="doctorprofile.html?id=${encodeURIComponent(doc.id)}">${escapeHtml(
              doc.name
            )}</a>`
        )
        .join("");
    }

    // Header card
    profileRoot.innerHTML = `
      <div class="profile-identity">
        <div class="doctor-avatar doctor-avatar--lg">${createAvatarSvg(doctor, 104)}</div>
        <div>
          <span class="badge ${doctor.availableToday ? "badge--success" : "badge--warning"}">
            ${doctor.availableToday ? "Available Today" : "By Appointment Schedule"}
          </span>
          <h1 style="margin:0.45rem 0 0.2rem;font-size:clamp(1.5rem,2.6vw,2.1rem);">${escapeHtml(
            doctor.name
          )}</h1>
          <div class="doctor-card__specialty">${escapeHtml(doctor.specialty)} &bull; ${escapeHtml(
      doctor.credentials
    )}</div>
          <div class="profile-meta-row">
            <span><strong>Experience:</strong> ${escapeHtml(doctor.experience)}</span>
            <span><strong>Rating:</strong> &#9733; ${escapeHtml(doctor.rating)} (${
      doctor.reviewsCount
    } reviews)</span>
            <span><strong>Location:</strong> ${escapeHtml(doctor.location)}</span>
            <span><strong>Fee:</strong> ${escapeHtml(doctor.consultationFee)}</span>
          </div>
        </div>
      </div>
      <div>
        <a class="btn btn--primary" href="#bookSection">Book with ${escapeHtml(
          doctor.name.replace(/^Dr\.\s*/i, "Dr. ")
        )}</a>
      </div>
    `;

    // Bio, Focus Areas, Education, Schedule, Reviews
    const bioEl = document.getElementById("profileBio");
    const focusEl = document.getElementById("profileFocusAreas");
    const eduEl = document.getElementById("profileEducation");
    const schedEl = document.getElementById("profileScheduleBody");
    const reviewsEl = document.getElementById("profileReviews");

    if (bioEl) bioEl.textContent = doctor.bio;
    if (focusEl) {
      focusEl.innerHTML = doctor.focusAreas
        .map((item) => `<li class="tag">${escapeHtml(item)}</li>`)
        .join("");
    }
    if (eduEl) {
      eduEl.innerHTML = doctor.education
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
    }
    if (schedEl) {
      schedEl.innerHTML = doctor.schedule
        .map(
          (row) =>
            `<tr><td><strong>${escapeHtml(row.day)}</strong></td><td>${escapeHtml(
              row.hours
            )}</td></tr>`
        )
        .join("");
    }
    if (reviewsEl) {
      reviewsEl.innerHTML = doctor.reviews
        .map(
          (rev) => `
          <div class="booking-item">
            <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.2rem;">${escapeHtml(
              rev.patient
            )} &bull; &#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <div style="font-size:0.92rem;color:var(--color-text-muted);">&ldquo;${escapeHtml(
              rev.comment
            )}&rdquo;</div>
          </div>
        `
        )
        .join("");
    }

    // Inline Booking Form for this Doctor
    const form = document.getElementById("profileBookingForm");
    const dateInput = document.getElementById("bookingDate");
    const slotContainer = document.getElementById("slotContainer");
    const slotInput = document.getElementById("bookingSlot");
    const nameInput = document.getElementById("patientName");
    const emailInput = document.getElementById("patientEmail");
    const phoneInput = document.getElementById("patientPhone");
    const notesInput = document.getElementById("visitReason");
    const confirmationBox = document.getElementById("bookingConfirmation");
    const bookingsListEl = document.getElementById("doctorBookingsList");

    if (!form) return;

    const todayIso = new Date().toISOString().split("T")[0];
    dateInput.min = todayIso;
    dateInput.value = todayIso;

    function renderSlots() {
      const existing = getStoredAppointments();
      const chosenDate = dateInput.value;

      slotContainer.innerHTML = window.CLINIC_DATA.timeSlots
        .map((slot) => {
          const isTaken = existing.some(
            (appt) =>
              appt.doctorId === doctor.id &&
              appt.date === chosenDate &&
              appt.slot === slot
          );
          const isSelected = slotInput.value === slot && !isTaken;
          if (isTaken && slotInput.value === slot) slotInput.value = "";
          return `<button type="button" class="slot-btn ${
            isSelected ? "is-selected" : ""
          }" data-slot="${escapeHtml(slot)}" ${isTaken ? "disabled" : ""}>${escapeHtml(
            slot
          )}</button>`;
        })
        .join("");
    }

    function renderDoctorBookings() {
      if (!bookingsListEl) return;
      const list = getStoredAppointments().filter((a) => a.doctorId === doctor.id);
      if (list.length === 0) {
        bookingsListEl.innerHTML =
          '<p class="panel__subtitle" style="margin-bottom:0;">No appointments booked with this doctor yet.</p>';
        return;
      }

      bookingsListEl.innerHTML = list
        .map(
          (appt) => `
          <div class="booking-item">
            <div class="booking-item__top">
              <strong>${escapeHtml(appt.patientName)}</strong>
              <span class="badge badge--success">${escapeHtml(appt.reference)}</span>
            </div>
            <div style="font-size:0.88rem;margin-bottom:0.55rem;">
              ${escapeHtml(appt.date)} at ${escapeHtml(appt.slot)}
            </div>
            <button type="button" class="btn btn--danger" data-cancel-booking="${escapeHtml(
              appt.reference
            )}">Cancel</button>
          </div>
        `
        )
        .join("");
    }

    dateInput.addEventListener("change", () => {
      setFieldError(dateInput, "");
      renderSlots();
    });

    slotContainer.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-slot]");
      if (!btn || btn.disabled) return;
      slotInput.value = btn.dataset.slot;
      setFieldError(slotInput, "");
      renderSlots();
    });

    if (bookingsListEl) {
      bookingsListEl.addEventListener("click", (event) => {
        const cancelBtn = event.target.closest("[data-cancel-booking]");
        if (!cancelBtn) return;
        const ref = cancelBtn.dataset.cancelBooking;
        saveAppointments(getStoredAppointments().filter((a) => a.reference !== ref));
        renderDoctorBookings();
        renderSlots();
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;

      if (!dateInput.value || dateInput.value < todayIso) {
        setFieldError(dateInput, "Please choose today or a future date.");
        valid = false;
      } else setFieldError(dateInput, "");

      if (!slotInput.value) {
        setFieldError(slotInput, "Please select an available time slot.");
        valid = false;
      } else setFieldError(slotInput, "");

      if (nameInput.value.trim().length < 2) {
        setFieldError(nameInput, "Please enter the patient's full name.");
        valid = false;
      } else setFieldError(nameInput, "");

      if (!isValidEmail(emailInput.value.trim())) {
        setFieldError(emailInput, "Please enter a valid email address.");
        valid = false;
      } else setFieldError(emailInput, "");

      if (!isValidPhone(phoneInput.value.trim())) {
        setFieldError(phoneInput, "Please enter a valid phone number.");
        valid = false;
      } else setFieldError(phoneInput, "");

      if (!valid) return;

      const reference = "CP-" + Math.floor(100000 + Math.random() * 900000);
      const booking = {
        reference,
        doctorId: doctor.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: dateInput.value,
        slot: slotInput.value,
        patientName: nameInput.value.trim(),
        patientEmail: emailInput.value.trim(),
        patientPhone: phoneInput.value.trim(),
        reason: notesInput.value.trim()
      };

      const all = getStoredAppointments();
      all.unshift(booking);
      saveAppointments(all);

      confirmationBox.hidden = false;
      confirmationBox.innerHTML = `
        <strong>Appointment Confirmed (${escapeHtml(reference)})</strong>
        <p style="margin:0.3rem 0 0;">
          Booked for <strong>${escapeHtml(booking.patientName)}</strong> with
          <strong>${escapeHtml(doctor.name)}</strong> on
          <strong>${escapeHtml(booking.date)}</strong> at
          <strong>${escapeHtml(booking.slot)}</strong>.
        </p>
      `;

      form.reset();
      dateInput.value = todayIso;
      slotInput.value = "";
      renderSlots();
      renderDoctorBookings();
    });

    renderSlots();
    renderDoctorBookings();
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initNavigation();
    initHomePage();
    initFindDoctorPage();
    initDoctorProfilePage();
  });
})();
