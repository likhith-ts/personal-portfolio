// Iframe cursor override script
// This script should be injected into iframes to hide system cursors

(function () {
    'use strict';

    // Apply cursor none styles to iframe content
    const applyIframeCursorStyles = () => {
        const style = document.createElement('style');
        style.id = 'iframe-cursor-override';
        style.textContent = `
      * {
        cursor: none !important;
      }
      *::before, *::after {
        cursor: none !important;
      }
      html, body {
        cursor: none !important;
      }
      /* PDF viewer specific overrides */
      .textLayer, .annotationLayer, .pageBox, .canvasWrapper {
        cursor: none !important;
      }
    `;

        if (document.head) {
            document.head.appendChild(style);
        } else {
            // If head doesn't exist yet, wait for DOM ready
            document.addEventListener('DOMContentLoaded', () => {
                document.head.appendChild(style);
            });
        }
    };

    // Listen for messages from parent window
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'HIDE_CURSOR' && event.data.source === 'smooth-cursor') {
            applyIframeCursorStyles();
        }
    });

    // Apply styles immediately if document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyIframeCursorStyles);
    } else {
        applyIframeCursorStyles();
    }
})();
