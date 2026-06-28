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

    init() {
      console.log('❤️ Pulse v' + this.version + ' loaded');
      this.renderDemoCard();
    },

    renderDemoCard() {
      const container = document.getElementById('pulse-container');
      if (!container) return;

      if (container.querySelector('.pulse-card')) return;

      const card = document.createElement('section');
      card.className = 'pulse-card';
      card.innerHTML = `
        <div class="pulse-card__eyebrow">❤️ Your Pulse</div>
        <h2>Welcome back.</h2>
        <p>Website Pulse is now loading from GitHub.</p>
        <button type="button" class="pulse-card__button">Continue</button>
      `;

      container.appendChild(card);
    }
  };

  window.Pulse = Pulse;

  document.addEventListener('DOMContentLoaded', () => {
    Pulse.init();
  });

})(window, document);
