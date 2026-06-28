/*
 * Pulse
 * Module: pulse-extension.js
 * Prototype: v0.1
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

  function initPulseExtension() {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPulseExtension);
  } else {
    initPulseExtension();
  }
})(window, document);
