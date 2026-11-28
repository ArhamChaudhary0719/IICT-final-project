/* ==========================================================================
   DocEase Clinic - Appointments Data, Storage, Search & Filter Logic
   Author: Muhammad Hammad (26i-3100) - Member 4
   ========================================================================== */

const STORAGE_KEY = "docease_appointments";

// Realistic sample appointments across all three status categories
const sampleAppointments = [
  {
    id: "APT-1001",
    doctorName: "Dr. Ayesha Khan",
    specialty: "General Physician",
    date: "2026-12-03",
    time: "10:30 AM",
    location: "Room 104, Main Clinic",
    reason: "Annual health checkup and blood pressure review",
    status: "upcoming"
  },
  {
    id: "APT-1002",
    doctorName: "Dr. Bilal Ahmed",
    specialty: "Cardiologist",
    date: "2026-12-08",
    time: "02:00 PM",
    location: "Room 208, Heart Care Wing",
    reason: "Follow-up ECG consultation",
    status: "upcoming"
  },
  {
    id: "APT-1003",
    doctorName: "Dr. Sara Malik",
    specialty: "Dermatologist",
    date: "2026-12-12",
    time: "11:15 AM",
    location: "Room 302, Skin Care Unit",
    reason: "Seasonal skin allergy evaluation",
    status: "upcoming"
  },
  {
    id: "APT-0994",
    doctorName: "Dr. Usman Tariq",
    specialty: "Orthopedic Specialist",
    date: "2026-11-14",
    time: "04:00 PM",
    location: "Room 112, Rehab Block",
    reason: "Knee pain assessment and X-ray review",
    status: "completed"
  },
  {
    id: "APT-0988",
    doctorName: "Dr. Hina Siddiqui",
    specialty: "ENT Specialist",
    date: "2026-10-25",
    time: "09:45 AM",
    location: "Room 201, Main Clinic",
    reason: "Sinus congestion and throat check",
    status: "completed"
  },
  {
    id: "APT-0979",
    doctorName: "Dr. Kamran Raza",
    specialty: "Dentist",
    date: "2026-11-05",
    time: "01:30 PM",
    location: "Room 109, Dental Suite",
    reason: "Routine dental scaling and cleaning",
    status: "cancelled"
  }
];

/* --------------------------------------------------------------------------
   localStorage Helpers
   -------------------------------------------------------------------------- */

/**
 * Saves an array of appointments to localStorage as JSON.
 */
function saveAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error("Could not save appointments to localStorage:", error);
  }
}

/**
 * Loads appointments from localStorage.
 * If none are saved yet, initializes storage with sampleAppointments.
 */
function loadAppointments() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }
  } catch (error) {
    console.error("Could not read appointments from localStorage:", error);
  }

  // First-time visit or empty storage: seed with realistic sample data
  const defaultList = sampleAppointments.slice();
  saveAppointments(defaultList);
  return defaultList;
}

/* --------------------------------------------------------------------------
   Simple Search & Filter Functions
   -------------------------------------------------------------------------- */

/**
 * Filters appointments by status ("all", "upcoming", "completed", "cancelled").
 */
function filterByStatus(appointments, status) {
  if (!status || status === "all") {
    return appointments;
  }
  return appointments.filter(function (appointment) {
    return appointment.status === status;
  });
}

/**
 * Searches appointments by doctor name, specialty, reason, date, location, or ID.
 */
function searchAppointments(appointments, query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return appointments;
  }

  return appointments.filter(function (appointment) {
    const searchableText = [
      appointment.id,
      appointment.doctorName,
      appointment.specialty,
      appointment.date,
      appointment.location,
      appointment.reason
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(cleanQuery);
  });
}

/**
 * Combines status filtering and keyword search.
 */
function getFilteredAppointments(appointments, status, query) {
  const statusMatches = filterByStatus(appointments, status);
  return searchAppointments(statusMatches, query);
}

/* --------------------------------------------------------------------------
   UI Rendering & Event Handling
   -------------------------------------------------------------------------- */

/**
 * Formats status text nicely (e.g., "upcoming" -> "Upcoming").
 */
function formatStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Creates a single appointment card DOM element.
 */
