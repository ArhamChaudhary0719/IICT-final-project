/* ==========================================================================
   Harborview Health — Page 3 Controller (My Profile)
   Manages view/edit states, validation, Save persistence, Cancel rollback,
   and Change Password modal demo.
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var Store = window.PatientStore;
    var UI = window.PatientUI;

    var session = UI.AppShell.init();
    if (!session) return;

    var isEditing = false;
    var snapshot = null;

    var editBtn = document.getElementById('edit-profile-btn');
    var saveBtn = document.getElementById('save-profile-btn');
    var cancelBtn = document.getElementById('cancel-profile-btn');
    var actionsBar = document.getElementById('profile-actions-bar');
    var editBadge = document.getElementById('edit-mode-badge');
    var feedbackEl = document.getElementById('profile-feedback');
    var form = document.getElementById('profile-form');

    var fullNameInput = document.getElementById('profile-fullname');
    var dobInput = document.getElementById('profile-dob');
    var genderInput = document.getElementById('profile-gender');
    var emailInput = document.getElementById('profile-email');
    var phoneInput = document.getElementById('profile-phone');
    var addressInput = document.getElementById('profile-address');

    var fullNameErr = document.getElementById('profile-fullname-error');
    var emailErr = document.getElementById('profile-email-error');
    var phoneErr = document.getElementById('profile-phone-error');

    var editableFields = [
      fullNameInput,
      dobInput,
      genderInput,
      emailInput,
      phoneInput,
      addressInput
    ];

    function showFeedback(type, message) {
      feedbackEl.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
      feedbackEl.textContent = message;
      feedbackEl.hidden = false;
    }

    function clearFeedback() {
      feedbackEl.hidden = true;
      feedbackEl.textContent = '';
    }

    function clearErrors() {
      UI.setFieldError(fullNameInput, fullNameErr, '');
      UI.setFieldError(emailInput, emailErr, '');
      UI.setFieldError(phoneInput, phoneErr, '');
    }

    function populateFromSession(user) {
      fullNameInput.value = user.fullName || '';
      dobInput.value = user.dateOfBirth || '';
      genderInput.value = user.gender || '';
      emailInput.value = user.email || '';
      phoneInput.value = user.phone || '';
      addressInput.value = user.address || '';
      UI.AppShell.syncUserDisplay(user);
    }

    function captureSnapshot() {
      return {
        fullName: fullNameInput.value,
        dateOfBirth: dobInput.value,
        gender: genderInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        address: addressInput.value
      };
    }

    function setEditMode(active) {
      isEditing = active;
      editableFields.forEach(function (field) {
        field.disabled = !active;
      });
      actionsBar.hidden = !active;
      editBadge.hidden = !active;
      editBtn.hidden = active;

      if (active) {
        snapshot = captureSnapshot();
        clearFeedback();
        fullNameInput.focus();
      }
    }

    function validateName() {
      var val = fullNameInput.value.trim();
      if (!val) {
        UI.setFieldError(fullNameInput, fullNameErr, 'Full name is required.');
        return false;
      }
      if (val.length < 2) {
        UI.setFieldError(fullNameInput, fullNameErr, 'Please enter at least 2 characters.');
        return false;
      }
      UI.setFieldError(fullNameInput, fullNameErr, '');
      return true;
    }

    function validateEmail() {
      var val = emailInput.value.trim();
      if (!val) {
        UI.setFieldError(emailInput, emailErr, 'Email address is required.');
        return false;
      }
      if (!UI.Validators.isValidEmail(val)) {
        UI.setFieldError(emailInput, emailErr, 'Please enter a valid email address.');
        return false;
      }
      UI.setFieldError(emailInput, emailErr, '');
      return true;
    }

    function validatePhone() {
      var val = phoneInput.value.trim();
      if (!val) {
        UI.setFieldError(phoneInput, phoneErr, 'Phone number is required.');
        return false;
      }
      if (!UI.Validators.isValidPhone(val)) {
        UI.setFieldError(phoneInput, phoneErr, 'Please enter a valid phone number (7–15 digits).');
        return false;
      }
      UI.setFieldError(phoneInput, phoneErr, '');
      return true;
    }

    // Initial load
    populateFromSession(Store.getSession());
    setEditMode(false);

    // Live validation while editing
    fullNameInput.addEventListener('input', function () {
      if (fullNameInput.classList.contains('is-invalid')) validateName();
    });
    emailInput.addEventListener('input', function () {
      if (emailInput.classList.contains('is-invalid')) validateEmail();
    });
    phoneInput.addEventListener('input', function () {
      if (phoneInput.classList.contains('is-invalid')) validatePhone();
    });

    editBtn.addEventListener('click', function () {
      setEditMode(true);
    });

    cancelBtn.addEventListener('click', function () {
      if (snapshot) {
        fullNameInput.value = snapshot.fullName;
        dobInput.value = snapshot.dateOfBirth;
        genderInput.value = snapshot.gender;
        emailInput.value = snapshot.email;
        phoneInput.value = snapshot.phone;
        addressInput.value = snapshot.address;
      }
      clearErrors();
      clearFeedback();
      setEditMode(false);
      UI.Toast.show('Changes Discarded', 'Your previous profile information was restored.', 'info');
      editBtn.focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!isEditing) return;
      clearFeedback();

      var nameOk = validateName();
      var emailOk = validateEmail();
      var phoneOk = validatePhone();

      if (!nameOk || !emailOk || !phoneOk) {
        showFeedback('error', 'Please fix the highlighted fields before saving your profile.');
        var firstBad = !nameOk ? fullNameInput : !emailOk ? emailInput : phoneInput;
        firstBad.focus();
        return;
      }

      var result = Store.updateProfile({
        fullName: fullNameInput.value,
        dateOfBirth: dobInput.value,
        gender: genderInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        address: addressInput.value
      });

      if (!result.ok) {
        if (result.field === 'email') {
          UI.setFieldError(emailInput, emailErr, result.error);
          emailInput.focus();
        }
        showFeedback('error', result.error);
        return;
      }

      populateFromSession(result.user);
      clearErrors();
      setEditMode(false);
      showFeedback('success', 'Your profile details have been saved and updated across your portal.');
      UI.Toast.show('Profile Saved', 'Your personal and contact details are up to date.', 'success');
      editBtn.focus();
    });

    // Change Password Modal Demo
    document.getElementById('change-password-btn').addEventListener('click', function () {
      UI.Modal.open(
        'Change Password (Prototype Demo)',
        '<p style="margin-top:0; font-size:0.875rem; color:var(--color-text-secondary);">Update the simulated password for your local prototype account.</p>' +
          '<form id="change-pw-form" novalidate>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="pw-current">Current password <span class="required-mark">*</span></label>' +
          '    <div class="input-wrap">' +
          '      <input id="pw-current" type="password" class="form-control has-toggle" required />' +
          '      <button type="button" class="password-toggle" data-toggle-password="pw-current" aria-label="Show password" aria-pressed="false"></button>' +
          '    </div>' +
          '    <div id="pw-current-error" class="field-error" role="alert"></div>' +
          '  </div>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="pw-new">New password <span class="required-mark">*</span></label>' +
          '    <div class="input-wrap">' +
          '      <input id="pw-new" type="password" class="form-control has-toggle" required />' +
          '      <button type="button" class="password-toggle" data-toggle-password="pw-new" aria-label="Show password" aria-pressed="false"></button>' +
          '    </div>' +
          '    <p class="field-hint">Must be at least 8 characters and include uppercase, lowercase, and a number.</p>' +
          '    <div id="pw-new-error" class="field-error" role="alert"></div>' +
          '  </div>' +
          '  <div class="form-group">' +
          '    <label class="form-label" for="pw-confirm">Confirm new password <span class="required-mark">*</span></label>' +
          '    <div class="input-wrap">' +
          '      <input id="pw-confirm" type="password" class="form-control has-toggle" required />' +
          '      <button type="button" class="password-toggle" data-toggle-password="pw-confirm" aria-label="Show password" aria-pressed="false"></button>' +
          '    </div>' +
          '    <div id="pw-confirm-error" class="field-error" role="alert"></div>' +
          '  </div>' +
          '  <div class="modal-footer">' +
          '    <button type="button" class="btn btn-secondary" id="pw-cancel">Cancel</button>' +
          '    <button type="submit" class="btn btn-primary">Update Password</button>' +
          '  </div>' +
          '</form>',
        function (body) {
          body.querySelector('#pw-cancel').addEventListener('click', UI.Modal.close);
          var pwForm = body.querySelector('#change-pw-form');
          var curInput = body.querySelector('#pw-current');
          var newInput = body.querySelector('#pw-new');
          var conInput = body.querySelector('#pw-confirm');
          var curErr = body.querySelector('#pw-current-error');
          var newErr = body.querySelector('#pw-new-error');
          var conErr = body.querySelector('#pw-confirm-error');

          pwForm.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var ok = true;

            if (!curInput.value) {
              UI.setFieldError(curInput, curErr, 'Please enter your current password.');
              ok = false;
            } else {
              UI.setFieldError(curInput, curErr, '');
            }

            if (!UI.Validators.isStrongPassword(newInput.value)) {
              UI.setFieldError(
                newInput,
                newErr,
                'New password must be 8+ characters with uppercase, lowercase, and a number.'
              );
              ok = false;
            } else {
              UI.setFieldError(newInput, newErr, '');
            }

            if (!conInput.value || conInput.value !== newInput.value) {
              UI.setFieldError(conInput, conErr, 'Passwords do not match.');
              ok = false;
            } else {
              UI.setFieldError(conInput, conErr, '');
            }

            if (!ok) return;

            var res = Store.changePassword(curInput.value, newInput.value);
            if (!res.ok) {
              UI.setFieldError(curInput, curErr, res.error);
              curInput.focus();
              return;
            }

            UI.Modal.close();
            UI.Toast.show('Password Updated', 'Your prototype account password has been changed.', 'success');
          });
        }
      );
    });
  });
})();
