// DomUtils.js - DOM manipulation utility functions

const DomUtils = {
  /**
   * Create a DOM element with attributes and children
   * @param {string} tag - Tag name for the element
   * @param {Object} [attrs={}] - Attributes to set on the element
   * @param {Array} [children=[]] - Child elements or text content
   * @returns {HTMLElement} The created element
   */
  createElement: function(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    this.appendChildren(element, children);
    
    return element;
  },
  
  /**
   * Append children to an element
   * @param {HTMLElement} element - Parent element
   * @param {Array|HTMLElement|string} children - Child elements or text content
   */
  appendChildren: function(element, children) {
    if (!children) return;
    
    // Convert to array if not already
    const childrenArray = Array.isArray(children) ? children : [children];
    
    childrenArray.forEach(child => {
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (child !== null && child !== undefined) {
        // Create text node for string content
        element.appendChild(document.createTextNode(String(child)));
      }
    });
  },
  
  /**
   * Remove all children from an element
   * @param {HTMLElement} element - Element to clear
   */
  clearElement: function(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },
  
  /**
   * Add or remove a class based on condition
   * @param {HTMLElement} element - Element to modify
   * @param {string} className - Class to toggle
   * @param {boolean} condition - Whether to add or remove the class
   */
  toggleClass: function(element, className, condition) {
    if (condition) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  },
  
  /**
   * Create a tooltip element
   * @param {string} text - Tooltip text
   * @param {Object} [options={}] - Options for the tooltip
   * @returns {HTMLElement} The tooltip element
   */
  createTooltip: function(text, options = {}) {
    const defaults = {
      className: 'tooltip',
      position: 'top',
      showDelay: 200,
      hideDelay: 100
    };
    
    const config = { ...defaults, ...options };
    
    // Create tooltip element
    const tooltip = this.createElement('div', {
      className: `${config.className} ${config.position}`,
      style: {
        opacity: 0,
        visibility: 'hidden'
      }
    }, text);
    
    // Add to document body
    document.body.appendChild(tooltip);
    
    return {
      element: tooltip,
      
      /**
       * Show the tooltip at specified coordinates
       * @param {number} x - X coordinate
       * @param {number} y - Y coordinate
       */
      show: function(x, y) {
        clearTimeout(this._hideTimeout);
        
        this._showTimeout = setTimeout(() => {
          tooltip.style.left = `${x}px`;
          tooltip.style.top = `${y}px`;
          tooltip.style.opacity = 1;
          tooltip.style.visibility = 'visible';
        }, config.showDelay);
      },
      
      /**
       * Hide the tooltip
       */
      hide: function() {
        clearTimeout(this._showTimeout);
        
        this._hideTimeout = setTimeout(() => {
          tooltip.style.opacity = 0;
          tooltip.style.visibility = 'hidden';
        }, config.hideDelay);
      },
      
      /**
       * Update tooltip text
       * @param {string} text - New tooltip text
       */
      setText: function(text) {
        tooltip.textContent = text;
      },
      
      /**
       * Remove tooltip from DOM
       */
      destroy: function() {
        clearTimeout(this._showTimeout);
        clearTimeout(this._hideTimeout);
        document.body.removeChild(tooltip);
      }
    };
  },
  
  /**
   * Add a loading spinner to an element
   * @param {HTMLElement} element - Element to add spinner to
   * @param {Object} [options={}] - Options for the spinner
   * @returns {Object} Object with show and hide methods
   */
  addLoadingSpinner: function(element, options = {}) {
    const defaults = {
      size: '40px',
      color: '#3498db',
      background: 'rgba(255, 255, 255, 0.7)',
      zIndex: 100
    };
    
    const config = { ...defaults, ...options };
    
    // Create spinner container
    const container = this.createElement('div', {
      className: 'loading-container',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: config.background,
        zIndex: config.zIndex,
        opacity: 0,
        visibility: 'hidden',
        transition: 'opacity 0.2s ease'
      }
    });
    
    // Create spinner element
    const spinner = this.createElement('div', {
      className: 'loading-spinner',
      style: {
        width: config.size,
        height: config.size,
        border: `3px solid rgba(0, 0, 0, 0.1)`,
        borderTopColor: config.color,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }
    });
    
    // Add spinner to container
    container.appendChild(spinner);
    
    // Add keyframes if not already added
    if (!document.getElementById('spinner-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spinner-keyframes';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Store original position if not already relative or absolute
    const originalPosition = window.getComputedStyle(element).position;
    if (originalPosition !== 'relative' && originalPosition !== 'absolute') {
      element.style.position = 'relative';
    }
    
    // Add container to element
    element.appendChild(container);
    
    return {
      /**
       * Show the spinner
       */
      show: function() {
        container.style.opacity = 1;
        container.style.visibility = 'visible';
      },
      
      /**
       * Hide the spinner
       */
      hide: function() {
        container.style.opacity = 0;
        container.style.visibility = 'hidden';
      },
      
      /**
       * Remove the spinner from DOM
       */
      destroy: function() {
        element.removeChild(container);
        
        // Restore original position
        if (originalPosition !== 'relative' && originalPosition !== 'absolute') {
          element.style.position = originalPosition;
        }
      }
    };
  }
};