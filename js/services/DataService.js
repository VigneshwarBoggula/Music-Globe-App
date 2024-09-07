// DataService.js - handles data loading and processing

class DataService {
  constructor() {
    this.cities = [];
    this.isLoaded = false;
  }
  
  /**
   * Load city data from JSON file
   * @returns {Promise} Promise resolving to city data array
   */
  async loadCityData() {
    try {
      const response = await fetch(CONFIG.data.citiesDataPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load city data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cities = this._processCityData(data);
      this.isLoaded = true;
      
      return this.cities;
    } catch (error) {
      console.error('Error loading city data:', error);
      // Return an empty array
      return [];
    }
  }
  
  /**
   * Process the raw city data
   * @param {Array} rawData - Raw city data from JSON
   * @returns {Array} Processed city data
   * @private
   */
  _processCityData(rawData) {
    // Process data if needed (filtering, transforming, etc.)
    return rawData.map(city => ({
      ...city,
      // Add any additional processing or computed properties here
      id: city.id || `city-${city.name.toLowerCase().replace(/\s+/g, '-')}`,
      // Process playlist items to ensure all required fields
      playlist: Array.isArray(city.playlist) ? city.playlist.map(track => ({
        ...track,
        // Ensure track has all needed fields
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        year: track.year || 'Unknown Year',
        decade: track.decade || this._getDecadeFromYear(track.year),
        url: track.url || '#'
      })) : []
    }));
  }
  
  /**
   * Helper function to derive decade from year if missing
   * @param {number} year - Year of the track
   * @returns {string} Decade string (e.g., '00s', '10s', '20s')
   * @private
   */
  _getDecadeFromYear(year) {
    if (!year || isNaN(year)) return 'Unknown';
    const decadeStart = Math.floor(year % 100 / 10) * 10;
    return `${decadeStart.toString().padStart(2, '0')}s`;
  }
  
  /**
   * Get city by ID
   * @param {string} cityId - ID of the city to retrieve
   * @returns {Object|null} City data or null if not found
   */
  getCityById(cityId) {
    return this.cities.find(city => city.id === cityId) || null;
  }
  
  /**
   * Filter cities by search query
   * @param {string} query - Search query
   * @returns {Array} Filtered cities
   */
  searchCities(query) {
    if (!query || query.trim() === '') {
      return this.cities;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.cities.filter(city => {
      // Search by name, country, or region
      return (
        city.name.toLowerCase().includes(normalizedQuery) ||
        city.country.toLowerCase().includes(normalizedQuery) ||
        (city.region && city.region.toLowerCase().includes(normalizedQuery))
      );
    });
  }
}