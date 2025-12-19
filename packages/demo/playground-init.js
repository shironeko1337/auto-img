// Playground initialization script
// This script redirects visualize.ts DOM operations to render inside #playground

(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayground);
  } else {
    initPlayground();
  }

  function initPlayground() {
    const playground = document.querySelector('#playground');
    if (!playground) {
      console.error('Playground element not found');
      return;
    }

    // Override document.body.appendChild to redirect to playground
    const originalAppendChild = document.body.appendChild.bind(document.body);
    document.body.appendChild = function(element) {
      // Don't redirect script and style elements - they need to stay in body
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
        return originalAppendChild(element);
      }

      // Only redirect if we're in playground mode (playground is visible)
      if (!playground.classList.contains('hidden')) {
        return playground.appendChild(element);
      }
      return originalAppendChild(element);
    };
  }
})();
