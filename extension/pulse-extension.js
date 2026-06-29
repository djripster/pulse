/*
 * Pulse
 * Module: pulse-extension.js
 * Prototype: v0.2.1
 */

(function (global, document) {
  'use strict';

  function createOverlay(state) {
    var isFirstLaunch = state.isFirstLaunch;

    var overlay = document.createElement('div');
    overlay.className = 'pulse-overlay';

    overlay.innerHTML =
      '<div class="pulse-card">' +
        '<div class="pulse-kicker">❤️ Your Pulse</div>' +
        '<h2>' + (isFirstLaunch ? 'Welcome to Pulse' : 'Welcome back') + '</h2>' +
        '<p>' + (isFirstLaunch
          ? 'Pulse helps DJs Mobiles remember your experience on this device.'
          : 'We missed you. Your latest stories are waiting.') + '</p>' +
        '<button class="pulse-button" type="button">' +
          (isFirstLaunch ? 'Begin' : 'Continue') +
        '</button>' +
      '</div>';

    overlay.querySelector('.pulse-button').addEventListener('click', function () {
      global.Pulse.dismissWelcome();
      overlay.remove();
    });

    return overlay;
  }

  function initPulseOverlay() {
    if (!global.Pulse) {
      return;
    }

    global.Pulse.init();

    if (!global.Pulse.shouldShowWelcome()) {
      global.Pulse.markVisit();
      return;
    }

    document.body.appendChild(createOverlay(global.Pulse.getReaderState()));
  }

  function renderPulseRoot(root) {
    root.innerHTML =
      '<section class="pulse-root-card">' +
        '<div class="pulse-root-card__top">' +
          '<div>' +
            '<div class="pulse-root-kicker">❤️ Your Pulse</div>' +
            '<h2>Pulse</h2>' +
          '</div>' +
          '<button class="pulse-root-close" id="pulseRootClose" type="button" aria-label="Close Pulse">×</button>' +
        '</div>' +
        '<p>Your Pulse experience will live here.</p>' +
      '</section>';
  }

  function initPulseRoot() {
    var heartButton = document.getElementById('pulseHeartBtn');
    var root = document.getElementById('pulseRoot');

    if (!heartButton || !root) {
      return;
    }

    function closePulse() {
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      heartButton.setAttribute('aria-expanded', 'false');
    }

    function openPulse() {
      if (!root.innerHTML.trim()) {
        renderPulseRoot(root);
      }

      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      heartButton.setAttribute('aria-expanded', 'true');

      var closeButton = document.getElementById('pulseRootClose');
      if (closeButton) {
        closeButton.addEventListener('click', closePulse, { once: true });
      }
    }

    function togglePulse() {
      if (root.classList.contains('is-open')) {
        closePulse();
      } else {
        openPulse();
      }
    }

    root.setAttribute('aria-hidden', 'true');
    heartButton.setAttribute('aria-controls', 'pulseRoot');
    heartButton.setAttribute('aria-expanded', 'false');
    heartButton.addEventListener('click', togglePulse);

    global.PulseExtension = global.PulseExtension || {};
    global.PulseExtension.open = openPulse;
    global.PulseExtension.close = closePulse;
    global.PulseExtension.toggle = togglePulse;
  }

  function initPulseReset() {
    var resetButton = document.getElementById('pulseResetBtn');

    if (!resetButton) {
      return;
    }

    resetButton.addEventListener('click', function () {
      localStorage.removeItem('djs_pulse_state');
      window.location.reload();
    });
  }

  function initPulseExtension() {
    initPulseOverlay();
    initPulseRoot();
    initPulseReset();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPulseExtension);
  } else {
    initPulseExtension();
  }
})(window, document);
