// EventBus.js - event bus for component communication

class EventBus {
  constructor() {
    this.events = {};
  }
  
  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} callback - Callback function to execute when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    // Create event array if it doesn't exist
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    
    // Add callback to event array
    this.events[eventName].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.off(eventName, callback);
    };
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event to unsubscribe from
   * @param {Function} callback - Callback function to remove
   */
  off(eventName, callback) {
    // Return if event doesn't exist
    if (!this.events[eventName]) return;
    
    // Filter out callback from event array
    this.events[eventName] = this.events[eventName].filter(
      cb => cb !== callback
    );
  }
  
  /**
   * Emit an event with data
   * @param {string} eventName - Name of the event to emit
   * @param {*} data - Data to pass to event handlers
   */
  emit(eventName, data) {
    // Return if event doesn't exist
    if (!this.events[eventName]) return;
    
    // Call each callback with data
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }
  
  /**
   * Subscribe to an event once
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} callback - Callback function to execute when event is emitted
   */
  once(eventName, callback) {
    // Create wrapper function that will unsubscribe after first call
    const onceWrapper = data => {
      callback(data);
      this.off(eventName, onceWrapper);
    };
    
    // Subscribe to event with wrapper
    this.on(eventName, onceWrapper);
  }
  
  /**
   * Clear all event subscriptions
   */
  clear() {
    this.events = {};
  }
}

// Create a singleton instance
const eventBus = new EventBus();