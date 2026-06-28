/*
 * Pulse
 * Module: pulse-storage.js
 * Prototype: v0.1
 */

(function (global) {
  'use strict';

  var STORAGE_KEY = 'djs_pulse_state';

  var DEFAULT_STATE = {
    version: 1,
    installedAt: '',
    lastVisit: '',
    welcomeDismissed: false
  };

  function now() {
    return new Date().toISOString();
  }

  function read() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        var freshState = Object.assign({}, DEFAULT_STATE, {
          installedAt: now()
        });

        write(freshState);
        return freshState;
      }

      return Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    } catch (error) {
      return Object.assign({}, DEFAULT_STATE, {
        installedAt: now()
      });
    }
  }

  function write(state) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  function update(updates) {
    var state = read();
    var nextState = Object.assign({}, state, updates);
    return write(nextState);
  }

  global.PulseStorage = {
    read: read,
    write: write,
    update: update,
    now: now
  };
})(window);