function createAppointmentCard(appointment) {
  const card = document.createElement("article");
  card.className = "appointment-card";

  // Top row: doctor info + status badge
  const cardTop = document.createElement("div");
  cardTop.className = "card-top";

  const doctorInfo = document.createElement("div");
  const doctorName = document.createElement("h2");
  doctorName.className = "doctor-name";
  doctorName.textContent = appointment.doctorName;

  const specialty = document.createElement("p");
  specialty.className = "doctor-specialty";
  specialty.textContent = appointment.specialty;

  doctorInfo.appendChild(doctorName);
  doctorInfo.appendChild(specialty);

  const badge = document.createElement("span");
  badge.className = "status-badge status-" + appointment.status;
  badge.textContent = formatStatusLabel(appointment.status);

  cardTop.appendChild(doctorInfo);
  cardTop.appendChild(badge);

  // Middle section: appointment details
  const detailsList = document.createElement("ul");
  detailsList.className = "card-details";

  const detailItems = [
    { label: "Booking ID", value: appointment.id },
    { label: "Date & Time", value: appointment.date + " at " + appointment.time },
    { label: "Location", value: appointment.location },
    { label: "Reason", value: appointment.reason }
  ];

  detailItems.forEach(function (item) {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = item.label + ": ";
    li.appendChild(strong);
    li.appendChild(document.createTextNode(item.value));
    detailsList.appendChild(li);
  });

  // Bottom row: Reschedule and Cancel links
  const actions = document.createElement("div");
  actions.className = "card-actions";

  if (appointment.status === "upcoming") {
    const rescheduleLink = document.createElement("a");
    rescheduleLink.href = "reschedule-appointment.html?id=" + encodeURIComponent(appointment.id);
    rescheduleLink.className = "action-link reschedule-link";
    rescheduleLink.textContent = "Reschedule";

    const cancelLink = document.createElement("a");
    cancelLink.href = "cancel-appointment.html?id=" + encodeURIComponent(appointment.id);
    cancelLink.className = "action-link cancel-link";
    cancelLink.textContent = "Cancel";

    actions.appendChild(rescheduleLink);
    actions.appendChild(cancelLink);
  } else if (appointment.status === "completed") {
    const note = document.createElement("span");
    note.className = "status-note";
    note.textContent = "Visit completed.";
    actions.appendChild(note);
  } else {
    const note = document.createElement("span");
    note.className = "status-note";
    note.textContent = "This appointment was cancelled.";
    actions.appendChild(note);
  }

  card.appendChild(cardTop);
  card.appendChild(detailsList);
  card.appendChild(actions);

  return card;
}

/**
 * Initializes the My Appointments page once the HTML document is ready.
 */
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const appointmentsList = document.getElementById("appointments-list");
  const emptyMessage = document.getElementById("empty-message");
  const resultsCount = document.getElementById("results-count");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  let allAppointments = loadAppointments();
  let currentStatus = "all";
  let currentQuery = "";

  // Mobile hamburger menu toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Render appointments matching current filter and search query
  function updateView() {
    if (!appointmentsList) {
      return;
    }

    const filtered = getFilteredAppointments(allAppointments, currentStatus, currentQuery);
    appointmentsList.innerHTML = "";

    const word = filtered.length === 1 ? "appointment" : "appointments";
    resultsCount.textContent = "Showing " + filtered.length + " " + word;

    if (filtered.length === 0) {
      appointmentsList.hidden = true;
      emptyMessage.hidden = false;
      return;
    }

    appointmentsList.hidden = false;
    emptyMessage.hidden = true;

    filtered.forEach(function (appointment) {
      const card = createAppointmentCard(appointment);
      appointmentsList.appendChild(card);
    });
  }

  // Filter tab click handlers
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentStatus = button.getAttribute("data-status") || "all";

      filterButtons.forEach(function (btn) {
        const isActive = btn === button;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });

      updateView();
    });
  });

  // Search box input handler
  if (searchInput) {
    searchInput.addEventListener("input", function (event) {
      currentQuery = event.target.value;
      updateView();
    });
  }

  // Reset filters button inside empty-state message
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", function () {
      currentStatus = "all";
      currentQuery = "";

      if (searchInput) {
        searchInput.value = "";
      }

      filterButtons.forEach(function (btn) {
        const isAll = btn.getAttribute("data-status") === "all";
        btn.classList.toggle("active", isAll);
        btn.setAttribute("aria-pressed", String(isAll));
      });

      updateView();
    });
  }

  // Initial render
  updateView();
});
