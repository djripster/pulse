/*
 * Pulse
 * Module: pulse.js
 * Prototype: v0.2
 *
 * DJs Mobiles Website Integration
 */

(function (window, document) {
  'use strict';

  const Pulse = {
    version: '0.2',
    reader: null,
    article: null,
    conversation: null,
    isExpanded: true,
    iconPath: 'https://djripster.github.io/pulse/web/pulse.svg',

    init() {
      console.log('Pulse v' + this.version + ' loaded');

      const state = window.DjsPulseState;
      const intelligence = window.DjsIntelligence;

      this.reader = state ? state.load() : { isExpanded: true, followingSince: 'Today', isFirstVisit: true };
      this.article = intelligence ? intelligence.analyzeArticle() : null;
      this.conversation = intelligence
        ? intelligence.getPulseConversation(this.reader, this.article)
        : this.getFallbackConversation();

      const shouldAutoOpen = state ? state.shouldAutoOpen(this.reader) : true;
      this.isExpanded = shouldAutoOpen ? true : this.reader.isExpanded;

      if (shouldAutoOpen && state) {
        state.markAutoOpened();
      }

      this.render();
    },

    getFallbackConversation() {
      return {
        eyebrow: 'Your Pulse',
        title: 'Pulse is just getting started.',
        message: 'More will appear here as Pulse accompanies you on your journey.',
        mode: 'welcome',
        stats: [
          { label: 'Following since', value: 'Today' }
        ]
      };
    },

    escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    iconMarkup() {
      return '<img class="pulse-icon" src="' + this.escapeHtml(this.iconPath) + '" alt="" aria-hidden="true">';
    },

    titleMarkup() {
      return '<span class="pulse-title">' + this.iconMarkup() + '<span>Your Pulse</span></span>';
    },

    statsMarkup(stats) {
      if (!stats || !stats.length) return '';

      return '<div class="pulse-card__stats">' + stats.map((item) => {
        return '<div class="pulse-card__stat">' +
          '<span>' + this.escapeHtml(item.label) + '</span>' +
          '<strong>' + this.escapeHtml(item.value) + '</strong>' +
        '</div>';
      }).join('') + '</div>';
    },

    expandedMarkup() {
      const conversation = this.conversation || this.getFallbackConversation();

      return `
        <button type="button" class="pulse-card__header" aria-expanded="true">
          ${this.titleMarkup()}
          <span class="pulse-card__chevron" aria-hidden="true">⌃</span>
        </button>
        <div class="pulse-card__body">
          <div class="pulse-card__eyebrow">${this.escapeHtml(conversation.eyebrow)}</div>
          <h2>${this.escapeHtml(conversation.title)}</h2>
          <p>${this.escapeHtml(conversation.message)}</p>
          ${this.statsMarkup(conversation.stats)}
        </div>
      `;
    },

    collapsedMarkup() {
      return `
        <button type="button" class="pulse-card__header" aria-expanded="false">
          ${this.titleMarkup()}
          <span class="pulse-card__chevron" aria-hidden="true">⌄</span>
        </button>
      `;
    },

    render() {
      const container = document.getElementById('pulse-container');
      if (!container) return;

      container.innerHTML = '';

      const card = document.createElement('section');
      const mode = this.conversation && this.conversation.mode ? this.conversation.mode : 'default';
      card.className = this.isExpanded
        ? 'pulse-card pulse-card--expanded pulse-card--' + mode
        : 'pulse-card pulse-card--collapsed';

      card.innerHTML = this.isExpanded ? this.expandedMarkup() : this.collapsedMarkup();

      const header = card.querySelector('.pulse-card__header');
      if (header) {
        header.addEventListener('click', () => {
          this.isExpanded = !this.isExpanded;

          if (window.DjsPulseState) {
            window.DjsPulseState.setExpanded(this.isExpanded);
          }

          this.render();
        });
      }

      container.appendChild(card);
    }
  };

  window.Pulse = Pulse;

  document.addEventListener('DOMContentLoaded', () => {
    Pulse.init();
  });
})(window, document);
