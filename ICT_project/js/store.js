/* ==========================================================================
   HealthCare+ — PatientStore (Simulated Prototype Persistence)
   Uses localStorage to simulate accounts, sessions, appointments, and activity.
   NOTE: Prototype only — do not use for real authentication or real patient data.
   ========================================================================== */

(function (global) {
  'use strict';

  var STORAGE_KEYS = {
    USERS: 'hc_prototype_users_v2',
    SESSION: 'hc_prototype_session_v2',
    REMEMBER_EMAIL: 'hc_prototype_remember_email_v2',
    FLASH: 'hc_prototype_flash_v2'
  };

  var DEMO_CREDENTIALS = {
    email: 'sarah.johnson@email.com',
    password: 'CarePortal2026!'
  };

  function createSeedAppointments() {
    return [
      {
        id: 'APT-2041',
        doctorName: 'Dr. Emily Carter',
        specialization: 'General Medicine',
        department: 'Outpatient Clinic — Wing A, Room 108',
        date: '2026-12-03',
        time: '10:30 AM',
        status: 'Confirmed',
        type: 'General Check-Up',
        notes: 'Please arrive 15 minutes early with a photo ID. Non-urgent routine check-in.',
        isPast: false
      },
      {
        id: 'APT-2068',
        doctorName: 'Dr. Michael Lee',
        specialization: 'Cardiology',
        department: 'Heart & Vascular Center — Floor 3',
        date: '2026-12-10',
        time: '2:00 PM',
        status: 'Upcoming',
        type: 'Cardiology Consultation',
        notes: 'Check in at Desk 3A upon arrival. Bring any updated question list for the doctor.',
        isPast: false
      },
      {
        id: 'APT-1922',
        doctorName: 'Dr. Emily Carter',
        specialization: 'General Medicine',
        department: 'Outpatient Clinic — Wing A, Room 108',
        date: '2026-10-14',
        time: '11:00 AM',
        status: 'Completed',
        type: 'Annual Wellness Visit',
        notes: 'Routine visit completed.',
        isPast: true
      }
    ];
  }

  function createSeedActivity() {
    return [
      {
        id: 'ACT-101',
        title: 'Appointment booked with Dr. Emily Carter',
        detail: 'General Medicine visit scheduled for Dec 3, 2026 at 10:30 AM.',
        timestamp: '2026-11-25T09:40:00',
        tone: 'success'
      },
      {
        id: 'ACT-102',
        title: 'Appointment confirmed with Dr. Michael Lee',
        detail: 'Cardiology consultation scheduled for Dec 10, 2026 at 2:00 PM.',
        timestamp: '2026-11-22T14:15:00',
        tone: 'info'
      },
      {
        id: 'ACT-103',
        title: 'Contact details reviewed',
        detail: 'Mailing address and phone number verified in My Profile.',
        timestamp: '2026-11-18T11:05:00',
        tone: 'info'
      }
    ];
  }

  function createDemoUser() {
    return {
      patientId: 'HC-2025041',
      fullName: 'Sarah Johnson',
      email: DEMO_CREDENTIALS.email,
      phone: '+1 (555) 123-4567',
      dateOfBirth: '1990-01-15',
      gender: 'Female',
      address: '123 Health Ave, New York, NY 10001',
      password: DEMO_CREDENTIALS.password,
      createdAt: '2026-09-10T08:30:00',
      lastLoginAt: '2026-11-27T09:15:00',
      appointments: createSeedAppointments(),
      activity: createSeedActivity()
    };
  }

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function readUsers() {
    var users = safeParse(global.localStorage.getItem(STORAGE_KEYS.USERS), null);
    if (!Array.isArray(users) || users.length === 0) {
      users = [createDemoUser()];
      writeUsers(users);
    }
    return users;
  }

  function writeUsers(users) {
    global.localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  function generatePatientId() {
    var num = Math.floor(1000000 + Math.random() * 9000000);
    return 'HC-' + num;
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function sanitizeSessionUser(user) {
    return {
      patientId: user.patientId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      address: user.address || '',
      lastLoginAt: user.lastLoginAt || new Date().toISOString()
    };
  }

  function ensureSeeded() {
    readUsers();
  }

  function getSession() {
    ensureSeeded();
    var session = safeParse(global.localStorage.getItem(STORAGE_KEYS.SESSION), null);
    if (!session || !session.email) return null;
    return session;
  }

  function getCurrentUserRecord() {
    var session = getSession();
    if (!session) return null;
    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].patientId === session.patientId || users[i].email.toLowerCase() === session.email.toLowerCase()) {
        return users[i];
      }
    }
    return null;
  }

  function updateUserRecord(mutator) {
    var session = getSession();
    if (!session) return null;
    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].patientId === session.patientId || users[i].email.toLowerCase() === session.email.toLowerCase()) {
        var updated = mutator(clone(users[i]));
        users[i] = updated;
        writeUsers(users);
        global.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sanitizeSessionUser(updated)));
        return clone(updated);
      }
    }
    return null;
  }

  function register(payload) {
    var users = readUsers();
    var normalizedEmail = (payload.email || '').trim().toLowerCase();

    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === normalizedEmail) {
        return {
          ok: false,
          field: 'email',
          error: 'An account with this email address already exists. Please sign in instead.'
        };
      }
    }

    var nowIso = new Date().toISOString();
    var newUser = {
      patientId: generatePatientId(),
      fullName: (payload.fullName || '').trim(),
      email: normalizedEmail,
      phone: (payload.phone || '').trim(),
      dateOfBirth: '',
      gender: '',
      address: '',
      password: payload.password,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      appointments: [
        {
          id: 'APT-' + Math.floor(2100 + Math.random() * 800),
          doctorName: 'Dr. Emily Carter',
          specialization: 'General Medicine',
          department: 'Outpatient Clinic — Wing A, Room 108',
          date: '2026-12-09',
          time: '11:00 AM',
          status: 'Upcoming',
          type: 'New Patient Welcome Visit',
          notes: 'Starter sample appointment created for this prototype account.',
          isPast: false
        }
      ],
      activity: [
        {
          id: 'ACT-' + Date.now(),
          title: 'Patient portal account created',
          detail: 'Registered as ' + (payload.fullName || '').trim() + ' (Prototype Account).',
          timestamp: nowIso,
          tone: 'success'
        }
      ]
    };

    users.push(newUser);
    writeUsers(users);
    global.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sanitizeSessionUser(newUser)));
    global.localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, normalizedEmail);

    return { ok: true, user: sanitizeSessionUser(newUser) };
  }

  function login(email, password, rememberMe) {
    var users = readUsers();
    var normalizedEmail = (email || '').trim().toLowerCase();
    var matched = null;

    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === normalizedEmail) {
        matched = users[i];
        break;
      }
    }

    if (!matched || matched.password !== password) {
      return {
        ok: false,
        error: 'The email or password you entered does not match our prototype records.'
      };
    }

    var nowIso = new Date().toISOString();
    matched.lastLoginAt = nowIso;
    if (!Array.isArray(matched.activity)) matched.activity = [];
    matched.activity.unshift({
      id: 'ACT-' + Date.now(),
      title: 'Signed in to patient portal',
      detail: 'Active session started on this browser.',
      timestamp: nowIso,
      tone: 'info'
    });
    matched.activity = matched.activity.slice(0, 15);

    writeUsers(users);
    global.localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sanitizeSessionUser(matched)));

    if (rememberMe) {
      global.localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, normalizedEmail);
    } else {
      global.localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
    }

    return { ok: true, user: sanitizeSessionUser(matched) };
  }

  function loginDemo() {
    ensureSeeded();
    return login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password, true);
  }

  function logout() {
    global.localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  function getRememberedEmail() {
    return global.localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL) || '';
  }

  function updateProfile(updates) {
    var nowIso = new Date().toISOString();
    var normalizedEmail = (updates.email || '').trim().toLowerCase();
    var session = getSession();
    if (!session) return { ok: false, error: 'Session expired. Please sign in again.' };

    var users = readUsers();
    for (var i = 0; i < users.length; i++) {
      if (
        users[i].email.toLowerCase() === normalizedEmail &&
        users[i].patientId !== session.patientId
      ) {
        return {
          ok: false,
          field: 'email',
          error: 'Another prototype account already uses this email address.'
        };
      }
    }

    var updated = updateUserRecord(function (user) {
      user.fullName = (updates.fullName || '').trim();
      user.dateOfBirth = updates.dateOfBirth || '';
      user.gender = updates.gender || '';
      user.email = normalizedEmail;
      user.phone = (updates.phone || '').trim();
      user.address = (updates.address || '').trim();

      if (!Array.isArray(user.activity)) user.activity = [];
      user.activity.unshift({
        id: 'ACT-' + Date.now(),
        title: 'Profile updated',
        detail: 'Personal and contact information saved.',
        timestamp: nowIso,
        tone: 'success'
      });
      user.activity = user.activity.slice(0, 15);
      return user;
    });

    if (!updated) {
      return { ok: false, error: 'Unable to locate your account record.' };
    }

    if (getRememberedEmail()) {
      global.localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, updated.email);
    }

    return { ok: true, user: sanitizeSessionUser(updated) };
  }

  function changePassword(currentPassword, newPassword) {
    var record = getCurrentUserRecord();
    if (!record) return { ok: false, error: 'Session expired. Please sign in again.' };
    if (record.password !== currentPassword) {
      return { ok: false, field: 'currentPassword', error: 'Current password is incorrect.' };
    }
    var nowIso = new Date().toISOString();
    updateUserRecord(function (user) {
      user.password = newPassword;
      if (!Array.isArray(user.activity)) user.activity = [];
      user.activity.unshift({
        id: 'ACT-' + Date.now(),
        title: 'Password updated',
        detail: 'Account password changed in prototype settings.',
        timestamp: nowIso,
        tone: 'success'
      });
      user.activity = user.activity.slice(0, 15);
      return user;
    });
    return { ok: true };
  }

  function getAppointments() {
    var record = getCurrentUserRecord();
    if (!record || !Array.isArray(record.appointments)) return [];
    return clone(record.appointments);
  }

  function bookAppointment(data) {
    var nowIso = new Date().toISOString();
    var newApt = {
      id: 'APT-' + Math.floor(2200 + Math.random() * 7500),
      doctorName: data.doctorName,
      specialization: data.specialization,
      department: data.department,
      date: data.date,
      time: data.time,
      status: 'Upcoming',
      type: data.reason || 'Consultation Request',
      notes: 'Requested via Patient Dashboard prototype. Scheduling confirmation is simulated.',
      isPast: false
    };

    updateUserRecord(function (user) {
      if (!Array.isArray(user.appointments)) user.appointments = [];
      user.appointments.unshift(newApt);
      if (!Array.isArray(user.activity)) user.activity = [];
      user.activity.unshift({
        id: 'ACT-' + Date.now(),
        title: 'Appointment booked with ' + newApt.doctorName,
        detail: newApt.specialization + ' on ' + newApt.date + ' at ' + newApt.time + '.',
        timestamp: nowIso,
        tone: 'success'
      });
      user.activity = user.activity.slice(0, 15);
      return user;
    });

    return clone(newApt);
  }

  function cancelAppointment(appointmentId) {
    var nowIso = new Date().toISOString();
    var cancelledItem = null;

    updateUserRecord(function (user) {
      if (!Array.isArray(user.appointments)) return user;
      user.appointments = user.appointments.filter(function (apt) {
        if (apt.id === appointmentId) {
          cancelledItem = apt;
          return false;
        }
        return true;
      });
      if (cancelledItem) {
        if (!Array.isArray(user.activity)) user.activity = [];
        user.activity.unshift({
          id: 'ACT-' + Date.now(),
          title: 'Appointment cancelled',
          detail: 'Cancelled visit with ' + cancelledItem.doctorName + ' (' + cancelledItem.date + ').',
          timestamp: nowIso,
          tone: 'info'
        });
        user.activity = user.activity.slice(0, 15);
      }
      return user;
    });

    return !!cancelledItem;
  }

  function getActivity() {
    var record = getCurrentUserRecord();
    if (!record || !Array.isArray(record.activity)) return [];
    return clone(record.activity);
  }

  function addActivity(title, detail, tone) {
    var nowIso = new Date().toISOString();
    updateUserRecord(function (user) {
      if (!Array.isArray(user.activity)) user.activity = [];
      user.activity.unshift({
        id: 'ACT-' + Date.now(),
        title: title,
        detail: detail || '',
        timestamp: nowIso,
        tone: tone || 'info'
      });
      user.activity = user.activity.slice(0, 15);
      return user;
    });
  }

  function setFlash(title, message, tone) {
    global.localStorage.setItem(
      STORAGE_KEYS.FLASH,
      JSON.stringify({ title: title, message: message, tone: tone || 'success' })
    );
  }

  function consumeFlash() {
    var flash = safeParse(global.localStorage.getItem(STORAGE_KEYS.FLASH), null);
    if (flash) {
      global.localStorage.removeItem(STORAGE_KEYS.FLASH);
    }
    return flash;
  }

  global.PatientStore = {
    DEMO_CREDENTIALS: clone(DEMO_CREDENTIALS),
    ensureSeeded: ensureSeeded,
    getSession: getSession,
    getCurrentPatient: getCurrentUserRecord,
    register: register,
    login: login,
    loginDemo: loginDemo,
    logout: logout,
    getRememberedEmail: getRememberedEmail,
    updateProfile: updateProfile,
    changePassword: changePassword,
    getAppointments: getAppointments,
    bookAppointment: bookAppointment,
    cancelAppointment: cancelAppointment,
    getActivity: getActivity,
    addActivity: addActivity,
    setFlash: setFlash,
    consumeFlash: consumeFlash
  };
})(window);
