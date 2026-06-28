/*
 * Pulse
 * ------------------------------------
 * Module: pulse-core.js
 *
 * Shared Pulse behaviour.
 * Prototype: v0.1
 *
 * UI belongs to the platform.
 * Behaviour belongs to Core.
 */

(function (global) {
  'use strict';

  var Pulse = {
    init: function () {
      // TODO: connect to PulseStorage
    },

    isFirstLaunch: function () {
      // TODO
      return false;
    },

    shouldShowWelcome: function () {
      // TODO
      return false;
    },

    markVisit: function () {
      // TODO
    },

    dismissWelcome: function () {
      // TODO
    },

    getReaderState: function () {
      // TODO
      return {};
    }
  };

  global.Pulse = Pulse;
})(window);
