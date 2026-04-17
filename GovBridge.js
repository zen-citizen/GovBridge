// ==UserScript==
// @name         GovBridge – Seva Sindhu Login Helper
// @namespace    https://github.com/zen-citizen/GovBridge
// @version      3.0.0
// @description  Adds login method toggle, CAPTCHA cheatsheet, and working eye icon to Seva Sindhu login page
// @author       Zen Citizen
// @match        https://sevasindhuservices.karnataka.gov.in/
// @match        https://sevasindhuservices.karnataka.gov.in/index.html
// @match        https://sevasindhuservices.karnataka.gov.in/login.do
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #gg-method-toggle {
        background: #e8f2ff;
        border: 1px solid #99c2ff;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 8px;
        margin-left: auto;
        margin-right: auto;
        width: 70%;
        text-align: center;
        font-family: sans-serif;
      }
      #gg-method-toggle .gg-label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #1a6bcc;
        margin-bottom: 8px;
      }
      #gg-method-toggle .gg-options {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      #gg-method-toggle .gg-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border: 1.5px solid #99c2ff;
        border-radius: 5px;
        background: white;
        font-size: 13px;
        font-family: sans-serif;
        color: #444;
        cursor: pointer;
        transition: all 0.15s;
      }
      #gg-method-toggle .gg-btn.gg-active {
        background: #1a6bcc;
        color: white;
        border-color: #1a6bcc;
        font-weight: 600;
      }
      #gg-captcha-helper {
        background: #e8f2ff;
        border: 1px solid #99c2ff;
        border-radius: 5px;
        padding: 8px 10px;
        margin-top: 6px;
        margin-left: auto;
        margin-right: auto;
        width: 70%;
        font-family: sans-serif;
        font-size: 12px;
        color: #1a6bcc;
        line-height: 1.6;
      }
      #gg-captcha-helper .gg-pairs {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 4px;
        margin-bottom: 2px;
      }
      #gg-captcha-helper .gg-pair {
        background: white;
        border: 1px solid #99c2ff;
        border-radius: 3px;
        padding: 2px 7px;
        font-family: monospace;
        font-size: 12px;
        color: #333;
      }
      #gg-eye-btn {
        background: white;
        border: none;
        border-left: 1px solid #ccc;
        cursor: pointer;
        width: 48px;
        height: 46px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #555;
        vertical-align: middle;
      }
      #gg-eye-btn i {
        font-size: 20px;
        margin: auto;
      }
      #gg-eye-btn:hover { opacity: 0.7; }
      .input-group:has(#password) {
        display: flex !important;
        align-items: stretch !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────
  // FEATURE 1: Login Method Toggle
  // ─────────────────────────────────────────────
  function injectLoginToggle() {
    const passwordField = document.getElementById('password');
    const otpButton     = document.getElementById('resendOtpButton');

    if (!passwordField || !otpButton) return;

    // Hide the original Get OTP button — we trigger it programmatically
    otpButton.style.display = 'none';

    // Find the wrapping table and insert toggle above it
    const passwordTable = passwordField.closest('table');
    if (!passwordTable) return;

    const toggle = document.createElement('div');
    toggle.id = 'gg-method-toggle';
    toggle.innerHTML = `
      <span class="gg-label">How do you want to log in?</span>
      <div class="gg-options">
        <button class="gg-btn gg-active" id="gg-btn-password">🔑 I have a password</button>
        <button class="gg-btn" id="gg-btn-otp">📱 Send me an OTP</button>
      </div>
    `;

    passwordTable.parentElement.insertBefore(toggle, passwordTable);

    // Mirror original button text changes with friendlier labels
    const otpBtnObserver = new MutationObserver(function () {
      const originalText = otpButton.textContent.trim().toLowerCase();
      const ggBtn = document.getElementById('gg-btn-otp');
      if (!ggBtn) return;
      if (originalText.includes('resend') && originalText.includes('1')) {
        ggBtn.innerHTML = '📱 Resend OTP';
        ggBtn.disabled = false;
        ggBtn.style.opacity = '1';
        ggBtn.style.cursor = 'pointer';
        ggBtn.style.borderColor = '';
        ggBtn.style.color = '';
      } else if (originalText.includes('resend') && originalText.includes('2')) {
        ggBtn.innerHTML = '🚫 OTP limit reached';
        ggBtn.disabled = true;
        ggBtn.style.opacity = '0.5';
        ggBtn.style.cursor = 'not-allowed';
        ggBtn.style.borderColor = '#ccc';
        ggBtn.style.color = '#888';
        ggBtn.style.background = 'white';
      }
    });
    otpBtnObserver.observe(otpButton, { childList: true, subtree: true, characterData: true });

    function activatePasswordMode() {
      document.getElementById('gg-btn-password').classList.add('gg-active');
      document.getElementById('gg-btn-otp').classList.remove('gg-active');
      passwordField.type = 'password';
      passwordField.placeholder = 'Enter your password';
      passwordField.value = '';
      const eyeBtn = document.getElementById('gg-eye-btn');
      if (eyeBtn) {
        eyeBtn.style.display = 'inline-flex';
        eyeBtn.innerHTML = '<i class="fa fa-eye-slash"></i>';
      }
      passwordField.focus();
    }

    function activateOtpMode() {
      document.getElementById('gg-btn-otp').classList.add('gg-active');
      document.getElementById('gg-btn-password').classList.remove('gg-active');
      passwordField.type = 'text';
      passwordField.placeholder = 'Enter OTP sent to your email';
      passwordField.value = '';
      const eyeBtn = document.getElementById('gg-eye-btn');
      if (eyeBtn) eyeBtn.style.display = 'none';
      otpButton.click();
      passwordField.focus();
    }

    document.getElementById('gg-btn-password').addEventListener('click', activatePasswordMode);
    document.getElementById('gg-btn-otp').addEventListener('click', activateOtpMode);

    activatePasswordMode();
  }

  // ─────────────────────────────────────────────
  // FEATURE 2: Working eye icon for password field
  // ─────────────────────────────────────────────
  function injectEyeToggle() {
    const passwordField = document.getElementById('password');
    const showPasswd    = document.getElementById('showPasswd');
    const hidePasswd    = document.getElementById('hidePasswd');

    if (!passwordField) return;

    // Hide the site's broken eye icons
    if (showPasswd) showPasswd.style.display = 'none';
    if (hidePasswd) hidePasswd.style.display = 'none';

    const inputGroup = passwordField.closest('.input-group');
    if (!inputGroup) return;

    const eyeBtn = document.createElement('button');
    eyeBtn.id    = 'gg-eye-btn';
    eyeBtn.type  = 'button';
    eyeBtn.title = 'Show/hide password';
    eyeBtn.innerHTML = '<i class="fa fa-eye-slash"></i>';
    inputGroup.appendChild(eyeBtn);

    eyeBtn.addEventListener('click', function () {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        eyeBtn.innerHTML = '<i class="fa fa-eye"></i>';
      } else {
        passwordField.type = 'password';
        eyeBtn.innerHTML = '<i class="fa fa-eye-slash"></i>';
      }
      passwordField.focus();
    });
  }

  // ─────────────────────────────────────────────
  // FEATURE 3: CAPTCHA Cheatsheet
  // No existing elements are modified.
  // ─────────────────────────────────────────────
  function injectCaptchaHelper() {
    if (document.getElementById('gg-captcha-helper')) return;
    const captchaInput = document.getElementById('captchaAnswer');
    if (!captchaInput) return;

    const captchaTable = captchaInput.closest('table');
    if (!captchaTable) return;

    const helper = document.createElement('div');
    helper.id = 'gg-captcha-helper';
    helper.innerHTML = `
      ⚠️ <strong>Easy to mix up:</strong>
      <div class="gg-pairs">
        <span class="gg-pair">l ≠ 1</span>
        <span class="gg-pair">O ≠ 0</span>
        <span class="gg-pair">I ≠ 1</span>
        <span class="gg-pair">g ≠ 9</span>
        <span class="gg-pair">z ≠ 2</span>
      </div>
      Click the refresh icon if the CAPTCHA is hard to read.
    `;

    captchaTable.parentElement.insertAdjacentElement('afterend', helper);
  }

  // ─────────────────────────────────────────────
  // INIT — with MutationObserver fallback for
  // dynamic page loads common on govt sites
  // ─────────────────────────────────────────────
  function init() {
    injectStyles();
    injectLoginToggle();
    injectEyeToggle();
    injectCaptchaHelper();
  }

  function tryInit() {
    const passwordReady = !!document.getElementById('password');
    const captchaReady  = !!document.getElementById('captchaAnswer');
    const alreadyRun    = !!document.getElementById('gg-method-toggle');
    if ((passwordReady || captchaReady) && !alreadyRun) {
      observer.disconnect();
      init();
      return true;
    }
    return false;
  }

  const observer = new MutationObserver(tryInit);

  if (!tryInit()) {
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);
  }

})();
