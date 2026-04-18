// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom may not fully implement matchMedia (used for prefers-reduced-motion checks).
window.matchMedia =
  window.matchMedia ||
  function matchMediaPolyfill(query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    };
  };

// jsdom does not implement IntersectionObserver (used for scroll-linked fade on Invite).
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.callback([
      {
        isIntersecting: true,
        intersectionRatio: 1,
        target: element,
        boundingClientRect: {},
        intersectionRect: {},
        rootBounds: null,
        time: 0,
      },
    ]);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
