// GeoUtils.js - geography utility functions

const GeoUtils = {
  /**
   * Convert latitude and longitude to 3D vector coordinates
   * @param {number} lat - Latitude in degrees
   * @param {number} lng - Longitude in degrees
   * @param {number} radius - Radius of the sphere
   * @returns {Object} Vector with x, y, z properties
   */
  latLngToVector3: function(lat, lng, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return { x, y, z };
  },
  
  /**
   * Convert 3D vector coordinates to latitude and longitude
   * @param {Object} vector - Vector with x, y, z properties
   * @returns {Object} Object with lat and lng properties
   */
  vector3ToLatLng: function(vector) {
    const { x, y, z } = vector;
    
    // Calculate radius
    const radius = Math.sqrt(x*x + y*y + z*z);
    
    // Calculate latitude
    const phi = Math.acos(y / radius);
    const lat = 90 - (phi * 180 / Math.PI);
    
    // Calculate longitude
    const theta = Math.atan2(z, -x);
    const lng = (theta * 180 / Math.PI) - 180;
    
    return { lat, lng };
  },
  
  /**
   * Calculate the distance between two lat/lng points in kilometers
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lng1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lng2 - Longitude of point 2
   * @returns {number} Distance in kilometers
   */
  getDistanceInKm: function(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this._degToRad(lat2 - lat1);
    const dLng = this._degToRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this._degToRad(lat1)) * Math.cos(this._degToRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  /**
   * Get bearing between two points
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lng1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lng2 - Longitude of point 2
   * @returns {number} Bearing in degrees
   */
  getBearing: function(lat1, lng1, lat2, lng2) {
    const dLng = this._degToRad(lng2 - lng1);
    
    const y = Math.sin(dLng) * Math.cos(this._degToRad(lat2));
    const x = Math.cos(this._degToRad(lat1)) * Math.sin(this._degToRad(lat2)) -
              Math.sin(this._degToRad(lat1)) * Math.cos(this._degToRad(lat2)) * Math.cos(dLng);
              
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360; // Normalize to 0-360
    
    return bearing;
  },
  
  /**
   * Get midpoint between two lat/lng points
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lng1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lng2 - Longitude of point 2
   * @returns {Object} Object with lat and lng properties
   */
  getMidpoint: function(lat1, lng1, lat2, lng2) {
    // Convert to radians
    const λ1 = this._degToRad(lng1);
    const λ2 = this._degToRad(lng2);
    const φ1 = this._degToRad(lat1);
    const φ2 = this._degToRad(lat2);
    
    const Bx = Math.cos(φ2) * Math.cos(λ2 - λ1);
    const By = Math.cos(φ2) * Math.sin(λ2 - λ1);
    
    const φ3 = Math.atan2(
      Math.sin(φ1) + Math.sin(φ2),
      Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By)
    );
    
    const λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
    
    const lat = this._radToDeg(φ3);
    const lng = this._radToDeg(λ3);
    
    return { lat, lng };
  },
  
  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   * @private
   */
  _degToRad: function(degrees) {
    return degrees * Math.PI / 180;
  },
  
  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   * @private
   */
  _radToDeg: function(radians) {
    return radians * 180 / Math.PI;
  }
};