/*
 * Pulse State
 * Module: pulse-state.js
 * Prototype: v0.2
 *
 * DJs Mobiles Website Pulse reader memory.
 * Website-only storage. No extension dependency.
 */

(function (window) {
  'use strict';

  const STORAGE_PREFIX = 'djs_pulse_website_';

  const KEYS = {
    firstSeen: STORAGE_PREFIX + 'first_seen',
    lastSeen: STORAGE_PREFIX + 'last_seen',
    lastVisit: STORAGE_PREFIX + 'last_visit',
    lastAutoOpen: STORAGE_PREFIX + 'last_auto_open',
    expanded: STORAGE_PREFIX + 'expanded',
    developer: 'djs_pulse_dev'
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function todayKey(date) {
    const value = date instanceof Date ? date : new Date(date || Date.now());
    if (Number.isNaN(value.getTime())) return new Date().toISOString().slice(0, 10);
    return value.toISOString().slice(0, 10);
  }

  function safeGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* localStorage may be unavailable in private modes. Pulse should still render. */
    }
  }

  function formatMonthYear(isoValue) {
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  }

  const PulseState = {
    version: '0.2',
    keys: KEYS,

    load() {
      const current = nowIso();
      let firstSeen = safeGet(KEYS.firstSeen);
      const previousLastSeen = safeGet(KEYS.lastSeen);
      const expandedValue = safeGet(KEYS.expanded);

      if (!firstSeen) {
        firstSeen = current;
        safeSet(KEYS.firstSeen, firstSeen);
      }

      safeSet(KEYS.lastVisit, previousLastSeen || current);
      safeSet(KEYS.lastSeen, current);

      return {
        firstSeen,
        lastSeen: current,
        previousLastSeen,
        lastVisit: previousLastSeen || current,
        lastAutoOpen: safeGet(KEYS.lastAutoOpen),
        isExpanded: expandedValue === null ? true : expandedValue === 'true',
        isFirstVisit: !previousLastSeen,
        followingSince: formatMonthYear(firstSeen)
      };
    },

    setExpanded(value) {
      safeSet(KEYS.expanded, value ? 'true' : 'false');
    },

    markAutoOpened(date) {
      safeSet(KEYS.lastAutoOpen, todayKey(date || Date.now()));
    },

    isDeveloper() {
      return safeGet(KEYS.developer) === 'true';
    },

    shouldAutoOpen(reader, options) {
      if (!reader) return false;

      const settings = options || {};
      const publicAutoOpen = settings.publicAutoOpen === true;
      const developerMode = this.isDeveloper();

      if (!developerMode && !publicAutoOpen) {
        return false;
      }

      const lastAutoOpen = reader.lastAutoOpen || '';
      return lastAutoOpen !== todayKey(Date.now());
    },

    getDaysSinceLastVisit(reader) {
      if (!reader || !reader.previousLastSeen) return 0;
      const then = new Date(reader.previousLastSeen).getTime();
      const now = Date.now();
      if (Number.isNaN(then)) return 0;
      return Math.max(0, Math.floor((now - then) / 86400000));
    },

    reset() {
      Object.keys(KEYS).forEach(function (name) {
        try {
          window.localStorage.removeItem(KEYS[name]);
        } catch (error) {}
      });
    }
  };

  window.DjsPulseState = PulseState;
})(window);
