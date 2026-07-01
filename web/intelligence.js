/*
 * DJs Mobiles Intelligence
 * Module: intelligence.js
 * Prototype: v0.2.1
 *
 * Shared website intelligence layer.
 * Theme first. Pulse second.
 */

(function (window, document) {
  'use strict';

  const Intelligence = {
    version: '0.2.1',

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

    getPulseConversation(reader, article) {
      const context = article || this.analyzeArticle();
      const daysAway = window.DjsPulseState && reader
        ? window.DjsPulseState.getDaysSinceLastVisit(reader)
        : 0;

      if (reader && reader.isFirstVisit) {
        return {
          eyebrow: 'Your Pulse',
          title: 'Pulse is just getting started.',
          message: 'More will appear here as Pulse accompanies you on your journey.',
          mode: 'welcome',
          stats: [
            { label: 'Following since', value: reader.followingSince || 'Today' }
          ]
        };
      }

      if (context && context.isHome) {
        return {
          eyebrow: 'Your Pulse',
          title: 'Welcome back.',
          message: 'Explore DJs Mobiles your way.',
          mode: 'welcome',
          stats: [
            { label: 'Following since', value: reader?.followingSince || 'Recently' }
          ]
        };
      }

      if (daysAway >= 2) {
        return {
          eyebrow: 'Welcome back',
          title: 'It has been a little while.',
          message: 'Pulse will start surfacing what changed while you were away as your reading history grows.',
          mode: 'returning',
          stats: [
            { label: 'Following since', value: reader?.followingSince || 'Recently' },
            { label: 'Last visit', value: daysAway + ' days ago' }
          ]
        };
      }

      if (context && (context.brand || context.type || context.topics.length)) {
        const focus = context.brand || context.topics[0] || context.type;

        return {
          eyebrow: 'Today in your Pulse',
          title: focus ? 'You are reading ' + focus + ' coverage.' : 'Welcome back.',
          message: 'Pulse will use article context to make this space more useful over time.',
          mode: 'daily',
          stats: [
            { label: 'Following since', value: reader?.followingSince || 'Recently' },
            { label: 'Reading', value: context.type || 'Article' }
          ]
        };
      }

      return {
        eyebrow: 'Your Pulse',
        title: 'Welcome back.',
        message: 'Pulse is here when there is something meaningful to say.',
        mode: 'quiet',
        stats: [
          { label: 'Following since', value: reader?.followingSince || 'Recently' }
        ]
      };
    }
  };

  window.DjsIntelligence = Intelligence;
})(window, document);
