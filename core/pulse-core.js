/*
 * Pulse
 * Module: pulse-core.js
 * Prototype: v0.1
 */

(function (global) {
  'use strict';

  function getStorage() {
    if (!global.PulseStorage) {
      throw new Error('PulseStorage is required before Pulse.');
    }

    return global.PulseStorage;
  }

  var Pulse = {
    init: function () {
      return getStorage().read();
    },

    isFirstLaunch: function () {
      var state = getStorage().read();
      return !state.lastVisit;
    },

    shouldShowWelcome: function () {
      var state = getStorage().read();
      return !state.welcomeDismissed;
    },

    markVisit: function () {
      return getStorage().update({
        lastVisit: getStorage().now()
      });
    },

    dismissWelcome: function () {
      return getStorage().update({
        welcomeDismissed: true,
        lastVisit: getStorage().now()
      });
    },

    getReaderState: function () {
      var state = getStorage().read();

      return {
        version: state.version,
        installedAt: state.installedAt,
        lastVisit: state.lastVisit,
        welcomeDismissed: state.welcomeDismissed,
        isFirstLaunch: !state.lastVisit
      };
    }
  };

  global.Pulse = Pulse;
})(window);
