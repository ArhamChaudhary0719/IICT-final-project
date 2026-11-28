/* ==========================================================================
   DocEase Clinic - Reschedule Appointment Logic
   Depends on js/appointments.js (loadAppointments, saveAppointments, formatStatusLabel)
   ========================================================================== */

const CLINIC_TIME_SLOTS = [
  "09:00 AM",
  "09:45 AM",
  "10:30 AM",
  "11:15 AM",
  "12:00 PM",
  "01:30 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "04:45 PM"
];

/* --------------------------------------------------------------------------
   Date & Availability Helpers
   -------------------------------------------------------------------------- */

/**
 * Formats a Date object as YYYY-MM-DD in local time.
 */
function formatDateInput(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

/**
 * Returns today's local date as YYYY-MM-DD.
 */
function getTodayDateString() {
  return formatDateInput(new Date());
}

/**
 * Returns tomorrow's local date as YYYY-MM-DD.
 */
function getTomorrowDateString() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return formatDateInput(tomorrow);
}

/**
 * Validates that dateStr is a real calendar date strictly after today.
 */
function isValidFutureDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const parts = dateStr.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  const parsed = new Date(year, month - 1, day);
  const isRealCalendarDate =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  if (!isRealCalendarDate) {
    return false;
  }

  return dateStr > getTodayDateString();
}

/**
 * Builds a map of unavailable time slots for a doctor on a given date.
 * Includes existing upcoming bookings and simulated clinic-busy slots.
 */
function getUnavailableSlotsMap(appointments, selectedAppointment, dateStr) {
  const unavailable = {};

  // Simulated clinic-booked slots so every future date shows realistic availability
  const dayNumber = Number(dateStr.split("-")[2]) || 1;
  const doctorSeed = selectedAppointment.doctorName.length;
  const firstBusyIndex = (dayNumber + doctorSeed) % CLINIC_TIME_SLOTS.length;
  const secondBusyIndex = (dayNumber * 2 + doctorSeed + 3) % CLINIC_TIME_SLOTS.length;

  unavailable[CLINIC_TIME_SLOTS[firstBusyIndex]] = "Booked";
  unavailable[CLINIC_TIME_SLOTS[secondBusyIndex]] = "Booked";
  unavailable["12:00 PM"] = "Booked";

  // Check actual stored upcoming appointments for the same doctor and date
  appointments.forEach(function (appointment) {
    if (
      appointment.status === "upcoming" &&
      appointment.date === dateStr &&
      appointment.doctorName === selectedAppointment.doctorName
    ) {
      if (appointment.id === selectedAppointment.id) {
        unavailable[appointment.time] = "Current";
      } else {
        unavailable[appointment.time] = "Booked";
      }
    }
  });

  return unavailable;
}

/* --------------------------------------------------------------------------
   DOM Helpers
   -------------------------------------------------------------------------- */

/**
 * Populates a <ul> details list safely from label/value pairs.
 */
function renderDetailsList(listElement, items) {
  listElement.innerHTML = "";
  items.forEach(function (item) {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = item.label + ": ";
    li.appendChild(strong);
    li.appendChild(document.createTextNode(item.value));
    listElement.appendChild(li);
  });
}

