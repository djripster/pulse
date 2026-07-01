/*
 * Pulse State
 * Module: pulse-state.js
 * Prototype: v0.3.1
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
    visitCount: STORAGE_PREFIX + 'visit_count',
    articleHistory: STORAGE_PREFIX + 'article_history',
    sessionVisit: STORAGE_PREFIX + 'session_visit',
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


  function safeSessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeSessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      /* sessionStorage may be unavailable. Pulse should still render. */
    }
  }


  function safeJsonParse(value, fallback) {
    if (!value) return fallback;

    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function safeNumber(value, fallback) {
    const number = parseInt(value, 10);
    return Number.isNaN(number) ? fallback : number;
  }

  function cleanText(value, fallback) {
    return String(value || fallback || '')
      .replace(/^DJs Mobiles\s*\|\s*Expert Tech Insights & Mobile News Since 2010:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function canonicalUrl() {
    const canonical = window.document && window.document.querySelector
      ? window.document.querySelector('link[rel="canonical"]')
      : null;

    return canonical && canonical.href ? canonical.href : window.location.href.split('#')[0];
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
    version: '0.3.1',
    keys: KEYS,

    load() {
      const current = nowIso();
      let firstSeen = safeGet(KEYS.firstSeen);
      const previousLastSeen = safeGet(KEYS.lastSeen);
      const expandedValue = safeGet(KEYS.expanded);
      const previousVisitCount = safeNumber(safeGet(KEYS.visitCount), 0);
      const sessionAlreadyCounted = safeSessionGet(KEYS.sessionVisit) === todayKey(current);
      const visitCount = sessionAlreadyCounted ? previousVisitCount : previousVisitCount + 1;

      if (!firstSeen) {
        firstSeen = current;
        safeSet(KEYS.firstSeen, firstSeen);
      }

      safeSet(KEYS.lastVisit, previousLastSeen || current);
      safeSet(KEYS.lastSeen, current);
      safeSet(KEYS.visitCount, String(visitCount));
      safeSessionSet(KEYS.sessionVisit, todayKey(current));

      return {
        firstSeen,
        lastSeen: current,
        previousLastSeen,
        lastVisit: previousLastSeen || current,
        lastAutoOpen: safeGet(KEYS.lastAutoOpen),
        isExpanded: expandedValue === null ? true : expandedValue === 'true',
        isFirstVisit: !previousLastSeen,
        followingSince: formatMonthYear(firstSeen),
        visitCount,
        articleHistory: this.getArticleHistory()
      };
    },

    setExpanded(value) {
      safeSet(KEYS.expanded, value ? 'true' : 'false');
    },

    getArticleHistory() {
      const history = safeJsonParse(safeGet(KEYS.articleHistory), []);
      return Array.isArray(history) ? history : [];
    },

    recordArticle(article) {
      if (!article) return null;

      const title = cleanText(article.title, window.document ? window.document.title : 'Untitled article');
      const url = canonicalUrl();
      const timestamp = nowIso();

      if (!title || !url) return null;

      const entry = {
        title,
        url,
        timestamp,
        brand: cleanText(article.brand),
        platform: cleanText(article.platform),
        type: cleanText(article.type, 'Article'),
        topics: Array.isArray(article.topics) ? article.topics.slice(0, 6) : []
      };

      const history = this.getArticleHistory();
      const deduped = history.filter(function (item) {
        return item && item.url !== url;
      });

      deduped.unshift(entry);
      const limited = deduped.slice(0, 100);
      safeSet(KEYS.articleHistory, JSON.stringify(limited));

      return entry;
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

        try {
          window.sessionStorage.removeItem(KEYS[name]);
        } catch (error) {}
      });
    }
  };

  window.DjsPulseState = PulseState;
})(window);
