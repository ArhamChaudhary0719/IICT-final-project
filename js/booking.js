/* ==========================================================================
   DocEase Clinic - Appointment Booking Logic (Page 1)
   Author: Student 26i-3213 (Branch: i263213)
   Module: Step 1 Appointment Booking Flow
   ========================================================================== */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_APPOINTMENTS_KEY = "docease_appointments";
  const STORAGE_DRAFT_KEY = "docease_booking_draft";
  const STORAGE_LATEST_BOOKING_KEY = "docease_latest_booking";

  // Application State
  const bookingState = {
    selectedDoctor: null,
    selectedDate: "",
    selectedTimeSlot: "",
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    visitFormat: "In-Clinic Visit",
    patientReason: ""
  };

  // DOM Elements
  let doctorsContainer;
  let doctorSearchInput;
  let doctorSpecialtyFilter;
  let appointmentDateInput;
  let selectedDoctorScheduleText;
  let slotsGrid;
  let slotCountLabel;
  let slotNotification;
  let bookingForm;
  let patientFullNameInput;
  let patientPhoneInput;
  let patientEmailInput;
  let visitFormatSelect;
  let patientReasonInput;
  let summaryDoctorChip;
  let summaryDateChip;
  let summaryTimeChip;
  let clearDraftBtn;
  let bookingAlert;
  let bookingAlertText;

  // Error Message Elements
  let doctorSelectionError;
  let dateError;
  let slotError;
  let nameError;
  let phoneError;
  let reasonError;

  /* --------------------------------------------------------------------------
     Initialization
     -------------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    cacheDomElements();
    setupDateConstraints();
    renderDoctorCards();
    setupEventListeners();
    handleUrlParameters();
    restoreDraftState();
    updateSummaryChips();
  });

  /**
   * Cache references to DOM nodes
   */
  function cacheDomElements() {
    doctorsContainer = document.getElementById("doctorsContainer");
    doctorSearchInput = document.getElementById("doctorSearchInput");
    doctorSpecialtyFilter = document.getElementById("doctorSpecialtyFilter");
    appointmentDateInput = document.getElementById("appointmentDate");
    selectedDoctorScheduleText = document.getElementById("selectedDoctorScheduleText");
    slotsGrid = document.getElementById("slotsGrid");
    slotCountLabel = document.getElementById("slotCountLabel");
    slotNotification = document.getElementById("slotNotification");
    bookingForm = document.getElementById("appointmentBookingForm");
    patientFullNameInput = document.getElementById("patientFullName");
    patientPhoneInput = document.getElementById("patientPhone");
    patientEmailInput = document.getElementById("patientEmail");
    visitFormatSelect = document.getElementById("visitFormat");
    patientReasonInput = document.getElementById("patientReason");
    summaryDoctorChip = document.getElementById("summaryDoctorChip");
    summaryDateChip = document.getElementById("summaryDateChip");
    summaryTimeChip = document.getElementById("summaryTimeChip");
    clearDraftBtn = document.getElementById("clearDraftBtn");
    bookingAlert = document.getElementById("bookingAlert");
    bookingAlertText = document.getElementById("bookingAlertText");

    // Errors
    doctorSelectionError = document.getElementById("doctorSelectionError");
    dateError = document.getElementById("dateError");
    slotError = document.getElementById("slotError");
    nameError = document.getElementById("nameError");
    phoneError = document.getElementById("phoneError");
    reasonError = document.getElementById("reasonError");
  }

  /**
   * Ensure min date on the date picker is today (prevents past appointments)
   */
  function setupDateConstraints() {
    if (!appointmentDateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    appointmentDateInput.min = formattedToday;

    // Set default date to tomorrow if none set
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomYyyy = tomorrow.getFullYear();
    const tomMm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const tomDd = String(tomorrow.getDate()).padStart(2, "0");
    bookingState.selectedDate = `${tomYyyy}-${tomMm}-${tomDd}`;
    appointmentDateInput.value = bookingState.selectedDate;
  }

  /* --------------------------------------------------------------------------
     Section 1: Doctor Cards Rendering & Filtering
     -------------------------------------------------------------------------- */

  /**
   * Returns list of doctors from window.CLINIC_DATA.doctors
   */
  function getDoctorsList() {
    if (window.CLINIC_DATA && Array.isArray(window.CLINIC_DATA.doctors)) {
      return window.CLINIC_DATA.doctors;
    }
    return [];
  }

  /**
   * Render doctor cards based on search and specialty filter
   */
  function renderDoctorCards() {
    if (!doctorsContainer) return;

    const doctors = getDoctorsList();
    const searchTerm = (doctorSearchInput?.value || "").toLowerCase().trim();
    const specialtyFilter = (doctorSpecialtyFilter?.value || "all").toLowerCase();

    const filtered = doctors.filter(function (doc) {
      const matchSearch =
        doc.name.toLowerCase().includes(searchTerm) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(searchTerm)) ||
        (doc.credentials && doc.credentials.toLowerCase().includes(searchTerm));
      const matchSpecialty =
        specialtyFilter === "all" ||
        (doc.specialty && doc.specialty.toLowerCase() === specialtyFilter);
      return matchSearch && matchSpecialty;
    });

    doctorsContainer.innerHTML = "";

    if (filtered.length === 0) {
      doctorsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--color-text-muted);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No doctors found matching your filter criteria.</p>
          <button type="button" class="btn-clear-draft" id="resetDoctorFiltersBtn">Reset Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetDoctorFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          if (doctorSearchInput) doctorSearchInput.value = "";
          if (doctorSpecialtyFilter) doctorSpecialtyFilter.value = "all";
          renderDoctorCards();
        });
      }
      return;
    }

    filtered.forEach(function (doc) {
      const isSelected = bookingState.selectedDoctor && bookingState.selectedDoctor.id === doc.id;
      const card = document.createElement("div");
      card.className = `doctor-card ${isSelected ? "is-selected" : ""}`;
      card.setAttribute("role", "radio");
      card.setAttribute("aria-checked", String(isSelected));
      card.setAttribute("tabindex", "0");
      card.dataset.doctorId = doc.id;

      const photoSrc = doc.photo || "images/logo.jpg";
      const rating = doc.rating || "4.9";
      const reviews = doc.reviewsCount || "100+";
      const fee = doc.consultationFee || "$75";
      const availability = doc.availability || "Mon - Fri";

      card.innerHTML = `
        <span class="doctor-card__check-indicator" aria-hidden="true">&#10003;</span>
        <div class="doctor-card__header">
          <img
            src="${photoSrc}"
            alt="Portrait of ${doc.name}"
            class="doctor-card__photo"
            onerror="this.src='images/logo.jpg'"
          >
          <div>
            <h3 class="doctor-card__name">${doc.name}</h3>
            <span class="doctor-card__specialty">${doc.specialty}</span>
          </div>
        </div>

        <div class="doctor-card__details">
          <div class="doctor-card__detail-item">
            <span>&#127891;</span>
            <span>${doc.credentials || "Licensed Specialist"}</span>
          </div>
          <div class="doctor-card__detail-item">
            <span>&#9733;</span>
            <span>${rating} (${reviews} reviews)</span>
          </div>
          <div class="doctor-card__detail-item">
            <span>&#128197;</span>
            <span>Available: ${availability}</span>
          </div>
        </div>

        <div class="doctor-card__badge-row">
          <span class="doctor-card__fee">${fee}</span>
          <button type="button" class="doctor-card__select-btn">
            ${isSelected ? "Selected" : "Select Doctor"}
          </button>
        </div>
      `;

      // Click and keyboard selection
      card.addEventListener("click", function () {
        selectDoctor(doc);
      });

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectDoctor(doc);
        }
      });

      doctorsContainer.appendChild(card);
    });
  }

  /**
   * Select a doctor
   */
  function selectDoctor(doctor) {
    bookingState.selectedDoctor = doctor;

    // Clear error
    if (doctorSelectionError) {
      doctorSelectionError.classList.remove("is-visible");
    }

    // Update doctor cards UI
    const allCards = doctorsContainer.querySelectorAll(".doctor-card");
    allCards.forEach(function (card) {
      const isThis = card.dataset.doctorId === doctor.id;
      card.classList.toggle("is-selected", isThis);
      card.setAttribute("aria-checked", String(isThis));
      const btn = card.querySelector(".doctor-card__select-btn");
      if (btn) {
        btn.textContent = isThis ? "Selected" : "Select Doctor";
      }
    });

    // Update Doctor Schedule Guidance
    if (selectedDoctorScheduleText) {
      const days = doctor.availability || "Mon - Fri";
      const room = doctor.location || "Consultation Wing";
      selectedDoctorScheduleText.textContent = `${doctor.name} is on duty: ${days} (${room})`;
    }

    // Refresh time slots based on doctor availability
    renderTimeSlots();
    updateSummaryChips();
    saveDraftState();
  }

  /* --------------------------------------------------------------------------
     Section 2: Time Slots Generation & Booking Conflict Check
     -------------------------------------------------------------------------- */

  /**
   * Retrieves standard time slots
   */
  function getTimeSlotsList() {
    if (window.CLINIC_DATA && Array.isArray(window.CLINIC_DATA.timeSlots)) {
      return window.CLINIC_DATA.timeSlots;
    }
    return [
      "09:00 AM",
      "09:30 AM",
      "10:30 AM",
      "11:30 AM",
      "02:00 PM",
      "03:00 PM",
      "04:30 PM",
      "05:30 PM"
    ];
  }

  /**
   * Load stored appointments to check conflicts
   */
  function getExistingAppointments() {
    try {
      const stored = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not read appointments from localStorage:", e);
    }
    return [];
  }

  /**
   * Checks if a slot is already booked for this doctor on this date
   */
  function isSlotBooked(slotTime) {
    if (!bookingState.selectedDoctor || !bookingState.selectedDate) {
      return false;
    }
    const appointments = getExistingAppointments();
    return appointments.some(function (apt) {
      const sameDoctor =
        apt.doctorId === bookingState.selectedDoctor.id ||
        (apt.doctorName && apt.doctorName === bookingState.selectedDoctor.name);
      const sameDate = apt.date === bookingState.selectedDate;
      const sameTime = apt.time === slotTime;
      const isActive = apt.status !== "cancelled";
      return sameDoctor && sameDate && sameTime && isActive;
    });
  }

  /**
   * Render Time Slot pills
   */
  function renderTimeSlots() {
    if (!slotsGrid) return;

    const slots = getTimeSlotsList();
    slotsGrid.innerHTML = "";

    let availableCount = 0;

    slots.forEach(function (slotTime) {
      const booked = isSlotBooked(slotTime);
      const isSelected = bookingState.selectedTimeSlot === slotTime && !booked;

      if (!booked) {
        availableCount++;
      }

      const slotBtn = document.createElement("button");
      slotBtn.type = "button";
      slotBtn.className = `slot-btn ${isSelected ? "is-selected" : ""} ${booked ? "is-booked" : ""}`;
      slotBtn.setAttribute("role", "radio");
      slotBtn.setAttribute("aria-checked", String(isSelected));
      slotBtn.setAttribute("aria-disabled", String(booked));
      slotBtn.textContent = slotTime;

      slotBtn.addEventListener("click", function () {
        if (booked) {
          showSlotNotification(
            `The ${slotTime} slot with ${bookingState.selectedDoctor?.name || "the doctor"} is already booked for this date. Please choose another available slot.`
          );
          return;
        }
        selectTimeSlot(slotTime);
      });

      slotsGrid.appendChild(slotBtn);
    });

    if (slotCountLabel) {
      slotCountLabel.textContent = `${availableCount} open slot${availableCount === 1 ? "" : "s"}`;
    }

    // If current selected slot became booked due to date/doctor change, reset it
    if (bookingState.selectedTimeSlot && isSlotBooked(bookingState.selectedTimeSlot)) {
      bookingState.selectedTimeSlot = "";
      updateSummaryChips();
    }
  }

  /**
   * Select a time slot
   */
  function selectTimeSlot(slotTime) {
    bookingState.selectedTimeSlot = slotTime;

    // Clear error
    if (slotError) {
      slotError.classList.remove("is-visible");
    }
    hideSlotNotification();

    // Update slots UI
    const allSlotBtns = slotsGrid.querySelectorAll(".slot-btn");
    allSlotBtns.forEach(function (btn) {
      const isThis = btn.textContent.trim().startsWith(slotTime) && !btn.classList.contains("is-booked");
      btn.classList.toggle("is-selected", isThis);
      btn.setAttribute("aria-checked", String(isThis));
    });

    updateSummaryChips();
    saveDraftState();
  }

  function showSlotNotification(message) {
    if (!slotNotification) return;
    slotNotification.textContent = message;
    slotNotification.classList.add("is-active");
  }

  function hideSlotNotification() {
    if (!slotNotification) return;
    slotNotification.textContent = "";
    slotNotification.classList.remove("is-active");
  }

  /* --------------------------------------------------------------------------
     Section 3: Patient Form & Validation
     -------------------------------------------------------------------------- */

  /**
   * Setup event listeners for forms, inputs, and filters
   */
  function setupEventListeners() {
    // Search input
    if (doctorSearchInput) {
      doctorSearchInput.addEventListener("input", function () {
        renderDoctorCards();
      });
    }

    // Specialty filter
    if (doctorSpecialtyFilter) {
      doctorSpecialtyFilter.addEventListener("change", function () {
        renderDoctorCards();
      });
    }

    // Date change
    if (appointmentDateInput) {
      appointmentDateInput.addEventListener("change", function () {
        bookingState.selectedDate = appointmentDateInput.value;
        if (dateError) dateError.classList.remove("is-visible");
        renderTimeSlots();
        updateSummaryChips();
        saveDraftState();
      });
    }

    // Input listeners to update state and auto-save draft
    if (patientFullNameInput) {
      patientFullNameInput.addEventListener("input", function () {
        bookingState.patientName = patientFullNameInput.value;
        if (nameError) nameError.classList.remove("is-visible");
        patientFullNameInput.classList.remove("has-error");
        saveDraftState();
      });
    }

    if (patientPhoneInput) {
      patientPhoneInput.addEventListener("input", function () {
        bookingState.patientPhone = patientPhoneInput.value;
        if (phoneError) phoneError.classList.remove("is-visible");
        patientPhoneInput.classList.remove("has-error");
        saveDraftState();
      });
    }

    if (patientEmailInput) {
      patientEmailInput.addEventListener("input", function () {
        bookingState.patientEmail = patientEmailInput.value;
        saveDraftState();
      });
    }

    if (visitFormatSelect) {
      visitFormatSelect.addEventListener("change", function () {
        bookingState.visitFormat = visitFormatSelect.value;
        saveDraftState();
      });
    }

    if (patientReasonInput) {
      patientReasonInput.addEventListener("input", function () {
        bookingState.patientReason = patientReasonInput.value;
        if (reasonError) reasonError.classList.remove("is-visible");
        patientReasonInput.classList.remove("has-error");
        saveDraftState();
      });
    }

    // Clear Draft Button
    if (clearDraftBtn) {
      clearDraftBtn.addEventListener("click", function () {
        if (confirm("Are you sure you want to clear your current booking draft?")) {
          clearBookingDraft();
        }
      });
    }

    // Form Submission
    if (bookingForm) {
      bookingForm.addEventListener("submit", handleFormSubmission);
    }
  }

  /**
   * Validate entire booking form
   */
  function validateBookingForm() {
    let isValid = true;
    let firstInvalidElement = null;

    // 1. Doctor validation
    if (!bookingState.selectedDoctor) {
      if (doctorSelectionError) doctorSelectionError.classList.add("is-visible");
      isValid = false;
      if (!firstInvalidElement) firstInvalidElement = doctorsContainer;
    } else {
      if (doctorSelectionError) doctorSelectionError.classList.remove("is-visible");
    }

    // 2. Date validation
    const dateVal = appointmentDateInput?.value || "";
    if (!dateVal) {
      if (dateError) {
        dateError.textContent = "Please select an appointment date.";
        dateError.classList.add("is-visible");
      }
      isValid = false;
      if (!firstInvalidElement) firstInvalidElement = appointmentDateInput;
    } else {
      const selected = new Date(dateVal + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected < today) {
        if (dateError) {
          dateError.textContent = "Appointment date cannot be in the past.";
          dateError.classList.add("is-visible");
        }
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = appointmentDateInput;
      } else {
        if (dateError) dateError.classList.remove("is-visible");
      }
    }

    // 3. Time slot validation
    if (!bookingState.selectedTimeSlot) {
      if (slotError) slotError.classList.add("is-visible");
      isValid = false;
      if (!firstInvalidElement) firstInvalidElement = slotsGrid;
    } else {
      if (slotError) slotError.classList.remove("is-visible");
    }

    // 4. Patient Name validation
    const nameVal = (patientFullNameInput?.value || "").trim();
    if (nameVal.length < 2) {
      if (nameError) nameError.classList.add("is-visible");
      if (patientFullNameInput) patientFullNameInput.classList.add("has-error");
      isValid = false;
      if (!firstInvalidElement) firstInvalidElement = patientFullNameInput;
    } else {
      if (nameError) nameError.classList.remove("is-visible");
      if (patientFullNameInput) patientFullNameInput.classList.remove("has-error");
    }

    // 5. Phone validation
    const phoneVal = (patientPhoneInput?.value || "").trim();
    const phoneDigits = phoneVal.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      if (phoneError) phoneError.classList.add("is-visible");
      if (patientPhoneInput) patientPhoneInput.classList.add("has-error");
      isValid = false;
      if (!firstInvalidElement) firstInvalidElement = patientPhoneInput;
    } else {
      if (phoneError) phoneError.classList.remove("is-visible");
      if (patientPhoneInput) patientPhoneInput.classList.remove("has-error");
    }

    // 6. Reason validation
    const reasonVal = (patientReasonInput?.value || "").trim();
    if (reasonVal.length < 5) {
      if (reasonError) reasonError.classList.add("is-visible");
      if (patientReasonInput) patientReasonInput.classList.add("has-error");
      isValid = false;
      if (!firstInvalidElement) firstInvalidElement = patientReasonInput;
    } else {
      if (reasonError) reasonError.classList.remove("is-visible");
      if (patientReasonInput) patientReasonInput.classList.remove("has-error");
    }

    if (!isValid && firstInvalidElement) {
      firstInvalidElement.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof firstInvalidElement.focus === "function") {
        firstInvalidElement.focus();
      }
    }

    return isValid;
  }

  /**
   * Handle Confirm Appointment form submission
   */
  function handleFormSubmission(event) {
    event.preventDefault();

    if (!validateBookingForm()) {
      showTopAlert("Please complete all required fields correctly to confirm your appointment.");
      return;
    }

    // Generate Unique Booking ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `APT-${randomNum}`;

    const newAppointment = {
      id: bookingId,
      doctorName: bookingState.selectedDoctor.name,
      doctorId: bookingState.selectedDoctor.id,
      specialty: bookingState.selectedDoctor.specialty,
      doctorPhoto: bookingState.selectedDoctor.photo || "images/logo.jpg",
      credentials: bookingState.selectedDoctor.credentials || "",
      fee: bookingState.selectedDoctor.consultationFee || "$75",
      location: bookingState.selectedDoctor.location || "Room 104, Main Clinic",
      date: bookingState.selectedDate,
      time: bookingState.selectedTimeSlot,
      patientName: patientFullNameInput.value.trim(),
      patientPhone: patientPhoneInput.value.trim(),
      patientEmail: patientEmailInput?.value.trim() || "",
      visitFormat: visitFormatSelect?.value || "In-Clinic Visit",
      reason: patientReasonInput.value.trim(),
      status: "upcoming",
      createdAt: new Date().toISOString()
    };

    // Save into localStorage (Member 4's key for global compatibility)
    const existing = getExistingAppointments();
    existing.unshift(newAppointment);

    try {
      localStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(existing));
      // Save last booking to sessionStorage for Page 2 & Page 3 immediate display
      sessionStorage.setItem(STORAGE_LATEST_BOOKING_KEY, JSON.stringify(newAppointment));
      // Clear draft
      sessionStorage.removeItem(STORAGE_DRAFT_KEY);
    } catch (e) {
      console.error("Storage error:", e);
    }

    // Success feedback and transition to Page 2
    showTopAlert(`Appointment Confirmed! Booking ID: ${bookingId}. Redirecting...`);

    // Redirect to Page 2 (Booking Confirmation)
    setTimeout(function () {
      window.location.href = `booking-confirmation.html?id=${encodeURIComponent(bookingId)}`;
    }, 900);
  }

  function showTopAlert(text) {
    if (!bookingAlert || !bookingAlertText) return;
    bookingAlertText.textContent = text;
    bookingAlert.classList.add("is-visible");
    bookingAlert.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* --------------------------------------------------------------------------
     State Persistence & Draft Handlers (Survives Refresh)
     -------------------------------------------------------------------------- */

  function saveDraftState() {
    try {
      const draft = {
        doctorId: bookingState.selectedDoctor ? bookingState.selectedDoctor.id : "",
        date: appointmentDateInput ? appointmentDateInput.value : "",
        timeSlot: bookingState.selectedTimeSlot || "",
        patientName: patientFullNameInput ? patientFullNameInput.value : "",
        patientPhone: patientPhoneInput ? patientPhoneInput.value : "",
        patientEmail: patientEmailInput ? patientEmailInput.value : "",
        visitFormat: visitFormatSelect ? visitFormatSelect.value : "In-Clinic Visit",
        patientReason: patientReasonInput ? patientReasonInput.value : ""
      };
      sessionStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      // storage unavailable or quota exceeded
    }
  }

  function restoreDraftState() {
    try {
      const stored = sessionStorage.getItem(STORAGE_DRAFT_KEY);
      if (!stored) return;
      const draft = JSON.parse(stored);

      if (draft.doctorId && !bookingState.selectedDoctor) {
        const doctors = getDoctorsList();
        const found = doctors.find(d => d.id === draft.doctorId);
        if (found) selectDoctor(found);
      }

      if (draft.date && appointmentDateInput) {
        appointmentDateInput.value = draft.date;
        bookingState.selectedDate = draft.date;
      }

      if (draft.timeSlot) {
        selectTimeSlot(draft.timeSlot);
      }

      if (draft.patientName && patientFullNameInput) {
        patientFullNameInput.value = draft.patientName;
        bookingState.patientName = draft.patientName;
      }

      if (draft.patientPhone && patientPhoneInput) {
        patientPhoneInput.value = draft.patientPhone;
        bookingState.patientPhone = draft.patientPhone;
      }

      if (draft.patientEmail && patientEmailInput) {
        patientEmailInput.value = draft.patientEmail;
        bookingState.patientEmail = draft.patientEmail;
      }

      if (draft.visitFormat && visitFormatSelect) {
        visitFormatSelect.value = draft.visitFormat;
        bookingState.visitFormat = draft.visitFormat;
      }

      if (draft.patientReason && patientReasonInput) {
        patientReasonInput.value = draft.patientReason;
        bookingState.patientReason = draft.patientReason;
      }
    } catch (e) {
      console.warn("Could not restore draft state:", e);
    }
  }

  function clearBookingDraft() {
    try {
      sessionStorage.removeItem(STORAGE_DRAFT_KEY);
    } catch (e) {}

    bookingState.selectedDoctor = null;
    bookingState.selectedTimeSlot = "";
    bookingState.patientName = "";
    bookingState.patientPhone = "";
    bookingState.patientEmail = "";
    bookingState.patientReason = "";

    if (patientFullNameInput) patientFullNameInput.value = "";
    if (patientPhoneInput) patientPhoneInput.value = "";
    if (patientEmailInput) patientEmailInput.value = "";
    if (patientReasonInput) patientReasonInput.value = "";

    setupDateConstraints();
    renderDoctorCards();
    renderTimeSlots();
    updateSummaryChips();
    hideSlotNotification();

    // Reset error messages
    const errors = document.querySelectorAll(".field-error-msg");
    errors.forEach(e => e.classList.remove("is-visible"));
    const errorInputs = document.querySelectorAll(".has-error");
    errorInputs.forEach(i => i.classList.remove("has-error"));
  }

  /**
   * Handle URL Parameters (e.g. ?doctor=dr-ayesha-khan)
   */
  function handleUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const doctorParam = params.get("doctor") || params.get("id");
    if (doctorParam) {
      const doctors = getDoctorsList();
      const matched = doctors.find(function (d) {
        return d.id === doctorParam || d.name.toLowerCase().includes(doctorParam.toLowerCase());
      });
      if (matched) {
        selectDoctor(matched);
      }
    }
  }

  /**
   * Update Summary Action Bar Chips
   */
  function updateSummaryChips() {
    if (summaryDoctorChip) {
      summaryDoctorChip.textContent = bookingState.selectedDoctor
        ? `Doctor: ${bookingState.selectedDoctor.name}`
        : "Doctor: Not Selected";
    }

    if (summaryDateChip) {
      summaryDateChip.textContent = bookingState.selectedDate
        ? `Date: ${bookingState.selectedDate}`
        : "Date: Not Selected";
    }

    if (summaryTimeChip) {
      summaryTimeChip.textContent = bookingState.selectedTimeSlot
        ? `Time: ${bookingState.selectedTimeSlot}`
        : "Time: Not Selected";
    }
  }
})();
