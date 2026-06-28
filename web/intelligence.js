/*

* DJs Mobiles Intelligence
* Module: intelligence.js
* Prototype: v0.1
*
* Shared website intelligence layer.
* Theme first. Pulse second.
  */

(function (window) {
'use strict';

const Intelligence = {
version: '0.1',

```
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
    ['Google', ['google', 'pixel', 'android']],
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

analyzeArticle(article) {
  const title = article?.title || document.title || '';
  const labels = article?.labels || [];

  return {
    title,
    labels,
    brand: this.detectBrand(title, labels),
    platform: this.detectPlatform(title, labels),
    type: this.detectPostType(title, labels),
    topics: this.detectTopics(title, labels)
  };
}
```

};

window.DjsIntelligence = Intelligence;

})(window);

