/* ==========================================================================
   Harborview Health — Shared UI Utilities
   Toast notifications, Accessible Modal, Header Shell, Validation Helpers.
   ========================================================================== */

(function (global) {
  'use strict';

  var Icons = {
    eyeOpen:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeClosed:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    close:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    checkCircle:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
    circle:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getInitials(fullName) {
    var parts = String(fullName || 'Patient')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return 'PT';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDateReadable(isoDate) {
    if (!isoDate) return 'Not provided';
    var parts = isoDate.split('-');
    if (parts.length === 3) {
      var year = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10) - 1;
      var day = parseInt(parts[2], 10);
      var d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
    var fallback = new Date(isoDate);
    if (isNaN(fallback.getTime())) return isoDate;
    return fallback.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatTimestamp(isoString) {
    if (!isoString) return '';
    var d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  /* ------------------------------------------------------------------------
     Validation Helpers
     ------------------------------------------------------------------------ */
  var Validators = {
    isValidEmail: function (email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
    },
    isValidPhone: function (phone) {
      var digits = String(phone || '').replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    },
    checkPasswordRules: function (password) {
      var val = String(password || '');
      return {
        length: val.length >= 8,
        upper: /[A-Z]/.test(val),
        lower: /[a-z]/.test(val),
        number: /\d/.test(val)
      };
    },
    isStrongPassword: function (password) {
      var r = Validators.checkPasswordRules(password);
      return r.length && r.upper && r.lower && r.number;
    }
  };

  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    if (message) {
      inputEl.classList.add('is-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
      errorEl.classList.add('is-visible');
    } else {
      inputEl.classList.remove('is-invalid');
      inputEl.removeAttribute('aria-invalid');
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
  }

  function bindPasswordToggles(root) {
    var container = root || document;
    var toggles = container.querySelectorAll('[data-toggle-password]');
    toggles.forEach(function (btn) {
      if (btn.dataset.bound === 'true') return;
      btn.dataset.bound = 'true';
      btn.innerHTML = Icons.eyeOpen;
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-toggle-password');
        var input = document.getElementById(targetId);
        if (!input) return;
        var isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
        btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        btn.innerHTML = isHidden ? Icons.eyeClosed : Icons.eyeOpen;
      });
    });
  }

  /* ------------------------------------------------------------------------
     Toast Notification Manager
     ------------------------------------------------------------------------ */
  var Toast = {
    ensureRegion: function () {
      var region = document.getElementById('toast-region');
      if (!region) {
        region = document.createElement('div');
        region.id = 'toast-region';
        region.className = 'toast-region';
        region.setAttribute('aria-live', 'polite');
        region.setAttribute('aria-atomic', 'false');
        document.body.appendChild(region);
      }
      return region;
    },
    show: function (title, message, tone, durationMs) {
      var region = Toast.ensureRegion();
      var toast = document.createElement('div');
      var typeClass = tone === 'error' ? 'toast--error' : tone === 'info' ? 'toast--info' : 'toast--success';
      toast.className = 'toast ' + typeClass;
      toast.setAttribute('role', 'status');

      toast.innerHTML =
        '<div class="toast-body">' +
        (title ? '<span class="toast-title">' + escapeHtml(title) + '</span>' : '') +
        '<span>' + escapeHtml(message || '') + '</span>' +
        '</div>' +
        '<button type="button" class="toast-close" aria-label="Dismiss notification">' +
        Icons.close +
        '</button>';

      var closeBtn = toast.querySelector('.toast-close');
      var removed = false;
      function removeToast() {
        if (removed) return;
        removed = true;
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }

      closeBtn.addEventListener('click', removeToast);
      region.appendChild(toast);

      global.setTimeout(removeToast, durationMs || 4500);
    }
  };

  /* ------------------------------------------------------------------------
     Accessible Modal Controller
     ------------------------------------------------------------------------ */
  var Modal = {
    lastTrigger: null,
    init: function () {
      if (document.getElementById('app-modal-backdrop')) return;
      var backdrop = document.createElement('div');
      backdrop.id = 'app-modal-backdrop';
      backdrop.className = 'modal-backdrop';
      backdrop.hidden = true;
      backdrop.innerHTML =
        '<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">' +
        '  <div class="modal-header">' +
        '    <h2 class="modal-title" id="app-modal-title"></h2>' +
        '    <button type="button" class="modal-close" id="app-modal-close" aria-label="Close dialog">' +
        Icons.close +
        '    </button>' +
        '  </div>' +
        '  <div id="app-modal-body"></div>' +
        '</div>';
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) Modal.close();
      });

      document.getElementById('app-modal-close').addEventListener('click', function () {
        Modal.close();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !backdrop.hidden) {
          Modal.close();
        }
      });
    },
    open: function (title, htmlContent, onMount) {
      Modal.init();
      Modal.lastTrigger = document.activeElement;
      var backdrop = document.getElementById('app-modal-backdrop');
      var titleEl = document.getElementById('app-modal-title');
      var bodyEl = document.getElementById('app-modal-body');

      titleEl.textContent = title;
      bodyEl.innerHTML = htmlContent;
      backdrop.hidden = false;
      bindPasswordToggles(bodyEl);

      if (typeof onMount === 'function') {
        onMount(bodyEl);
      }

      var firstFocusable = bodyEl.querySelector('input, select, textarea, button, a[href]');
      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        document.getElementById('app-modal-close').focus();
      }
    },
    close: function () {
      var backdrop = document.getElementById('app-modal-backdrop');
      if (!backdrop || backdrop.hidden) return;
      backdrop.hidden = true;
      if (Modal.lastTrigger && typeof Modal.lastTrigger.focus === 'function') {
        Modal.lastTrigger.focus();
      }
    }
  };

  /* ------------------------------------------------------------------------
     Authenticated App Shell (Header, Profile Menu, Mobile Drawer, Logout)
     ------------------------------------------------------------------------ */
  var AppShell = {
    requireAuth: function () {
      var session = global.PatientStore.getSession();
      if (!session) {
        global.PatientStore.setFlash(
          'Sign in required',
          'Please sign in to access your patient portal.',
          'info'
        );
        global.location.href = 'index.html';
        return null;
      }
      return session;
    },
    syncUserDisplay: function (session) {
      if (!session) return;
      var initials = getInitials(session.fullName);
      var avatarEls = document.querySelectorAll('[data-user-avatar]');
      avatarEls.forEach(function (el) {
        el.textContent = initials;
      });
      var nameEls = document.querySelectorAll('[data-user-name]');
      nameEls.forEach(function (el) {
        el.textContent = session.fullName;
      });
      var idEls = document.querySelectorAll('[data-user-id]');
      idEls.forEach(function (el) {
        el.textContent = session.patientId;
      });
    },
    init: function () {
      var session = AppShell.requireAuth();
      if (!session) return null;

      AppShell.syncUserDisplay(session);

      // Flash message from previous navigation
      var flash = global.PatientStore.consumeFlash();
      if (flash) {
        Toast.show(flash.title, flash.message, flash.tone);
      }

      // Profile dropdown toggle
      var menuTrigger = document.getElementById('profile-menu-trigger');
      var menuPanel = document.getElementById('profile-menu-panel');
      if (menuTrigger && menuPanel) {
        menuTrigger.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = !menuPanel.hidden;
          menuPanel.hidden = isOpen;
          menuTrigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        document.addEventListener('click', function (e) {
          if (!menuPanel.hidden && !menuPanel.contains(e.target) && e.target !== menuTrigger) {
            menuPanel.hidden = true;
            menuTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && !menuPanel.hidden) {
            menuPanel.hidden = true;
            menuTrigger.setAttribute('aria-expanded', 'false');
            menuTrigger.focus();
          }
        });
      }

      // Mobile nav drawer
      var mobileBtn = document.getElementById('mobile-menu-btn');
      var mobileDrawer = document.getElementById('mobile-drawer');
      if (mobileBtn && mobileDrawer) {
        mobileBtn.addEventListener('click', function () {
          var isOpen = mobileDrawer.classList.toggle('is-open');
          mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      // Logout buttons (header, dropdown, mobile drawer)
      var logoutBtns = document.querySelectorAll('[data-action="logout"]');
      logoutBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          global.PatientStore.logout();
          global.PatientStore.setFlash(
            'Signed out',
            'You have safely signed out of your patient portal session.',
            'info'
          );
          global.location.href = 'index.html';
        });
      });

      return session;
    }
  };

  global.PatientUI = {
    Icons: Icons,
    escapeHtml: escapeHtml,
    getInitials: getInitials,
    formatDateReadable: formatDateReadable,
    formatTimestamp: formatTimestamp,
    Validators: Validators,
    setFieldError: setFieldError,
    bindPasswordToggles: bindPasswordToggles,
    Toast: Toast,
    Modal: Modal,
    AppShell: AppShell
  };
})(window);