/* --------------------------------------------------------------------------
   Page Controller
   -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function () {
  const pageAlert = document.getElementById("page-alert");
  const pageAlertMessage = document.getElementById("page-alert-message");
  const pageAlertActions = document.getElementById("page-alert-actions");

  const selectorSection = document.getElementById("selector-section");
  const appointmentSelect = document.getElementById("appointment-select");

  const rescheduleWorkspace = document.getElementById("reschedule-workspace");
  const currentStatusBadge = document.getElementById("current-status-badge");
  const currentBookingList = document.getElementById("current-booking-list");

  const rescheduleForm = document.getElementById("reschedule-form");
  const formErrorBox = document.getElementById("form-error");
  const newDateInput = document.getElementById("new-date");
  const timeSlotsGrid = document.getElementById("time-slots-grid");
  const slotsSummary = document.getElementById("slots-summary");
  const slotMessageBox = document.getElementById("slot-message");
  const confirmRescheduleBtn = document.getElementById("confirm-reschedule-btn");

  const confirmationSection = document.getElementById("confirmation-section");
  const confirmationIntro = document.getElementById("confirmation-intro");
  const confirmationDetails = document.getElementById("confirmation-details");
  const rescheduleAnotherBtn = document.getElementById("reschedule-another-btn");

  let allAppointments = loadAppointments();
  let selectedAppointment = null;
  let selectedTimeSlot = "";

  // Restrict date picker to tomorrow or later
  if (newDateInput) {
    newDateInput.min = getTomorrowDateString();
  }

  function showPageAlert(message, showBackAction) {
    pageAlertMessage.textContent = message;
    pageAlert.hidden = false;
    pageAlertActions.hidden = !showBackAction;
  }

  function hidePageAlert() {
    pageAlert.hidden = true;
    pageAlertMessage.textContent = "";
    pageAlertActions.hidden = true;
  }

  function showFormError(message) {
    formErrorBox.textContent = message;
    formErrorBox.hidden = false;
  }

  function clearFormError() {
    formErrorBox.textContent = "";
    formErrorBox.hidden = true;
  }

  function showSlotMessage(message) {
    if (!slotMessageBox) {
      return;
    }
    slotMessageBox.textContent = message;
    slotMessageBox.hidden = false;
  }

  function clearSlotMessage() {
    if (!slotMessageBox) {
      return;
    }
    slotMessageBox.textContent = "";
    slotMessageBox.hidden = true;
  }

  function updateConfirmButtonState() {
    if (!confirmRescheduleBtn) {
      return;
    }
    const chosenDate = newDateInput ? newDateInput.value.trim() : "";
    const canConfirm =
      Boolean(selectedAppointment) &&
      selectedAppointment.status === "upcoming" &&
      isValidFutureDate(chosenDate) &&
      Boolean(selectedTimeSlot) &&
      !(
        chosenDate === selectedAppointment.date &&
        selectedTimeSlot === selectedAppointment.time
      );

    confirmRescheduleBtn.disabled = !canConfirm;
    confirmRescheduleBtn.setAttribute("aria-disabled", String(!canConfirm));
  }

  function populateAppointmentSelector(upcomingList, preselectedId) {
    if (!appointmentSelect) {
      return;
    }

    appointmentSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Choose an upcoming appointment --";
    appointmentSelect.appendChild(placeholder);

    upcomingList.forEach(function (appointment) {
      const option = document.createElement("option");
      option.value = appointment.id;
      option.textContent =
        appointment.id +
        " — " +
        appointment.doctorName +
        " (" +
        appointment.date +
        " at " +
        appointment.time +
        ")";
      if (preselectedId && appointment.id === preselectedId) {
        option.selected = true;
      }
      appointmentSelect.appendChild(option);
    });
  }

  function renderCurrentBooking(appointment) {
    currentStatusBadge.className = "status-badge status-" + appointment.status;
    currentStatusBadge.textContent = formatStatusLabel(appointment.status);

    renderDetailsList(currentBookingList, [
      { label: "Booking ID", value: appointment.id },
      { label: "Doctor", value: appointment.doctorName },
      { label: "Specialty", value: appointment.specialty },
      { label: "Current Date & Time", value: appointment.date + " at " + appointment.time },
      { label: "Location", value: appointment.location },
      { label: "Reason", value: appointment.reason }
    ]);
  }

  function renderTimeSlotsPlaceholder(message) {
    selectedTimeSlot = "";
    clearSlotMessage();
    timeSlotsGrid.innerHTML = "";
    slotsSummary.textContent = message;

    const hint = document.createElement("p");
    hint.className = "slots-empty-note";
    hint.textContent = message;
    timeSlotsGrid.appendChild(hint);
    updateConfirmButtonState();
  }

  function renderTimeSlotsForDate(dateStr) {
    selectedTimeSlot = "";
    clearSlotMessage();
    timeSlotsGrid.innerHTML = "";

    if (!dateStr) {
      renderTimeSlotsPlaceholder("Pick a future date to view available slots.");
      return;
    }

    if (!isValidFutureDate(dateStr)) {
      renderTimeSlotsPlaceholder("Choose a valid future date to unlock time slots.");
      return;
    }

    const unavailableMap = getUnavailableSlotsMap(
      allAppointments,
      selectedAppointment,
      dateStr
    );

    let availableCount = 0;
    let bookedCount = 0;

    CLINIC_TIME_SLOTS.forEach(function (slotTime) {
      const unavailableReason = unavailableMap[slotTime];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "slot-btn";
      button.setAttribute("data-time", slotTime);

      if (unavailableReason) {
        bookedCount += 1;
        button.classList.add("slot-unavailable");
        button.setAttribute("aria-disabled", "true");
        button.setAttribute("data-unavailable", "true");
        button.textContent = slotTime + " (" + unavailableReason + ")";

        button.addEventListener("click", function () {
          selectedTimeSlot = "";
          clearFormError();
          const allButtons = timeSlotsGrid.querySelectorAll(".slot-btn");
          allButtons.forEach(function (btn) {
            btn.classList.remove("selected");
            if (!btn.hasAttribute("data-unavailable")) {
              btn.setAttribute("aria-pressed", "false");
            }
          });
          showSlotMessage("this slot already book you can change the slot");
          updateConfirmButtonState();
        });
      } else {
        availableCount += 1;
        button.setAttribute("aria-pressed", "false");
        button.textContent = slotTime;

        button.addEventListener("click", function () {
          clearFormError();
          clearSlotMessage();
          selectedTimeSlot = slotTime;

          const allButtons = timeSlotsGrid.querySelectorAll(".slot-btn");
          allButtons.forEach(function (btn) {
            const isSelected = btn === button;
            btn.classList.toggle("selected", isSelected);
            if (!btn.hasAttribute("data-unavailable")) {
              btn.setAttribute("aria-pressed", String(isSelected));
            }
          });
          updateConfirmButtonState();
        });
      }

      timeSlotsGrid.appendChild(button);
    });

    slotsSummary.textContent =
      availableCount + " available, " + bookedCount + " unavailable for " + dateStr;
    updateConfirmButtonState();
  }

  function activateAppointmentForReschedule(appointment) {
    selectedAppointment = appointment;
    selectedTimeSlot = "";
    clearFormError();
    clearSlotMessage();
    confirmationSection.hidden = true;

    renderCurrentBooking(appointment);
    newDateInput.value = "";
    renderTimeSlotsPlaceholder("Pick a future date to view available slots.");
    rescheduleWorkspace.hidden = false;
    updateConfirmButtonState();
  }

  function initializePage() {
    allAppointments = loadAppointments();
    const upcomingAppointments = allAppointments.filter(function (appointment) {
      return appointment.status === "upcoming";
    });

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");

    hidePageAlert();
    confirmationSection.hidden = true;
    rescheduleWorkspace.hidden = true;

    if (requestedId) {
      const matched = allAppointments.find(function (appointment) {
        return appointment.id === requestedId;
      });

      if (!matched) {
        showPageAlert(
          'Appointment "' +
            requestedId +
            '" was not found. You can choose an upcoming appointment below or return to My Appointments.',
          upcomingAppointments.length === 0
        );

        if (upcomingAppointments.length > 0) {
          selectorSection.hidden = false;
          populateAppointmentSelector(upcomingAppointments, "");
        } else {
          selectorSection.hidden = true;
        }
        return;
      }

      if (matched.status !== "upcoming") {
        showPageAlert(
          "Appointment " +
            matched.id +
            " is marked as " +
            formatStatusLabel(matched.status) +
            " and cannot be rescheduled. Only upcoming appointments can be rescheduled.",
          upcomingAppointments.length === 0
        );

        if (upcomingAppointments.length > 0) {
          selectorSection.hidden = false;
          populateAppointmentSelector(upcomingAppointments, "");
        } else {
          selectorSection.hidden = true;
        }
        return;
      }

      // Valid upcoming appointment from URL ?id=
      selectorSection.hidden = true;
      activateAppointmentForReschedule(matched);
      return;
    }

    // Opened directly without ?id=
    if (upcomingAppointments.length === 0) {
      selectorSection.hidden = true;
      showPageAlert(
        "You currently have no upcoming appointments available to reschedule.",
        true
      );
      return;
    }

    selectorSection.hidden = false;
    populateAppointmentSelector(upcomingAppointments, "");
  }

  // Handle dropdown selection when opened directly (or after invalid ID fallback)
  if (appointmentSelect) {
    appointmentSelect.addEventListener("change", function () {
      hidePageAlert();
      const chosenId = appointmentSelect.value;

      if (!chosenId) {
        selectedAppointment = null;
        selectedTimeSlot = "";
        rescheduleWorkspace.hidden = true;
        updateConfirmButtonState();
        return;
      }

      allAppointments = loadAppointments();
      const chosen = allAppointments.find(function (appointment) {
        return appointment.id === chosenId && appointment.status === "upcoming";
      });

      if (!chosen) {
        selectedAppointment = null;
        selectedTimeSlot = "";
        rescheduleWorkspace.hidden = true;
        updateConfirmButtonState();
        showPageAlert(
          "The selected appointment is no longer upcoming or could not be found.",
          true
        );
        return;
      }

      activateAppointmentForReschedule(chosen);
    });
  }

  // Update available time slots whenever date changes
  if (newDateInput) {
    function handleDateUpdate(showInvalidError) {
      clearFormError();
      clearSlotMessage();
      if (!selectedAppointment) {
        return;
      }

      const chosenDate = newDateInput.value.trim();
      if (showInvalidError && chosenDate && !isValidFutureDate(chosenDate)) {
        showFormError(
          "Please select a valid future date (after " +
            getTodayDateString() +
            "). Past dates and today are not available."
        );
      }

      renderTimeSlotsForDate(chosenDate);
    }

    newDateInput.addEventListener("change", function () {
      handleDateUpdate(true);
    });

    newDateInput.addEventListener("input", function () {
      const chosenDate = newDateInput.value.trim();
      if (!chosenDate || /^\d{4}-\d{2}-\d{2}$/.test(chosenDate)) {
        handleDateUpdate(false);
      } else {
        updateConfirmButtonState();
      }
    });
  }

  // Handle form submission
  if (rescheduleForm) {
    rescheduleForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormError();

      if (!selectedAppointment || selectedAppointment.status !== "upcoming") {
        showFormError("Please select an upcoming appointment before rescheduling.");
        return;
      }

      const newDate = newDateInput.value.trim();
      if (!newDate) {
        showFormError("Please select a new future date for your appointment.");
        newDateInput.focus();
        return;
      }

      if (!isValidFutureDate(newDate)) {
        showFormError(
          "Please choose a valid future date (after " +
            getTodayDateString() +
            "). Past dates and today cannot be booked."
        );
        newDateInput.focus();
        return;
      }

      if (!selectedTimeSlot) {
        showFormError("Please select an available time slot.");
        return;
      }

      if (
        newDate === selectedAppointment.date &&
        selectedTimeSlot === selectedAppointment.time
      ) {
        showFormError(
          "Your appointment is already scheduled for that date and time. Please choose a different slot."
        );
        return;
      }

      // Re-verify slot availability and save to localStorage
      allAppointments = loadAppointments();
      const targetIndex = allAppointments.findIndex(function (appointment) {
        return appointment.id === selectedAppointment.id;
      });

      if (targetIndex === -1 || allAppointments[targetIndex].status !== "upcoming") {
        showFormError(
          "This appointment is no longer available to reschedule. Please return to My Appointments."
        );
        return;
      }

      const previousDateTime =
        allAppointments[targetIndex].date + " at " + allAppointments[targetIndex].time;

      const unavailableMap = getUnavailableSlotsMap(
        allAppointments,
        allAppointments[targetIndex],
        newDate
      );

      if (unavailableMap[selectedTimeSlot]) {
        renderTimeSlotsForDate(newDate);
        showSlotMessage("this slot already book you can change the slot");
        return;
      }

      allAppointments[targetIndex].date = newDate;
      allAppointments[targetIndex].time = selectedTimeSlot;
      saveAppointments(allAppointments);

      const updatedAppointment = allAppointments[targetIndex];
      selectedAppointment = updatedAppointment;

      // Show confirmation state
      hidePageAlert();
      selectorSection.hidden = true;
      rescheduleWorkspace.hidden = true;

      confirmationIntro.textContent =
        "Your visit with " +
        updatedAppointment.doctorName +
        " has been updated in your appointments list.";

      renderDetailsList(confirmationDetails, [
        { label: "Booking ID", value: updatedAppointment.id },
        { label: "Doctor", value: updatedAppointment.doctorName + " (" + updatedAppointment.specialty + ")" },
        { label: "Previous Date & Time", value: previousDateTime },
        { label: "New Date & Time", value: updatedAppointment.date + " at " + updatedAppointment.time },
        { label: "Location", value: updatedAppointment.location }
      ]);

      const remainingUpcoming = allAppointments.filter(function (appointment) {
        return appointment.status === "upcoming";
      });
      rescheduleAnotherBtn.hidden = remainingUpcoming.length === 0;
      confirmationSection.hidden = false;
    });
  }

  // Optional reset to reschedule another upcoming appointment
  if (rescheduleAnotherBtn) {
    rescheduleAnotherBtn.addEventListener("click", function () {
      window.history.replaceState({}, "", "reschedule-appointment.html");
      initializePage();
    });
  }

  initializePage();
});
