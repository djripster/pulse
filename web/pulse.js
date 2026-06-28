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
        }

    };

    window.Pulse = Pulse;

    document.addEventListener('DOMContentLoaded', () => {
        Pulse.init();
    });

})(window, document);
