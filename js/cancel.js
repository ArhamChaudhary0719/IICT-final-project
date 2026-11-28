/* ==========================================================================
   DocEase Clinic - Cancel Appointment Logic
   Depends on js/appointments.js (STORAGE_KEY, loadAppointments, saveAppointments, formatStatusLabel)
   ========================================================================== */

/* --------------------------------------------------------------------------
   DOM Helpers
   -------------------------------------------------------------------------- */

/**
 * Populates a <ul> details list safely from label/value pairs.
 */
function renderCancelDetailsList(listElement, items) {
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

  const cancelWorkspace = document.getElementById("cancel-workspace");
  const currentStatusBadge = document.getElementById("current-status-badge");
  const currentBookingList = document.getElementById("current-booking-list");

  const cancelForm = document.getElementById("cancel-form");
  const formErrorBox = document.getElementById("form-error");
  const cancelReasonSelect = document.getElementById("cancel-reason");
  const cancelNotesInput = document.getElementById("cancel-notes");
  const confirmCheckbox = document.getElementById("confirm-cancel-checkbox");

  const finalConfirmPanel = document.getElementById("final-confirm-panel");
  const finalConfirmMessage = document.getElementById("final-confirm-message");
  const finalConfirmBtn = document.getElementById("final-confirm-btn");
  const keepAppointmentBtn = document.getElementById("keep-appointment-btn");

  const formActionsRow = document.getElementById("form-actions-row");
  const cancelAppointmentBtn = document.getElementById("cancel-appointment-btn");

  const confirmationSection = document.getElementById("confirmation-section");
  const confirmationIntro = document.getElementById("confirmation-intro");
  const confirmationDetails = document.getElementById("confirmation-details");
  const cancelAnotherBtn = document.getElementById("cancel-another-btn");

  let allAppointments = loadAppointments();
  let selectedAppointment = null;

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

  function hideFinalConfirmPrompt() {
    if (finalConfirmPanel) {
      finalConfirmPanel.hidden = true;
    }
    if (formActionsRow) {
      formActionsRow.hidden = false;
    }
  }

  /**
   * Keeps the Cancel Appointment button disabled until an upcoming appointment
   * is selected AND the confirmation checkbox is checked.
   */
  function updateCancelButtonState() {
    if (!cancelAppointmentBtn) {
      return;
    }
    const hasUpcomingAppointment =
      Boolean(selectedAppointment) && selectedAppointment.status === "upcoming";
    const isConfirmed = Boolean(confirmCheckbox && confirmCheckbox.checked);
    const canCancel = hasUpcomingAppointment && isConfirmed;

    cancelAppointmentBtn.disabled = !canCancel;
    cancelAppointmentBtn.setAttribute("aria-disabled", String(!canCancel));

    if (!canCancel && finalConfirmPanel && !finalConfirmPanel.hidden) {
      hideFinalConfirmPrompt();
    }
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

    renderCancelDetailsList(currentBookingList, [
      { label: "Booking ID", value: appointment.id },
      { label: "Doctor", value: appointment.doctorName },
      { label: "Specialty", value: appointment.specialty },
      { label: "Date & Time", value: appointment.date + " at " + appointment.time },
      { label: "Location", value: appointment.location },
      { label: "Reason", value: appointment.reason }
    ]);
  }

  function activateAppointmentForCancel(appointment) {
    selectedAppointment = appointment;
    clearFormError();
    hideFinalConfirmPrompt();
    confirmationSection.hidden = true;

    if (cancelReasonSelect) {
      cancelReasonSelect.value = "";
    }
    if (cancelNotesInput) {
      cancelNotesInput.value = "";
    }
    if (confirmCheckbox) {
      confirmCheckbox.checked = false;
    }

    renderCurrentBooking(appointment);
    cancelWorkspace.hidden = false;
    updateCancelButtonState();
  }

  function initializePage() {
    allAppointments = loadAppointments();
    const upcomingAppointments = allAppointments.filter(function (appointment) {
      return appointment.status === "upcoming";
    });

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");

    selectedAppointment = null;
    if (confirmCheckbox) {
      confirmCheckbox.checked = false;
    }
    hidePageAlert();
    clearFormError();
    hideFinalConfirmPrompt();
    confirmationSection.hidden = true;
    cancelWorkspace.hidden = true;
    updateCancelButtonState();

    if (requestedId) {
      const matched = allAppointments.find(function (appointment) {
        return appointment.id === requestedId;
      });

      if (!matched) {
        showPageAlert(
          'Appointment "' +
            requestedId +
            '" was not found. You can select an upcoming appointment below or return to My Appointments.',
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
            " and cannot be cancelled. Only upcoming appointments can be cancelled.",
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

      selectorSection.hidden = true;
      activateAppointmentForCancel(matched);
      return;
    }

    // Opened directly without ?id=
    if (upcomingAppointments.length === 0) {
      selectorSection.hidden = true;
      showPageAlert(
        "You currently have no upcoming appointments available to cancel.",
        true
      );
      return;
    }

    selectorSection.hidden = false;
    populateAppointmentSelector(upcomingAppointments, "");
  }

  // Dropdown selection when opened directly (or after invalid ID fallback)
  if (appointmentSelect) {
    appointmentSelect.addEventListener("change", function () {
      hidePageAlert();
      const chosenId = appointmentSelect.value;

      if (!chosenId) {
        selectedAppointment = null;
        if (confirmCheckbox) {
          confirmCheckbox.checked = false;
        }
        hideFinalConfirmPrompt();
        cancelWorkspace.hidden = true;
        updateCancelButtonState();
        return;
      }

      allAppointments = loadAppointments();
      const chosen = allAppointments.find(function (appointment) {
        return appointment.id === chosenId && appointment.status === "upcoming";
      });

      if (!chosen) {
        selectedAppointment = null;
        if (confirmCheckbox) {
          confirmCheckbox.checked = false;
        }
        cancelWorkspace.hidden = true;
        updateCancelButtonState();
        showPageAlert(
          "The selected appointment is no longer upcoming or could not be found.",
          true
        );
        return;
      }

      activateAppointmentForCancel(chosen);
    });
  }

  // Toggle button state whenever confirmation checkbox changes
  if (confirmCheckbox) {
    confirmCheckbox.addEventListener("change", function () {
      clearFormError();
      updateCancelButtonState();
    });
  }

  // First click on "Cancel Appointment" asks for explicit confirmation before cancelling
  if (cancelForm) {
    cancelForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormError();

      if (!selectedAppointment || selectedAppointment.status !== "upcoming") {
        showFormError("Please select an upcoming appointment before cancelling.");
        updateCancelButtonState();
        return;
      }

      if (!confirmCheckbox || !confirmCheckbox.checked) {
        showFormError("Please check the confirmation box before cancelling your appointment.");
        updateCancelButtonState();
        return;
      }

      finalConfirmMessage.textContent =
        "You are about to cancel booking " +
        selectedAppointment.id +
        " with " +
        selectedAppointment.doctorName +
        " on " +
        selectedAppointment.date +
        " at " +
        selectedAppointment.time +
        ".";

      formActionsRow.hidden = true;
      finalConfirmPanel.hidden = false;
      if (finalConfirmBtn) {
        finalConfirmBtn.focus();
      }
    });
  }

  // User decides to keep the appointment in the confirmation prompt
  if (keepAppointmentBtn) {
    keepAppointmentBtn.addEventListener("click", function () {
      hideFinalConfirmPrompt();
      if (cancelAppointmentBtn && !cancelAppointmentBtn.disabled) {
        cancelAppointmentBtn.focus();
      }
    });
  }

  // Final confirmation writes status = "cancelled" to localStorage
  if (finalConfirmBtn) {
    finalConfirmBtn.addEventListener("click", function () {
      clearFormError();

      if (!selectedAppointment || !confirmCheckbox || !confirmCheckbox.checked) {
        hideFinalConfirmPrompt();
        updateCancelButtonState();
        return;
      }

      allAppointments = loadAppointments();
      const targetIndex = allAppointments.findIndex(function (appointment) {
        return appointment.id === selectedAppointment.id;
      });

      if (targetIndex === -1 || allAppointments[targetIndex].status !== "upcoming") {
        hideFinalConfirmPrompt();
        showFormError(
          "This appointment is no longer upcoming and cannot be cancelled. Please return to My Appointments."
        );
        selectedAppointment = null;
        updateCancelButtonState();
        return;
      }

      const selectedReason = cancelReasonSelect ? cancelReasonSelect.value.trim() : "";
      const notes = cancelNotesInput ? cancelNotesInput.value.trim() : "";
      const combinedReason = [selectedReason, notes].filter(Boolean).join(" — ");

      allAppointments[targetIndex].status = "cancelled";
      if (combinedReason) {
        allAppointments[targetIndex].cancellationReason = combinedReason;
      }
      saveAppointments(allAppointments);

      const cancelledAppointment = allAppointments[targetIndex];
      selectedAppointment = cancelledAppointment;

      hidePageAlert();
      selectorSection.hidden = true;
      cancelWorkspace.hidden = true;

      confirmationIntro.textContent =
        "Your appointment with " +
        cancelledAppointment.doctorName +
        " has been cancelled and synced with My Appointments and Reschedule Appointment.";

      const summaryItems = [
        { label: "Booking ID", value: cancelledAppointment.id },
        {
          label: "Doctor",
          value: cancelledAppointment.doctorName + " (" + cancelledAppointment.specialty + ")"
        },
        {
          label: "Cancelled Date & Time",
          value: cancelledAppointment.date + " at " + cancelledAppointment.time
        },
        { label: "Location", value: cancelledAppointment.location },
        { label: "Status", value: formatStatusLabel(cancelledAppointment.status) }
      ];

      if (cancelledAppointment.cancellationReason) {
        summaryItems.push({
          label: "Cancellation Note",
          value: cancelledAppointment.cancellationReason
        });
      }

      renderCancelDetailsList(confirmationDetails, summaryItems);

      const remainingUpcoming = allAppointments.filter(function (appointment) {
        return appointment.status === "upcoming";
      });
      cancelAnotherBtn.hidden = remainingUpcoming.length === 0;
      confirmationSection.hidden = false;
    });
  }

  // Optional reset to cancel another upcoming appointment
  if (cancelAnotherBtn) {
    cancelAnotherBtn.addEventListener("click", function () {
      window.history.replaceState({}, "", "cancel-appointment.html");
      initializePage();
    });
  }

  // Keep page synced if localStorage changes in another tab (My Appointments / Reschedule)
  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY && confirmationSection.hidden) {
      initializePage();
    }
  });

  initializePage();
});
