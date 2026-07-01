/*
 * DJs Mobiles Intelligence
 * Module: intelligence.js
 * Prototype: v0.2.3
 *
 * Shared website intelligence layer.
 * Theme first. Pulse second.
 */

(function (window, document) {
  'use strict';

  const SITE_TITLE_PREFIX = /^DJs Mobiles\s*\|\s*Expert Tech Insights & Mobile News Since 2010:\s*/i;

  const Intelligence = {
    version: '0.2.3',

    isHomePage() {
      const path = window.location.pathname.replace(/\/+$/, '');
      return path === '' || path === '/';
    },

    isArticlePage() {
      return document.body &&
        document.body.classList.contains('item-view') &&
        !!document.querySelector('.post-body');
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

    cleanTitle(value) {
      const title = String(value || document.title || '')
        .replace(SITE_TITLE_PREFIX, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (title.indexOf(': ') !== -1 && title.toLowerCase().indexOf('djs mobiles') === 0) {
        return title.split(': ').slice(1).join(': ').trim();
      }

      return title;
    },

    getArticleRoot() {
      return document.querySelector('.post-outer, article, .post, .blog-posts .post') || document;
    },

    detectBrand(title, labels) {
      const titleText = this.normalize(title || '');
      const labelText = this.normalize((labels || []).join(' '));

      const brands = [
        ['Samsung', ['samsung', 'galaxy']],
        ['Apple', ['apple', 'iphone', 'ipad', 'mac']],
        ['Google', ['google', 'pixel']],
        ['Microsoft', ['microsoft', 'surface']],
        ['Motorola', ['motorola', 'moto', 'razr']],
        ['Nothing', ['nothing', 'cmf']],
        ['OnePlus', ['oneplus']],
        ['Nokia', ['nokia']],
        ['BlackBerry', ['blackberry']],
        ['Sony', ['sony', 'xperia']],
        ['HTC', ['htc']],
        ['LG', ['lg']],
        ['Verizon', ['verizon']],
        ['T-Mobile', ['t mobile', 'tmobile']],
        ['AT&T', ['at t', 'att']],
        ['Qualcomm', ['qualcomm', 'snapdragon']]
      ];

      for (const [brand, terms] of brands) {
        if (terms.some(term => this.has(titleText, term))) {
          return brand;
        }
      }

      for (const [brand, terms] of brands) {
        const brandName = this.normalize(brand);
        if (this.has(labelText, brandName)) {
          return brand;
        }

        const strongTerms = terms.filter(function (term) {
          return ['galaxy', 'pixel', 'surface', 'moto', 'razr', 'xperia', 'snapdragon'].indexOf(term) !== -1;
        });

        if (strongTerms.some(term => this.has(labelText, term))) {
          return brand;
        }
      }

      return '';
    },

    detectPlatform(title, labels) {
      const titleText = this.normalize(title || '');
      const labelText = this.normalize((labels || []).join(' '));

      const platforms = [
        ['Windows Phone', ['windows phone']],
        ['Chrome OS', ['chrome os']],
        ['Android', ['android']],
        ['iOS', ['ios']],
        ['Windows', ['windows']],
        ['Mac', ['mac', 'macos']]
      ];

      for (const [platform, terms] of platforms) {
        if (terms.some(term => this.has(titleText, term))) {
          return platform;
        }
      }

      for (const [platform, terms] of platforms) {
        if (terms.some(term => this.has(labelText, term))) {
          return platform;
        }
      }

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
        ['Browsers', ['browser', 'browsers', 'chrome', 'firefox', 'safari', 'edge', 'brave']],
        ['Privacy', ['privacy', 'private browsing']],
        ['Security', ['security', 'malware', 'password', 'passkey']],
        ['Camera', ['camera', 'photo', 'video', 'imaging']],
        ['Battery', ['battery', 'charging']],
        ['Foldables', ['foldable', 'foldables', 'z fold', 'z flip', 'razr']],
        ['Android Updates', ['android update', 'android beta', 'security patch', 'pixel update']],
        ['Gaming', ['gaming', 'game', 'pokemon', 'pokémon', 'console']],
        ['Wearables', ['wear os', 'watch', 'wearable']],
        ['Carriers', ['carrier', 'mvno', '5g', 'verizon', 't mobile', 'tmobile', 'at t', 'att']]
      ];

      for (const [topic, terms] of topicMap) {
        if (terms.some(term => this.has(text, term))) {
          topics.push(topic);
        }
      }

      return topics;
    },

    collectArticleFromPage() {
      const root = this.getArticleRoot();
      const titleNode = root.querySelector('.post-title, h1') || document.querySelector('.post-title, h1, title');
      const labelNodes = root.querySelectorAll('.post-label-chip, a[rel="tag"]');
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
      if (this.isHomePage() || !this.isArticlePage()) {
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
      const title = this.cleanTitle(source?.title || document.title || '');
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
        },
        {
          label: 'Last visit',
          value: this.formatLastVisit(reader)
        }
      ];

      if (reader && typeof reader.visitCount !== 'undefined') {
        const count = Number(reader.visitCount) || 0;

        stats.push({
          label: 'Visits',
          value: count === 1 ? '1 visit' : count + ' visits'
        });
      }

      return stats;
    },

    getPulseConversation(reader) {
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
