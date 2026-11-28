/* ==========================================================================
   Harborview Health — Page 2 Controller (Patient Dashboard)
   Renders personalized greeting, upcoming appointment cards, quick action
   workflows (Book, View All, Edit Profile, Contact Support), and activity.
   ========================================================================== */

(function () {
  'use strict';

  var SAMPLE_DOCTORS = [
    {
      doctorName: 'Dr. Emily Carter',
      specialization: 'General Medicine',
      department: 'Outpatient Clinic — Wing A, Room 108'
    },
    {
      doctorName: 'Dr. Michael Lee',
      specialization: 'Cardiology',
      department: 'Heart & Vascular Center — Floor 3'
    },
    {
      doctorName: 'Dr. Priya Nair',
      specialization: 'Dermatology',
      department: 'Specialty Care — Pavilion North'
    },
    {
      doctorName: 'Dr. Samuel Okafor',
      specialization: 'Ophthalmology',
      department: 'Vision Care Suite — Floor 2'
    }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    var Store = window.PatientStore;
    var UI = window.PatientUI;

    var session = UI.AppShell.init();
    if (!session) return;

    function getStatusBadgeClass(status) {
      if (status === 'Confirmed' || status === 'Completed') return 'badge-success';
      if (status === 'Pending Review') return 'badge-warning';
      return 'badge-info';
    }

    function renderWelcome() {
      var current = Store.getSession();
      if (!current) return;
      UI.AppShell.syncUserDisplay(current);

      var appointments = Store.getAppointments().filter(function (a) {
        return !a.isPast;
      });

      var subtitleEl = document.getElementById('welcome-subtitle');
      if (appointments.length > 0) {
        var next = appointments[0];
        subtitleEl.textContent =
          "Here's your health overview. Your next visit is with " +
          next.doctorName +
          ' (' +
          next.specialization +
          ') on ' +
          UI.formatDateReadable(next.date) +
          ' at ' +
          next.time +
          '.';
      } else {
        subtitleEl.textContent =
          "Here's your health overview. You have no upcoming appointments scheduled right now.";
      }

      var lastLoginEl = document.getElementById('welcome-last-login');
      if (lastLoginEl && current.lastLoginAt) {
        lastLoginEl.textContent = 'Session started: ' + UI.formatTimestamp(current.lastLoginAt);
      }
    }

    function openAppointmentDetails(appointment) {
      var badgeClass = getStatusBadgeClass(appointment.status);
      var cancelButtonHtml = !appointment.isPast
        ? '<button type="button" class="btn btn-danger-outline" id="modal-cancel-apt">Cancel Appointment (Demo)</button>'
        : '';

      UI.Modal.open(
        'Appointment Details',
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">' +
          '  <div>' +
          '    <h3 style="margin:0; font-size:1.05rem; color:var(--color-text);">' +
          UI.escapeHtml(appointment.doctorName) +
          '</h3>' +
          '    <p style="margin:2px 0 0; font-size:0.875rem; color:var(--color-text-secondary);">' +
          UI.escapeHtml(appointment.specialization) +
          ' • ' +
          UI.escapeHtml(appointment.type || 'Consultation') +
          '</p>' +
          '  </div>' +
          '  <span class="badge ' +
          badgeClass +
          '">' +
          UI.escapeHtml(appointment.status) +
          '</span>' +
          '</div>' +
          '<div class="detail-grid">' +
          '  <div><span class="meta-label">Date</span><span class="meta-value">' +
          UI.escapeHtml(UI.formatDateReadable(appointment.date)) +
          '</span></div>' +
          '  <div><span class="meta-label">Time</span><span class="meta-value">' +
          UI.escapeHtml(appointment.time) +
          '</span></div>' +
          '  <div style="grid-column:1 / -1;"><span class="meta-label">Department &amp; Location</span><span class="meta-value">' +
          UI.escapeHtml(appointment.department) +
          '</span></div>' +
          '  <div><span class="meta-label">Reference ID</span><span class="meta-value">' +
          UI.escapeHtml(appointment.id) +
          '</span></div>' +
          '</div>' +
          '<p style="margin:0; font-size:0.875rem; color:var(--color-text-secondary);"><strong>Visit instructions:</strong> ' +
          UI.escapeHtml(appointment.notes || 'Please arrive 15 minutes prior to your appointment.') +
          '</p>' +
          '<div class="modal-footer">' +
          cancelButtonHtml +
          '  <button type="button" class="btn btn-primary" id="modal-apt-close">Close</button>' +
          '</div>',
        function (body) {
          body.querySelector('#modal-apt-close').addEventListener('click', UI.Modal.close);
          var cancelBtn = body.querySelector('#modal-cancel-apt');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
              Store.cancelAppointment(appointment.id);
              UI.Modal.close();
              renderAll();
              UI.Toast.show(
                'Appointment Cancelled',
                'Removed ' + appointment.doctorName + ' (' + UI.formatDateReadable(appointment.date) + ') from your upcoming visits.',
                'info'
              );
            });
          }
        }
      );
    }

    function renderUpcomingAppointments() {
      var container = document.getElementById('upcoming-appointments-list');
      var upcoming = Store.getAppointments().filter(function (a) {
        return !a.isPast;
      });

      if (upcoming.length === 0) {
        container.innerHTML =
          '<div class="empty-state">' +
          '  <p class="empty-state-title">No upcoming appointments</p>' +
          '  <p class="empty-state-text">When you request a visit in the prototype, it will appear here with your clinic details.</p>' +
          '  <button type="button" class="btn btn-primary btn-sm" id="empty-book-btn">Book an Appointment</button>' +
          '</div>';
        container.querySelector('#empty-book-btn').addEventListener('click', openBookAppointmentModal);
        return;
      }

      container.innerHTML = upcoming
        .map(function (apt) {
          return (
            '<article class="appointment-card" aria-label="Appointment with ' +
            UI.escapeHtml(apt.doctorName) +
            '">' +
            '  <div class="appointment-top">' +
            '    <div>' +
            '      <h3 class="doctor-name">' +
            UI.escapeHtml(apt.doctorName) +
            '</h3>' +
            '      <p class="doctor-specialty">' +
            UI.escapeHtml(apt.specialization) +
            '</p>' +
            '    </div>' +
            '    <span class="badge ' +
            getStatusBadgeClass(apt.status) +
            '">' +
            UI.escapeHtml(apt.status) +
            '</span>' +
            '  </div>' +
            '  <div class="appointment-meta">' +
            '    <div><span class="meta-label">Date</span><span class="meta-value">' +
            UI.escapeHtml(UI.formatDateReadable(apt.date)) +
            '</span></div>' +
            '    <div><span class="meta-label">Time</span><span class="meta-value">' +
            UI.escapeHtml(apt.time) +
            '</span></div>' +
            '    <div><span class="meta-label">Department</span><span class="meta-value">' +
            UI.escapeHtml(apt.department) +
            '</span></div>' +
            '  </div>' +
            '  <div class="appointment-actions">' +
            '    <span style="font-size:var(--text-xs); color:var(--color-text-muted);">' +
            UI.escapeHtml(apt.type || 'Outpatient Visit') +
            '</span>' +
            '    <button type="button" class="btn btn-secondary btn-sm" data-view-apt="' +
            UI.escapeHtml(apt.id) +
            '">View details</button>' +
            '  </div>' +
            '</article>'
          );
        })
        .join('');

      container.querySelectorAll('[data-view-apt]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var id = btn.getAttribute('data-view-apt');
          var found = upcoming.filter(function (item) {
            return item.id === id;
          })[0];
          if (found) openAppointmentDetails(found);
        });
      });
    }

    function renderActivity() {
      var container = document.getElementById('recent-activity-container');
      var items = Store.getActivity();

      if (!items || items.length === 0) {
        container.innerHTML =
          '<div class="empty-state">' +
          '  <p class="empty-state-title">No recent activity yet</p>' +
          '  <p class="empty-state-text">Updates to your profile or appointments will appear in this timeline.</p>' +
          '</div>';
        return;
      }

      var visibleItems = items.slice(0, 7);
      container.innerHTML =
        '<ul class="timeline">' +
        visibleItems
          .map(function (item) {
            var dotClass = item.tone === 'success' ? 'timeline-dot timeline-dot--success' : 'timeline-dot';
            return (
              '<li class="timeline-item">' +
              '  <span class="' +
              dotClass +
              '" aria-hidden="true"></span>' +
              '  <p class="timeline-title">' +
              UI.escapeHtml(item.title) +
              '</p>' +
              (item.detail
                ? '<p class="timeline-detail">' + UI.escapeHtml(item.detail) + '</p>'
                : '') +
              '  <time class="timeline-time">' +
              UI.escapeHtml(UI.formatTimestamp(item.timestamp)) +
              '</time>' +
              '</li>'
            );
          })
          .join('') +
        '</ul>';
    }

    function openBookAppointmentModal() {
      var doctorOptions = SAMPLE_DOCTORS.map(function (doc, idx) {
        return (
          '<option value="' +
          idx +
          '">' +
          UI.escapeHtml(doc.doctorName + ' — ' + doc.specialization) +
          '</option>'
        );
      }).join('');

      UI.Modal.open(
        'Book an Appointment (Prototype Demo)',
        '<p style="margin-top:0; color:var(--color-text-secondary); font-size:0.875rem;">Request a sample visit below. In the full group project, this action connects to the Scheduling module.</p>' +
          '<form id="book-apt-form" novalidate>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="book-doctor">Doctor &amp; Specialty</label>' +
          '    <select id="book-doctor" class="form-control">' +
          doctorOptions +
          '</select>' +
          '  </div>' +
          '  <div class="form-grid-2">' +
          '    <div class="form-group">' +
          '      <label class="form-label" for="book-date">Preferred date <span class="required-mark">*</span></label>' +
          '      <input id="book-date" type="date" class="form-control" value="2026-12-22" required />' +
          '      <div id="book-date-error" class="field-error" role="alert"></div>' +
          '    </div>' +
          '    <div class="form-group">' +
          '      <label class="form-label" for="book-time">Preferred time</label>' +
          '      <select id="book-time" class="form-control">' +
          '        <option value="09:30 AM">09:30 AM</option>' +
          '        <option value="11:00 AM">11:00 AM</option>' +
          '        <option value="01:45 PM">01:45 PM</option>' +
          '        <option value="03:15 PM">03:15 PM</option>' +
          '      </select>' +
          '    </div>' +
          '  </div>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="book-reason">Visit type</label>' +
          '    <select id="book-reason" class="form-control">' +
          '      <option value="Routine Consultation">Routine Consultation</option>' +
          '      <option value="Follow-Up Visit">Follow-Up Visit</option>' +
          '      <option value="Annual Wellness Check">Annual Wellness Check</option>' +
          '    </select>' +
          '  </div>' +
          '  <div class="modal-footer">' +
          '    <button type="button" class="btn btn-secondary" id="book-cancel">Cancel</button>' +
          '    <button type="submit" class="btn btn-primary">Submit Request</button>' +
          '  </div>' +
          '</form>',
        function (body) {
          body.querySelector('#book-cancel').addEventListener('click', UI.Modal.close);
          var form = body.querySelector('#book-apt-form');
          var dateInput = body.querySelector('#book-date');
          var dateErr = body.querySelector('#book-date-error');

          form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            if (!dateInput.value) {
              UI.setFieldError(dateInput, dateErr, 'Please select a preferred date.');
              dateInput.focus();
              return;
            }
            UI.setFieldError(dateInput, dateErr, '');

            var docIdx = parseInt(body.querySelector('#book-doctor').value, 10) || 0;
            var doc = SAMPLE_DOCTORS[docIdx];
            var created = Store.bookAppointment({
              doctorName: doc.doctorName,
              specialization: doc.specialization,
              department: doc.department,
              date: dateInput.value,
              time: body.querySelector('#book-time').value,
              reason: body.querySelector('#book-reason').value
            });

            UI.Modal.close();
            renderAll();
            UI.Toast.show(
              'Appointment Requested',
              'Added sample visit with ' + created.doctorName + ' on ' + UI.formatDateReadable(created.date) + '.',
              'success'
            );
          });
        }
      );
    }

    function openAllAppointmentsModal() {
      var all = Store.getAppointments();

      function buildListHtml(filter) {
        var filtered = all.filter(function (apt) {
          if (filter === 'upcoming') return !apt.isPast;
          if (filter === 'past') return !!apt.isPast;
          return true;
        });

        if (filtered.length === 0) {
          return '<p style="color:var(--color-text-muted); padding:1rem 0;">No appointments match this filter.</p>';
        }

        return (
          '<div class="appointment-list">' +
          filtered
            .map(function (apt) {
              return (
                '<div class="appointment-card" style="padding:1rem;">' +
                '  <div class="appointment-top" style="margin-bottom:8px;">' +
                '    <div>' +
                '      <p class="doctor-name">' +
                UI.escapeHtml(apt.doctorName) +
                '</p>' +
                '      <p class="doctor-specialty">' +
                UI.escapeHtml(apt.specialization) +
                ' • ' +
                UI.escapeHtml(UI.formatDateReadable(apt.date)) +
                ' at ' +
                UI.escapeHtml(apt.time) +
                '</p>' +
                '    </div>' +
                '    <span class="badge ' +
                getStatusBadgeClass(apt.status) +
                '">' +
                UI.escapeHtml(apt.status) +
                '</span>' +
                '  </div>' +
                '  <div class="appointment-actions">' +
                '    <span style="font-size:var(--text-xs); color:var(--color-text-muted);">' +
                UI.escapeHtml(apt.department) +
                '</span>' +
                '    <button type="button" class="btn btn-secondary btn-sm" data-modal-apt="' +
                UI.escapeHtml(apt.id) +
                '">Details</button>' +
                '  </div>' +
                '</div>'
              );
            })
            .join('') +
          '</div>'
        );
      }

      UI.Modal.open(
        'My Appointments (Sample Records)',
        '<div class="filter-tabs" role="group" aria-label="Filter appointments">' +
          '  <button type="button" class="filter-tab is-active" data-filter="all">All (' +
          all.length +
          ')</button>' +
          '  <button type="button" class="filter-tab" data-filter="upcoming">Upcoming</button>' +
          '  <button type="button" class="filter-tab" data-filter="past">Past</button>' +
          '</div>' +
          '<div id="modal-apt-list">' +
          buildListHtml('all') +
          '</div>' +
          '<div class="modal-footer">' +
          '  <button type="button" class="btn btn-secondary" id="all-apt-book">Book New Visit</button>' +
          '  <button type="button" class="btn btn-primary" id="all-apt-close">Done</button>' +
          '</div>',
        function (body) {
          var listHost = body.querySelector('#modal-apt-list');

          function bindDetailButtons() {
            listHost.querySelectorAll('[data-modal-apt]').forEach(function (btn) {
              btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-modal-apt');
                var match = all.filter(function (a) {
                  return a.id === id;
                })[0];
                if (match) openAppointmentDetails(match);
              });
            });
          }

          bindDetailButtons();

          body.querySelectorAll('.filter-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
              body.querySelectorAll('.filter-tab').forEach(function (t) {
                t.classList.remove('is-active');
              });
              tab.classList.add('is-active');
              listHost.innerHTML = buildListHtml(tab.getAttribute('data-filter'));
              bindDetailButtons();
            });
          });

          body.querySelector('#all-apt-close').addEventListener('click', UI.Modal.close);
          body.querySelector('#all-apt-book').addEventListener('click', openBookAppointmentModal);
        }
      );
    }

    function openContactSupportModal() {
      UI.Modal.open(
        'Contact Patient Support (Prototype Demo)',
        '<div class="alert alert-info" style="margin-bottom:1rem;">' +
          '  <div><strong>Non-Urgent Assistance Only:</strong> For medical emergencies, always call your local emergency number immediately.</div>' +
          '</div>' +
          '<p style="margin-top:0; font-size:0.875rem; color:var(--color-text-secondary);">Sample Helpline: (555) 019-2830 • Mon–Fri, 8:00 AM – 6:00 PM</p>' +
          '<form id="support-form" novalidate>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="support-topic">Topic</label>' +
          '    <select id="support-topic" class="form-control">' +
          '      <option value="Account or Sign-In Help">Account or Sign-In Help</option>' +
          '      <option value="Appointment Scheduling Question">Appointment Scheduling Question</option>' +
          '      <option value="Updating Contact Information">Updating Contact Information</option>' +
          '    </select>' +
          '  </div>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="support-message">Your message <span class="required-mark">*</span></label>' +
          '    <textarea id="support-message" class="form-control" placeholder="Describe how our patient desk can assist you..." required></textarea>' +
          '    <div id="support-message-error" class="field-error" role="alert"></div>' +
          '  </div>' +
          '  <div class="modal-footer">' +
          '    <button type="button" class="btn btn-secondary" id="support-cancel">Cancel</button>' +
          '    <button type="submit" class="btn btn-primary">Send Message (Demo)</button>' +
          '  </div>' +
          '</form>',
        function (body) {
          body.querySelector('#support-cancel').addEventListener('click', UI.Modal.close);
          var form = body.querySelector('#support-form');
          var msg = body.querySelector('#support-message');
          var msgErr = body.querySelector('#support-message-error');

          form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            if (!msg.value.trim()) {
              UI.setFieldError(msg, msgErr, 'Please enter a brief message before sending.');
              msg.focus();
              return;
            }
            UI.setFieldError(msg, msgErr, '');
            var topic = body.querySelector('#support-topic').value;
            Store.addActivity('Support inquiry sent (Demo)', 'Topic: ' + topic, 'info');
            UI.Modal.close();
            renderActivity();
            UI.Toast.show(
              'Support Message Sent (Demo)',
              'Your inquiry about "' + topic + '" was recorded in this prototype session.',
              'success'
            );
          });
        }
      );
    }

    function renderAll() {
      renderWelcome();
      renderUpcomingAppointments();
      renderActivity();
    }

    renderAll();

    // Wire Quick Actions & Navigation triggers
    document.getElementById('action-book-appointment').addEventListener('click', openBookAppointmentModal);
    document.getElementById('action-view-appointments').addEventListener('click', openAllAppointmentsModal);
    document.getElementById('view-all-link').addEventListener('click', openAllAppointmentsModal);
    document.getElementById('nav-appointments-btn').addEventListener('click', openAllAppointmentsModal);
    document.getElementById('mobile-appointments-btn').addEventListener('click', function () {
      var drawer = document.getElementById('mobile-drawer');
      if (drawer) drawer.classList.remove('is-open');
      openAllAppointmentsModal();
    });
    document.getElementById('action-contact-support').addEventListener('click', openContactSupportModal);

    if (window.location.hash === '#appointments') {
      openAllAppointmentsModal();
    }
  });
})();
