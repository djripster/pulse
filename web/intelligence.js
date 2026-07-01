/*
 * DJs Mobiles Intelligence
 * Module: intelligence.js
 * Prototype: v0.2.2
 *
 * Shared website intelligence layer.
 * Theme first. Pulse second.
 */

(function (window, document) {
  'use strict';

  const Intelligence = {
    version: '0.2.2',

    isHomePage() {
      const path = window.location.pathname.replace(/\/+$/, '');
      return path === '' || path === '/';
    },

    normalize(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9+]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    },

    has(text, term) {
      return (' ' + text + ' ').indexOf(' ' + term + ' ') !== -1;
    },

    detectBrand(title, labels) {
      const text = this.normalize((title || '') + ' ' + (labels || []).join(' '));

      const brands = [
        ['Samsung', ['samsung', 'galaxy']],
        ['Apple', ['apple', 'iphone', 'ipad', 'mac']],
        ['Google', ['google', 'pixel']],
        ['Microsoft', ['microsoft', 'surface', 'windows']],
        ['Motorola', ['motorola', 'moto', 'razr']],
        ['Nothing', ['nothing', 'cmf']],
        ['OnePlus', ['oneplus']],
        ['Nokia', ['nokia']],
        ['BlackBerry', ['blackberry']],
        ['Sony', ['sony', 'xperia']],
        ['HTC', ['htc']],
        ['LG', ['lg']]
      ];

      for (const [brand, terms] of brands) {
        if (terms.some(term => this.has(text, term))) {
          return brand;
        }
      }

      return '';
    },

    detectPlatform(title, labels) {
      const text = this.normalize((title || '') + ' ' + (labels || []).join(' '));

      if (this.has(text, 'android')) return 'Android';
      if (this.has(text, 'ios')) return 'iOS';
      if (this.has(text, 'windows phone')) return 'Windows Phone';
      if (this.has(text, 'windows')) return 'Windows';
      if (this.has(text, 'chrome os')) return 'Chrome OS';
      if (this.has(text, 'mac')) return 'Mac';

      return '';
    },

    detectPostType(title, labels) {
      const text = this.normalize((title || '') + ' ' + (labels || []).join(' '));

      if (this.has(text, 'specs') || this.has(text, 'spec')) return 'Specs';
      if (this.has(text, 'review') || this.has(text, 'reviews')) return 'Review';
      if (this.has(text, 'editorial') || this.has(text, 'opinion') || this.has(text, 'analysis')) return 'Editorial';
      if (this.has(text, 'guide') || this.has(text, 'guides') || this.has(text, 'how to')) return 'Guide';
      if (this.has(text, 'deal') || this.has(text, 'deals')) return 'Deals';

      return 'News';
    },

    detectTopics(title, labels) {
      const text = this.normalize((title || '') + ' ' + (labels || []).join(' '));
      const topics = [];

      const topicMap = [
        ['AI', ['ai', 'artificial intelligence', 'galaxy ai', 'gemini', 'apple intelligence']],
        ['Camera', ['camera', 'photo', 'video', 'imaging']],
        ['Battery', ['battery', 'charging']],
        ['Foldables', ['foldable', 'foldables', 'z fold', 'z flip', 'razr']],
        ['Android Updates', ['android update', 'android beta', 'security patch', 'pixel update']],
        ['Gaming', ['gaming', 'game', 'console']],
        ['Wearables', ['wear os', 'watch', 'wearable']],
        ['Carriers', ['carrier', 'mvno', '5g']]
      ];

      for (const [topic, terms] of topicMap) {
        if (terms.some(term => this.has(text, term))) {
          topics.push(topic);
        }
      }

      return topics;
    },

    collectArticleFromPage() {
      const titleNode = document.querySelector('.post-title, h1, title');
      const labelNodes = document.querySelectorAll('.post-label-chip, a[rel="tag"]');
      const labels = [];

      labelNodes.forEach(function (node) {
        const label = String(node.textContent || '').trim();
        if (label && labels.indexOf(label) === -1) labels.push(label);
      });

      return {
        title: titleNode ? String(titleNode.textContent || '').trim() : document.title,
        labels
      };
    },

    analyzeArticle(article) {
      if (this.isHomePage()) {
        return {
          title: 'DJs Mobiles',
          labels: [],
          brand: '',
          platform: '',
          type: 'Home',
          topics: [],
          isHome: true
        };
      }

      const source = article || this.collectArticleFromPage();
      const title = source?.title || document.title || '';
      const labels = source?.labels || [];

      return {
        title,
        labels,
        brand: this.detectBrand(title, labels),
        platform: this.detectPlatform(title, labels),
        type: this.detectPostType(title, labels),
        topics: this.detectTopics(title, labels),
        isHome: false
      };
    },

    formatLastVisit(reader) {
      if (!reader || !reader.previousLastSeen) return 'Today';

      const daysAway = window.DjsPulseState
        ? window.DjsPulseState.getDaysSinceLastVisit(reader)
        : 0;

      if (daysAway <= 0) return 'Today';
      if (daysAway === 1) return 'Yesterday';

      return daysAway + ' days ago';
    },

    buildReaderStats(reader) {
      const stats = [
        {
          label: 'Following since',
          value: reader?.followingSince || 'Recently'
        }
      ];

      stats.push({
        label: 'Last visit',
        value: this.formatLastVisit(reader)
      });

      if (reader && typeof reader.visitCount !== 'undefined') {
        const count = Number(reader.visitCount) || 0;

        stats.push({
          label: 'Visits',
          value: count === 1 ? '1 visit' : count + ' visits'
        });
      }

      return stats;
    },

    getPulseConversation(reader, article) {
      const daysAway = window.DjsPulseState && reader
        ? window.DjsPulseState.getDaysSinceLastVisit(reader)
        : 0;

      if (reader && reader.isFirstVisit) {
        return {
          eyebrow: 'Your Pulse',
          title: 'Pulse is just getting started.',
          message: 'More will appear here as Pulse accompanies you on your journey.',
          mode: 'welcome',
          stats: this.buildReaderStats(reader)
        };
      }

      if (daysAway >= 2) {
        return {
          eyebrow: 'Your Pulse',
          title: 'Welcome back.',
          message: 'It has been a little while. Pulse will start surfacing what changed while you were away as your reading history grows.',
          mode: 'returning',
          stats: this.buildReaderStats(reader)
        };
      }

      return {
        eyebrow: 'Your Pulse',
        title: 'Pulse is just getting started.',
        message: 'More will appear here as Pulse accompanies you on your journey.',
        mode: 'welcome',
        stats: this.buildReaderStats(reader)
      };
    }
  };

  window.DjsIntelligence = Intelligence;
})(window, document);
