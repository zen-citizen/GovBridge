// ==UserScript==
// @name         GovGuide – Seva Sindhu Login Helper
// @namespace    https://github.com/govguide
// @version      2.0.0
// @description  Adds login method toggle and CAPTCHA cheatsheet to Seva Sindhu login page
// @author       GovGuide
// @match        https://sevasindhuservices.karnataka.gov.in/
// @match        https://sevasindhuservices.karnataka.gov.in/index.html
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────
  const css = `
    #gg-method-toggle {
      background: #e8f2ff;
      border: 1px solid #99c2ff;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 8px;
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
    #gg-otp-sent {
      display: none;
      background: #e8f5ed;
      border: 1px solid #99d4b0;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 12px;
      color: #1a7a3a;
      margin-top: 8px;
      font-family: sans-serif;
    }
  `;

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ─────────────────────────────────────────────
  // FEATURE 1: Login Method Toggle
  // ─────────────────────────────────────────────
  function injectLoginToggle() {
    const passwordField = document.getElementById('password');
    const otpButton     = document.getElementById('resendOtpButton');
    const showPasswd    = document.getElementById('showPasswd');
    const hidePasswd    = document.getElementById('hidePasswd');

    if (!passwordField || !otpButton) return;

    // Hide the original Get OTP button — we trigger it programmatically
    otpButton.style.display = 'none';

    // Hide eye icons initially — shown only in password mode
    if (showPasswd) showPasswd.style.display = 'none';
    if (hidePasswd) hidePasswd.style.display = 'none';

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
      <div id="gg-otp-sent">✅ OTP sent to your email. Check your inbox and spam folder.</div>
    `;

    passwordTable.parentElement.insertBefore(toggle, passwordTable);

    function activatePasswordMode() {
      document.getElementById('gg-btn-password').classList.add('gg-active');
      document.getElementById('gg-btn-otp').classList.remove('gg-active');
      document.getElementById('gg-otp-sent').style.display = 'none';
      passwordField.type = 'password';
      passwordField.placeholder = 'Enter your password';
      passwordField.value = '';
      if (showPasswd) showPasswd.style.display = '';
      if (hidePasswd) hidePasswd.style.display = 'none';
      passwordField.focus();
    }

    function activateOtpMode() {
      document.getElementById('gg-btn-otp').classList.add('gg-active');
      document.getElementById('gg-btn-password').classList.remove('gg-active');
      passwordField.type = 'text';
      passwordField.placeholder = 'Enter OTP sent to your email';
      passwordField.value = '';
      if (showPasswd) showPasswd.style.display = 'none';
      if (hidePasswd) hidePasswd.style.display = 'none';
      // Trigger the real Get OTP button on the page
      otpButton.click();
      document.getElementById('gg-otp-sent').style.display = 'block';
      passwordField.focus();
    }

    document.getElementById('gg-btn-password').addEventListener('click', activatePasswordMode);
    document.getElementById('gg-btn-otp').addEventListener('click', activateOtpMode);

    // Default to password mode
    activatePasswordMode();
  }

  // ─────────────────────────────────────────────
  // INIT — with MutationObserver fallback for
  // dynamic page loads common on govt sites
  // ─────────────────────────────────────────────
  function init() {
    injectStyles();
    injectLoginToggle();
  }

  function tryInit() {
    const passwordReady = !!document.getElementById('password');
    const alreadyRun    = !!document.getElementById('gg-method-toggle');
    if (passwordReady && !alreadyRun) {
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