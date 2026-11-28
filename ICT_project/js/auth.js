/* ==========================================================================
   Harborview Health — Page 1 Controller (Login / Sign Up)
   Handles smooth mode switching, inline validation, password rules,
   show/hide toggles, demo account access, and simulated auth flows.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var Store = window.PatientStore;
    var UI = window.PatientUI;

    Store.ensureSeeded();
    UI.bindPasswordToggles(document);

    // Show flash toast if redirected from logout or protected page
    var flash = Store.consumeFlash();
    if (flash) {
      UI.Toast.show(flash.title, flash.message, flash.tone);
    }

    // Check if an active session already exists
    var existingSession = Store.getSession();
    var sessionBanner = document.getElementById('existing-session-banner');
    if (existingSession && sessionBanner) {
      document.getElementById('existing-session-name').textContent = existingSession.fullName;
      sessionBanner.hidden = false;
      document.getElementById('existing-session-logout').addEventListener('click', function () {
        Store.logout();
        sessionBanner.hidden = true;
        UI.Toast.show('Signed out', 'Previous session cleared. You can now sign in or register.', 'info');
      });
    }

    // Tab & Panel Elements
    var tabLogin = document.getElementById('tab-login');
    var tabSignup = document.getElementById('tab-signup');
    var panelLogin = document.getElementById('panel-login');
    var panelSignup = document.getElementById('panel-signup');
    var feedbackBanner = document.getElementById('auth-feedback');

    function showFeedback(type, message) {
      feedbackBanner.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
      feedbackBanner.textContent = message;
      feedbackBanner.hidden = false;
    }

    function clearFeedback() {
      feedbackBanner.hidden = true;
      feedbackBanner.textContent = '';
    }

    function switchMode(mode) {
      clearFeedback();
      var isLogin = mode === 'login';

      tabLogin.classList.toggle('is-active', isLogin);
      tabLogin.setAttribute('aria-selected', isLogin ? 'true' : 'false');
      tabSignup.classList.toggle('is-active', !isLogin);
      tabSignup.setAttribute('aria-selected', !isLogin ? 'true' : 'false');

      panelLogin.hidden = !isLogin;
      panelSignup.hidden = isLogin;

      var targetInput = isLogin
        ? document.getElementById('login-email')
        : document.getElementById('signup-name');
      if (targetInput) targetInput.focus();
    }

    tabLogin.addEventListener('click', function () {
      switchMode('login');
    });
    tabSignup.addEventListener('click', function () {
      switchMode('signup');
    });
    document.getElementById('switch-to-signup').addEventListener('click', function () {
      switchMode('signup');
    });
    document.getElementById('switch-to-login').addEventListener('click', function () {
      switchMode('login');
    });

    // Support URL hash #signup if linked directly
    if (window.location.hash === '#signup') {
      switchMode('signup');
    }

    // ----------------------------------------------------------------------
    // Login Form Logic
    // ----------------------------------------------------------------------
    var loginForm = document.getElementById('login-form');
    var loginEmail = document.getElementById('login-email');
    var loginPassword = document.getElementById('login-password');
    var loginRemember = document.getElementById('login-remember');
    var loginEmailErr = document.getElementById('login-email-error');
    var loginPasswordErr = document.getElementById('login-password-error');

    // Pre-fill remembered email
    var rememberedEmail = Store.getRememberedEmail();
    if (rememberedEmail) {
      loginEmail.value = rememberedEmail;
      loginRemember.checked = true;
    }

    function validateLoginEmail() {
      var val = loginEmail.value.trim();
      if (!val) {
        UI.setFieldError(loginEmail, loginEmailErr, 'Please enter your email address.');
        return false;
      }
      if (!UI.Validators.isValidEmail(val)) {
        UI.setFieldError(loginEmail, loginEmailErr, 'Please enter a valid email address (e.g., name@example.com).');
        return false;
      }
      UI.setFieldError(loginEmail, loginEmailErr, '');
      return true;
    }

    function validateLoginPassword() {
      if (!loginPassword.value) {
        UI.setFieldError(loginPassword, loginPasswordErr, 'Please enter your password.');
        return false;
      }
      UI.setFieldError(loginPassword, loginPasswordErr, '');
      return true;
    }

    loginEmail.addEventListener('blur', validateLoginEmail);
    loginEmail.addEventListener('input', function () {
      if (loginEmail.classList.contains('is-invalid')) validateLoginEmail();
    });
    loginPassword.addEventListener('blur', validateLoginPassword);
    loginPassword.addEventListener('input', function () {
      if (loginPassword.classList.contains('is-invalid')) validateLoginPassword();
    });

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFeedback();

      var emailOk = validateLoginEmail();
      var passOk = validateLoginPassword();
      if (!emailOk || !passOk) {
        var firstInvalid = !emailOk ? loginEmail : loginPassword;
        firstInvalid.focus();
        return;
      }

      var result = Store.login(loginEmail.value, loginPassword.value, loginRemember.checked);
      if (!result.ok) {
        showFeedback('error', result.error);
        loginPassword.focus();
        return;
      }

      showFeedback('success', 'Welcome back, ' + result.user.fullName + '! Opening your Patient Dashboard...');
      Store.setFlash('Signed in', 'Welcome back, ' + result.user.fullName + '.', 'success');
      window.setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 650);
    });

    // Quick Demo Account Login
    document.getElementById('demo-login-btn').addEventListener('click', function () {
      clearFeedback();
      var result = Store.loginDemo();
      if (result.ok) {
        loginEmail.value = Store.DEMO_CREDENTIALS.email;
        loginPassword.value = Store.DEMO_CREDENTIALS.password;
        loginRemember.checked = true;
        UI.setFieldError(loginEmail, loginEmailErr, '');
        UI.setFieldError(loginPassword, loginPasswordErr, '');
        showFeedback('success', 'Signed in with demo account (' + result.user.fullName + '). Opening Dashboard...');
        Store.setFlash('Demo Session Started', 'Signed in as ' + result.user.fullName + '.', 'success');
        window.setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 650);
      }
    });

    // Forgot Password Modal Demo
    document.getElementById('forgot-password-btn').addEventListener('click', function () {
      var prefill = UI.escapeHtml(loginEmail.value.trim());
      UI.Modal.open(
        'Reset Password (Prototype Demo)',
        '<p style="margin-top:0; color:var(--color-text-secondary);">Enter the email associated with your prototype account. In a real hospital portal, a secure reset link would be sent to your inbox.</p>' +
          '<form id="forgot-form" novalidate>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="forgot-email">Email address</label>' +
          '    <input id="forgot-email" type="email" class="form-control" value="' + prefill + '" placeholder="name@example.com" required />' +
          '    <div id="forgot-email-error" class="field-error" role="alert"></div>' +
          '  </div>' +
          '  <div class="modal-footer">' +
          '    <button type="button" class="btn btn-secondary" id="forgot-cancel">Cancel</button>' +
          '    <button type="submit" class="btn btn-primary">Send Reset Instructions</button>' +
          '  </div>' +
          '</form>',
        function (body) {
          var form = body.querySelector('#forgot-form');
          var emailInput = body.querySelector('#forgot-email');
          var emailErr = body.querySelector('#forgot-email-error');
          body.querySelector('#forgot-cancel').addEventListener('click', UI.Modal.close);

          form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            if (!UI.Validators.isValidEmail(emailInput.value)) {
              UI.setFieldError(emailInput, emailErr, 'Please enter a valid email address.');
              emailInput.focus();
              return;
            }
            UI.Modal.close();
            UI.Toast.show(
              'Reset Notice Sent (Demo)',
              'If an account exists for ' + emailInput.value.trim() + ', instructions would be sent. For instant access, try the Demo Account.',
              'info',
              6000
            );
          });
        }
      );
    });

    // ----------------------------------------------------------------------
    // Sign Up Form Logic
    // ----------------------------------------------------------------------
    var signupForm = document.getElementById('signup-form');
    var signupName = document.getElementById('signup-name');
    var signupEmail = document.getElementById('signup-email');
    var signupPhone = document.getElementById('signup-phone');
    var signupPassword = document.getElementById('signup-password');
    var signupConfirm = document.getElementById('signup-confirm');
    var signupTerms = document.getElementById('signup-terms');

    var signupNameErr = document.getElementById('signup-name-error');
    var signupEmailErr = document.getElementById('signup-email-error');
    var signupPhoneErr = document.getElementById('signup-phone-error');
    var signupPasswordErr = document.getElementById('signup-password-error');
    var signupConfirmErr = document.getElementById('signup-confirm-error');
    var signupTermsErr = document.getElementById('signup-terms-error');

    function updatePasswordRuleList() {
      var rules = UI.Validators.checkPasswordRules(signupPassword.value);
      var listItems = document.querySelectorAll('#password-requirements .password-rule');
      listItems.forEach(function (li) {
        var key = li.getAttribute('data-rule');
        var met = !!rules[key];
        li.classList.toggle('is-met', met);
        var iconSpan = li.querySelector('.rule-icon');
        if (iconSpan) {
          iconSpan.innerHTML = met ? UI.Icons.checkCircle : UI.Icons.circle;
        }
      });
    }
    updatePasswordRuleList();

    function validateSignupName() {
      var val = signupName.value.trim();
      if (!val) {
        UI.setFieldError(signupName, signupNameErr, 'Full name is required.');
        return false;
      }
      if (val.length < 2) {
        UI.setFieldError(signupName, signupNameErr, 'Please enter at least 2 characters.');
        return false;
      }
      UI.setFieldError(signupName, signupNameErr, '');
      return true;
    }

    function validateSignupEmail() {
      var val = signupEmail.value.trim();
      if (!val) {
        UI.setFieldError(signupEmail, signupEmailErr, 'Email address is required.');
        return false;
      }
      if (!UI.Validators.isValidEmail(val)) {
        UI.setFieldError(signupEmail, signupEmailErr, 'Please enter a valid email address.');
        return false;
      }
      UI.setFieldError(signupEmail, signupEmailErr, '');
      return true;
    }

    function validateSignupPhone() {
      var val = signupPhone.value.trim();
      if (!val) {
        UI.setFieldError(signupPhone, signupPhoneErr, 'Phone number is required.');
        return false;
      }
      if (!UI.Validators.isValidPhone(val)) {
        UI.setFieldError(signupPhone, signupPhoneErr, 'Please enter a valid phone number (7–15 digits).');
        return false;
      }
      UI.setFieldError(signupPhone, signupPhoneErr, '');
      return true;
    }

    function validateSignupPassword() {
      var val = signupPassword.value;
      if (!val) {
        UI.setFieldError(signupPassword, signupPasswordErr, 'Please create a password.');
        return false;
      }
      if (!UI.Validators.isStrongPassword(val)) {
        UI.setFieldError(
          signupPassword,
          signupPasswordErr,
          'Password must meet all four requirements listed above.'
        );
        return false;
      }
      UI.setFieldError(signupPassword, signupPasswordErr, '');
      return true;
    }

    function validateSignupConfirm() {
      var val = signupConfirm.value;
      if (!val) {
        UI.setFieldError(signupConfirm, signupConfirmErr, 'Please confirm your password.');
        return false;
      }
      if (val !== signupPassword.value) {
        UI.setFieldError(signupConfirm, signupConfirmErr, 'Passwords do not match.');
        return false;
      }
      UI.setFieldError(signupConfirm, signupConfirmErr, '');
      return true;
    }

    function validateSignupTerms() {
      if (!signupTerms.checked) {
        signupTermsErr.textContent = 'Please agree to the prototype Terms of Use and Privacy Notice.';
        signupTermsErr.classList.add('is-visible');
        return false;
      }
      signupTermsErr.textContent = '';
      signupTermsErr.classList.remove('is-visible');
      return true;
    }

    signupName.addEventListener('blur', validateSignupName);
    signupName.addEventListener('input', function () {
      if (signupName.classList.contains('is-invalid')) validateSignupName();
    });

    signupEmail.addEventListener('blur', validateSignupEmail);
    signupEmail.addEventListener('input', function () {
      if (signupEmail.classList.contains('is-invalid')) validateSignupEmail();
    });

    signupPhone.addEventListener('blur', validateSignupPhone);
    signupPhone.addEventListener('input', function () {
      if (signupPhone.classList.contains('is-invalid')) validateSignupPhone();
    });

    signupPassword.addEventListener('input', function () {
      updatePasswordRuleList();
      if (signupPassword.classList.contains('is-invalid')) validateSignupPassword();
      if (signupConfirm.value) validateSignupConfirm();
    });
    signupPassword.addEventListener('blur', validateSignupPassword);

    signupConfirm.addEventListener('input', function () {
      if (signupConfirm.value || signupConfirm.classList.contains('is-invalid')) {
        validateSignupConfirm();
      }
    });
    signupConfirm.addEventListener('blur', validateSignupConfirm);

    signupTerms.addEventListener('change', validateSignupTerms);

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFeedback();

      var checks = [
        { ok: validateSignupName(), el: signupName },
        { ok: validateSignupEmail(), el: signupEmail },
        { ok: validateSignupPhone(), el: signupPhone },
        { ok: validateSignupPassword(), el: signupPassword },
        { ok: validateSignupConfirm(), el: signupConfirm },
        { ok: validateSignupTerms(), el: signupTerms }
      ];

      var firstBad = null;
      for (var i = 0; i < checks.length; i++) {
        if (!checks[i].ok) {
          firstBad = checks[i].el;
          break;
        }
      }

      if (firstBad) {
        showFeedback('error', 'Please review the highlighted fields before creating your account.');
        firstBad.focus();
        return;
      }

      var result = Store.register({
        fullName: signupName.value,
        email: signupEmail.value,
        phone: signupPhone.value,
        password: signupPassword.value
      });

      if (!result.ok) {
        if (result.field === 'email') {
          UI.setFieldError(signupEmail, signupEmailErr, result.error);
          signupEmail.focus();
        }
        showFeedback('error', result.error);
        return;
      }

      showFeedback(
        'success',
        'Account created for ' + result.user.fullName + '! Taking you to your Patient Dashboard...'
      );
      Store.setFlash(
        'Account Created',
        'Welcome to Harborview Health, ' + result.user.fullName + '. Your patient profile is ready.',
        'success'
      );
      window.setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 700);
    });

    // Terms & Privacy Notice Modal
    document.getElementById('view-terms-btn').addEventListener('click', function () {
      UI.Modal.open(
        'Terms of Use & Privacy Notice (Prototype)',
        '<p style="margin-top:0;">Harborview Health Patient Portal is a <strong>simulated educational prototype</strong> created for a university group project.</p>' +
          '<ul style="padding-left:1.25rem; color:var(--color-text-secondary);">' +
          '  <li>All appointments, doctor profiles, and patient identifiers are fictional sample data.</li>' +
          '  <li>Information entered here is saved only in your current browser via <code>localStorage</code> and is not transmitted to any server.</li>' +
          '  <li>Do not enter real passwords, government IDs, or personal health records.</li>' +
          '</ul>' +
          '<div class="modal-footer">' +
          '  <button type="button" class="btn btn-primary" id="terms-close-btn">Understood</button>' +
          '</div>',
        function (body) {
          body.querySelector('#terms-close-btn').addEventListener('click', UI.Modal.close);
        }
      );
    });
  });
})();
