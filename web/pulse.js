/*
 * Pulse
 * Module: pulse.js
 * Prototype: v0.1
 *
 * DJs Mobiles Website Integration
 */

(function (window, document) {
  'use strict';

  const Pulse = {
    version: '0.1',
    isExpanded: true,

    init() {
      console.log('❤️ Pulse v' + this.version + ' loaded');
      this.render();
    },

    render() {
      const container = document.getElementById('pulse-container');
      if (!container) return;

      container.innerHTML = '';

      const card = document.createElement('section');
      card.className = this.isExpanded
        ? 'pulse-card pulse-card--expanded'
        : 'pulse-card pulse-card--collapsed';

      card.innerHTML = this.isExpanded
        ? `
          <button type="button" class="pulse-card__header" aria-expanded="true">
            <span>❤️ Your Pulse</span>
            <span class="pulse-card__chevron">⌃</span>
          </button>
          <div class="pulse-card__body">
            <h2>Welcome.</h2>
            <p>Explore DJs Mobiles your way.</p>
          </div>
        `
        : `
          <button type="button" class="pulse-card__header" aria-expanded="false">
            <span>❤️ Your Pulse</span>
            <span class="pulse-card__chevron">⌄</span>
          </button>
        `;

      card.querySelector('.pulse-card__header').addEventListener('click', () => {
        this.isExpanded = !this.isExpanded;
        this.render();
      });

      container.appendChild(card);
    }
  };

  window.Pulse = Pulse;

  document.addEventListener('DOMContentLoaded', () => {
    Pulse.init();
  });

})(window, document);
