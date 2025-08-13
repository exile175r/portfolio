let root = document.querySelector('project-content') ? document.querySelector('project-content').shadowRoot : document;
const $ = function(sel){return root.querySelector(sel)};
const $$ = function(sel){return root.querySelectorAll(sel)};
const $frag = (function () { let range = document.createRange(); return function (v) { return range.createContextualFragment(v) } })();
const clamp = (MIN, VAL, MAX) => Math.max(MIN, Math.min(VAL, MAX));

// resize
const zoom = 1;
const zoomL = 0;

const figureInfo = [];