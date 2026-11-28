/* ==========================================================================
   DocEase Clinic - Clinic Locations Page Script
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

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function normalizeDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function initClinicSearch() {
    const form = document.getElementById("clinicSearchForm");
    const input = document.getElementById("clinicSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const resetBtn = document.getElementById("resetSearchBtn");
    const cardsContainer = document.getElementById("clinicCards");
    const emptyState = document.getElementById("noClinicsMessage");
    const emptyDetail = document.getElementById("noClinicsDetail");
    const statusEl = document.getElementById("searchStatus");

    if (!form || !input || !cardsContainer || !emptyState) return;

    const cards = Array.from(cardsContainer.querySelectorAll(".clinic-card"));

    function filterClinics() {
      const rawQuery = input.value.trim();
      const textQuery = normalizeText(rawQuery);
      const digitQuery = normalizeDigits(rawQuery);

      if (clearBtn) {
        clearBtn.hidden = rawQuery.length === 0;
      }

      let visibleCount = 0;

      cards.forEach((card) => {
        const name = normalizeText(card.dataset.clinicName);
        const address = normalizeText(card.dataset.clinicAddress);
        const phone = normalizeText(card.dataset.clinicPhone);
        const phoneDigits = normalizeDigits(card.dataset.clinicPhone);

        const matchesText =
          !textQuery ||
          name.includes(textQuery) ||
          address.includes(textQuery) ||
          phone.includes(textQuery);

        const matchesDigits =
          digitQuery.length >= 2 && phoneDigits.includes(digitQuery);

        const isMatch = matchesText || matchesDigits;
        card.hidden = !isMatch;
        if (isMatch) visibleCount += 1;
      });

      if (visibleCount === 0) {
        emptyState.hidden = false;
        if (emptyDetail) {
          emptyDetail.textContent = `No DocEase clinic matched "${rawQuery}". Try searching by clinic name (South Jay, Town Center, Hylo East), street address, or phone number.`;
        }
      } else {
        emptyState.hidden = true;
      }

      if (statusEl) {
        if (!rawQuery) {
          statusEl.hidden = true;
          statusEl.textContent = "";
        } else {
          statusEl.hidden = false;
          statusEl.textContent =
            visibleCount === 0
              ? `0 clinics found for "${rawQuery}"`
              : `Showing ${visibleCount} of ${cards.length} clinics for "${rawQuery}"`;
        }
      }
    }

    function resetSearch() {
      input.value = "";
      filterClinics();
      input.focus();
    }

    input.addEventListener("input", filterClinics);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      filterClinics();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", resetSearch);
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", resetSearch);
    }
  }

  function initAppointmentModal() {
    const modal = document.getElementById("bookingModal");
    const closeBtn = document.getElementById("closeModalBtn");
    const doneBtn = document.getElementById("doneBookingBtn");
    const form = document.getElementById("bookingForm");
    const confirmation = document.getElementById("bookingConfirmation");
    const confirmationMessage = document.getElementById("confirmationMessage");
    const modalClinicName = document.getElementById("modalClinicName");
    const modalClinicDetails = document.getElementById("modalClinicDetails");
    const bookingDateInput = document.getElementById("bookingDate");
    const bookingSpecialtySelect = document.getElementById("bookingSpecialty");
    const bookingTimeSelect = document.getElementById("bookingTime");
    const patientNameInput = document.getElementById("patientName");
    const findDoctorLink = document.getElementById("findDoctorLink");
    const bookButtons = document.querySelectorAll(".book-btn[data-clinic]");

    // Book an Appointment buttons navigate directly to finddoctor.html with the
    // clinic name as a URL parameter (?q=<clinic name>). finddoctor.html reads
    // the ?q param via URLSearchParams and pre-fills the doctor search field,
    // so the user arrives on the Find Doctor page already filtered by clinic.
    bookButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const clinicName = btn.dataset.clinic || "";
        window.location.href = "finddoctor.html?q=" + encodeURIComponent(clinicName);
      });
    });

    // The modal and its helpers below are kept in place but are no longer
    // triggered by the Book buttons; they remain available for future use.
    if (!modal || !form || !confirmation) return;

    let lastFocusedButton = null;
    let activeClinicName = "";

    if (bookingDateInput) {
      const todayIso = new Date().toISOString().split("T")[0];
      bookingDateInput.min = todayIso;
      bookingDateInput.value = todayIso;
    }

    function openModal(triggerBtn) {
      lastFocusedButton = triggerBtn;
      activeClinicName = triggerBtn.dataset.clinic || "DocEase Clinic";
      const address = triggerBtn.dataset.address || "";
      const phone = triggerBtn.dataset.phone || "";

      if (modalClinicName) {
        modalClinicName.textContent = activeClinicName;
      }
      if (modalClinicDetails) {
        modalClinicDetails.textContent = `${address} | ${phone}`;
      }
      if (findDoctorLink) {
        findDoctorLink.href = `finddoctor.html?q=${encodeURIComponent(activeClinicName)}`;
      }

      form.hidden = false;
      confirmation.hidden = true;
      modal.hidden = false;
      document.body.style.overflow = "hidden";

      if (bookingSpecialtySelect) {
        bookingSpecialtySelect.focus();
      }
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocusedButton) {
        lastFocusedButton.focus();
      }
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    if (doneBtn) {
      doneBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const patientName = patientNameInput ? patientNameInput.value.trim() : "Patient";
      const specialty = bookingSpecialtySelect ? bookingSpecialtySelect.value : "General Medicine";
      const dateVal = bookingDateInput ? bookingDateInput.value : "";
      const timeVal = bookingTimeSelect ? bookingTimeSelect.value : "";

      if (confirmationMessage) {
        confirmationMessage.textContent = `Thank you, ${patientName}. Your ${specialty} appointment request at ${activeClinicName} for ${dateVal} at ${timeVal} has been submitted.`;
      }

      form.hidden = true;
      confirmation.hidden = false;
      form.reset();

      if (bookingDateInput) {
        const todayIso = new Date().toISOString().split("T")[0];
        bookingDateInput.value = todayIso;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("currentYear");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }

    initNavigation();
    initClinicSearch();
    initAppointmentModal();
  });
})();
