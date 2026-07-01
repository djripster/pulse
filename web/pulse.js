/*
 * Pulse
 * Module: pulse.js
 * Prototype: v0.2.5
 *
 * DJs Mobiles Website Integration
 */

(function (window, document) {
  'use strict';

  const PULSE_ASSET_PATH = 'https://djripster.github.io/pulse/web/';

  const PulseConfig = {
    publicVisible: false,
    publicAutoOpen: false,
    publicCanExpand: false
  };

  const Pulse = {
    version: '0.2.5',
    reader: null,
    article: null,
    conversation: null,
    isExpanded: true,
    iconPath: PULSE_ASSET_PATH + 'pulse.svg',
    isDeveloper: false,

    isMobile() {
      return window.matchMedia('(max-width: 768px)').matches;
    },

    isArticlePage() {
      return document.body &&
        document.body.classList.contains('item-view') &&
        !!document.querySelector('.post-body');
    },

    canExpand() {
      return this.isDeveloper || PulseConfig.publicCanExpand === true;
    },

    getDesktopContainer() {
      return document.getElementById('pulse-container');
    },

    getMobileButtonContainer() {
      return document.getElementById('pulse-mobile-button');
    },

    getMobileCardContainer() {
      return document.getElementById('pulse-mobile-card');
    },

    getCardContainer() {
      return this.isMobile()
        ? this.getMobileCardContainer()
        : this.getDesktopContainer();
    },

    hideContainer(container) {
      if (!container) return;
      container.innerHTML = '';
      container.setAttribute('hidden', 'hidden');
      container.setAttribute('aria-hidden', 'true');
    },

    showContainer(container) {
      if (!container) return null;
      container.removeAttribute('hidden');
      container.removeAttribute('aria-hidden');
      return container;
    },

    hideForPublicVisitors() {
      this.hideContainer(this.getDesktopContainer());
      this.hideContainer(this.getMobileButtonContainer());
      this.hideContainer(this.getMobileCardContainer());
    },

    clearInactiveMounts() {
      const desktop = this.getDesktopContainer();
      const mobileButton = this.getMobileButtonContainer();
      const mobileCard = this.getMobileCardContainer();

      if (this.isMobile()) {
        if (desktop) desktop.innerHTML = '';
      } else {
        if (mobileButton) mobileButton.innerHTML = '';
        if (mobileCard) mobileCard.innerHTML = '';
      }
    },

    init() {
      console.log('Pulse v' + this.version + ' loaded');

      const state = window.DjsPulseState;
      const intelligence = window.DjsIntelligence;

      this.isDeveloper = state ? state.isDeveloper() : false;

      if (!this.isDeveloper && PulseConfig.publicVisible !== true) {
        this.hideForPublicVisitors();
        return;
      }

      this.reader = state ? state.load() : {
        isExpanded: false,
        followingSince: 'Today',
        isFirstVisit: true
      };

      this.article = intelligence ? intelligence.analyzeArticle() : null;

      if (state && this.article && this.isArticlePage()) {
        state.recordArticle(this.article);
        this.reader.articleHistory = state.getArticleHistory();
      }

      this.conversation = intelligence
        ? intelligence.getPulseConversation(this.reader, this.article)
        : this.getFallbackConversation();

      const shouldAutoOpen = state
        ? state.shouldAutoOpen(this.reader, { publicAutoOpen: PulseConfig.publicAutoOpen })
        : false;

      this.isExpanded = shouldAutoOpen
        ? true
        : (this.canExpand() ? this.reader.isExpanded : false);

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
      return '<img class="pulse-icon" src="' + this.escapeHtml(this.iconPath) + '" alt="" aria-hidden="true" loading="lazy" decoding="async">';
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
      const affordance = this.canExpand()
        ? '<span class="pulse-card__chevron" aria-hidden="true">⌄</span>'
        : '<span class="pulse-card__status" aria-hidden="true">Soon</span>';

      return `
        <button type="button" class="pulse-card__header" aria-expanded="false">
          ${this.titleMarkup()}
          ${affordance}
        </button>
      `;
    },

    mobileButtonMarkup() {
      return `
        <button type="button" class="pulse-mobile-trigger" aria-label="Open Your Pulse" aria-expanded="${this.isExpanded ? 'true' : 'false'}">
          ${this.iconMarkup()}
        </button>
      `;
    },

    toggleExpanded() {
      if (!this.canExpand()) {
        console.log('Pulse is visible, but the full website experience is developer-only for now.');
        return;
      }

      this.isExpanded = !this.isExpanded;

      if (window.DjsPulseState) {
        window.DjsPulseState.setExpanded(this.isExpanded);
      }

      this.render();
    },

    renderMobileButton() {
      const buttonContainer = this.showContainer(this.getMobileButtonContainer());
      if (!buttonContainer) return;

      buttonContainer.innerHTML = this.mobileButtonMarkup();

      const button = buttonContainer.querySelector('.pulse-mobile-trigger');
      if (!button) return;

      button.addEventListener('click', () => {
        this.toggleExpanded();
      });
    },

    render() {
      this.clearInactiveMounts();

      if (!this.isDeveloper && PulseConfig.publicVisible !== true) {
        this.hideForPublicVisitors();
        return;
      }

      if (this.isMobile()) {
        this.renderMobileButton();
      }

      const cardContainer = this.showContainer(this.getCardContainer());
      if (!cardContainer) return;

      cardContainer.innerHTML = '';

      if (this.isMobile() && !this.isExpanded) {
        return;
      }

      const card = document.createElement('section');
      const mode = this.conversation && this.conversation.mode ? this.conversation.mode : 'default';

      card.className = this.isExpanded
        ? 'pulse-card pulse-card--expanded pulse-card--' + mode
        : 'pulse-card pulse-card--collapsed' + (this.canExpand() ? '' : ' pulse-card--locked');

      card.innerHTML = this.isExpanded ? this.expandedMarkup() : this.collapsedMarkup();

      const header = card.querySelector('.pulse-card__header');

      if (header) {
        header.addEventListener('click', () => {
          this.toggleExpanded();
        });
      }

      cardContainer.appendChild(card);
    }
  };

  window.PulseConfig = PulseConfig;
  window.Pulse = Pulse;

  document.addEventListener('DOMContentLoaded', () => {
    Pulse.init();
  });

  let pulseResizeTimer = null;

  window.addEventListener('resize', () => {
    clearTimeout(pulseResizeTimer);
    pulseResizeTimer = setTimeout(() => {
      if (window.Pulse) {
        window.Pulse.render();
      }
    }, 150);
  });
})(window, document);
