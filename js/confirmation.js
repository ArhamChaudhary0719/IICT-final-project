/* ==========================================================================
   DocEase Clinic - Booking Confirmation Logic (Page 2)
   Author: Student 26i-3213 (Branch: i263213)
   Module: Step 2 Booking Confirmation Display
   ========================================================================== */

(function () {
  "use strict";

  // Storage Keys
  const STORAGE_APPOINTMENTS_KEY = "docease_appointments";
  const STORAGE_LATEST_BOOKING_KEY = "docease_latest_booking";

  // DOM Elements
  let confirmedBookingIdDisplay;
  let summaryBookingId;
  let summaryDoctor;
  let summaryDateTime;
  let summaryPatientName;
  let summaryPhoneNumber;
  let viewDetailsBtn;
  let bookAnotherBtn;

  document.addEventListener("DOMContentLoaded", function () {
    cacheElements();
    loadAndDisplayConfirmation();
  });

  function cacheElements() {
    confirmedBookingIdDisplay = document.getElementById("confirmedBookingIdDisplay");
    summaryBookingId = document.getElementById("summaryBookingId");
    summaryDoctor = document.getElementById("summaryDoctor");
    summaryDateTime = document.getElementById("summaryDateTime");
    summaryPatientName = document.getElementById("summaryPatientName");
    summaryPhoneNumber = document.getElementById("summaryPhoneNumber");
    viewDetailsBtn = document.getElementById("viewDetailsBtn");
    bookAnotherBtn = document.getElementById("bookAnotherBtn");
  }

  /**
   * Reads appointment data from URL param, sessionStorage, or localStorage
   */
  function loadAndDisplayConfirmation() {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("id");

    let appointment = null;

    // 1. Try sessionStorage latest booking
    try {
      const sessionLatest = sessionStorage.getItem(STORAGE_LATEST_BOOKING_KEY);
      if (sessionLatest) {
        const parsed = JSON.parse(sessionLatest);
        if (!targetId || (parsed && parsed.id === targetId)) {
          appointment = parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read sessionStorage:", e);
    }

    // 2. If not matched, search localStorage appointments
    if (!appointment && targetId) {
      try {
        const stored = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
        if (stored) {
          const allAppointments = JSON.parse(stored);
          if (Array.isArray(allAppointments)) {
            appointment = allAppointments.find(function (apt) {
              return apt.id === targetId;
            });
          }
        }
      } catch (e) {
        console.warn("Could not read localStorage:", e);
      }
    }

    // 3. If still no appointment (e.g., opened directly without query param)
    if (!appointment) {
      try {
        const stored = localStorage.getItem(STORAGE_APPOINTMENTS_KEY);
        if (stored) {
          const allAppointments = JSON.parse(stored);
          if (Array.isArray(allAppointments) && allAppointments.length > 0) {
            // Pick most recent appointment
            appointment = allAppointments[0];
          }
        }
      } catch (e) {}
    }

    // 4. Fallback safe demo record matching the wireframe sketch (#DE-11829)
    if (!appointment) {
      appointment = {
        id: targetId || "DE-11829",
        doctorName: "Dr. Ayesha Khan",
        specialty: "Cardiology",
        date: "2026-12-05",
        time: "10:30 AM",
        patientName: "Daniyal Imran",
        patientPhone: "(555) 234-8900",
        location: "Room 104, Main Clinic",
        visitFormat: "In-Clinic Visit",
        status: "upcoming"
      };
    }

    // Render values into DOM
    renderConfirmationDetails(appointment);
  }

  /**
   * Render the loaded appointment into the wireframe layout
   */
  function renderConfirmationDetails(appointment) {
    const formattedId = appointment.id.startsWith("#") ? appointment.id : `#${appointment.id}`;

    // Update Card 1 Booking ID
    if (confirmedBookingIdDisplay) {
      confirmedBookingIdDisplay.textContent = formattedId;
    }

    // Update Card 2 Summary Fields
    if (summaryBookingId) {
      summaryBookingId.textContent = formattedId;
    }

    if (summaryDoctor) {
      const specialty = appointment.specialty ? ` (${appointment.specialty})` : "";
      summaryDoctor.textContent = `${appointment.doctorName}${specialty}`;
    }

    if (summaryDateTime) {
      const dateStr = formatDateNice(appointment.date);
      summaryDateTime.textContent = `${dateStr} at ${appointment.time}`;
    }

    if (summaryPatientName) {
      summaryPatientName.textContent = appointment.patientName || "Patient";
    }

    if (summaryPhoneNumber) {
      summaryPhoneNumber.textContent = appointment.patientPhone || "Not specified";
    }

    // Update Action Buttons
    if (viewDetailsBtn) {
      viewDetailsBtn.href = `appointment-details.html?id=${encodeURIComponent(appointment.id)}`;
    }

    if (bookAnotherBtn) {
      bookAnotherBtn.href = "book-appointment.html";
    }

    // Update document title for accessibility
    document.title = `DocEase Clinic | Booking Confirmed (${formattedId})`;
  }

  /**
   * Format YYYY-MM-DD to friendly string like "Dec 5, 2026"
   */
  function formatDateNice(dateString) {
    if (!dateString) return "Scheduled Date";
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const monthIndex = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const months = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return `${months[monthIndex]} ${day}, ${year}`;
      }
    } catch (e) {}
    return dateString;
  }
})();
