// main.js - main app entry point

// Main application class
class MusicGlobeApp {
    constructor() {
      // Initialize components
      this.dataService = new DataService();
      this.globe = new Globe(document.getElementById('globe-container'));
      this.musicPlayer = new MusicPlayer();
      
      // Initialize state
      this.selectedCity = null;
      
      // Bind event handlers
      this._onCitySelected = this._onCitySelected.bind(this);
      this._onPlayerClosed = this._onPlayerClosed.bind(this);
      
      // Add event listeners
      document.addEventListener('city-selected', (event) => this._onCitySelected(event.detail));
      document.addEventListener('player-closed', this._onPlayerClosed);
    }
    
    //Initialize the application
    async init() {
      try {
        // Show loading state
        this._showLoading(true);
        
        // Initialize globe component
        await this.globe.init();
        
        // Load city data
        const cities = await this.dataService.loadCityData();
        
        // Set cities on globe
        this.globe.setCities(cities);
        
        // Position camera at initial location
        this._goToInitialLocation();
        
        // Hide loading state
        this._showLoading(false);
      } catch (error) {
        console.error('Error initializing application:', error);
        this._showError('Failed to initialize the application. Please try refreshing the page.');
      }
    }
    
    // Go to the initial location set in config
    _goToInitialLocation() {
      const { latitude, longitude } = CONFIG.initialLocation;
      // Find a city close to the initial location or use the first city
      const allCities = this.dataService.cities;
      
      if (allCities.length > 0) {
        let closestCity = allCities[0];
        let closestDistance = Number.MAX_VALUE;
        
        allCities.forEach(city => {
          const distance = GeoUtils.getDistanceInKm(latitude, longitude, city.lat, city.lng);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestCity = city;
          }
        });
        
        // Rotate globe to the city but don't select it
        this.globe._rotateGlobeToLocation(closestCity.lat, closestCity.lng);
      }
    }
    
    // Show/hide application loading state
    _showLoading(isLoading) {
      // Check if loading element exists
      let loadingElement = document.querySelector('.app-loading');
      
      if (isLoading) {
        // Create loading element if it doesn't exist
        if (!loadingElement) {
          loadingElement = document.createElement('div');
          loadingElement.className = 'app-loading';
          
          const spinner = document.createElement('div');
          spinner.className = 'loading-spinner';
          
          const message = document.createElement('div');
          message.className = 'loading-message';
          message.textContent = 'Loading Music Globe App...';
          
          loadingElement.appendChild(spinner);
          loadingElement.appendChild(message);
          document.body.appendChild(loadingElement);
        }
        
        // Show loading element
        loadingElement.style.display = 'flex';
      } else if (loadingElement) {
        // Hide loading element with a fade-out effect
        loadingElement.style.opacity = '0';
        
        // Remove from DOM after animation
        setTimeout(() => {
          if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
          }
        }, 300);
      }
    }
    
    // Show error message
    _showError(message) {
      // Check if error element exists
      let errorElement = document.querySelector('.app-error');
      
      // Create error element if it doesn't exist
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'app-error';
        
        const content = document.createElement('div');
        content.className = 'error-content';
        
        const title = document.createElement('h2');
        title.textContent = 'Error';
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = 'Reload';
        button.addEventListener('click', () => window.location.reload());
        
        content.appendChild(title);
        content.appendChild(messageElement);
        content.appendChild(button);
        errorElement.appendChild(content);
        document.body.appendChild(errorElement);
      } else {
        // Update existing error message
        const messageElement = errorElement.querySelector('p');
        if (messageElement) {
          messageElement.textContent = message;
        }
      }
      
      // Show error element
      errorElement.style.display = 'flex';
    }
    
    // Handle city selection
    _onCitySelected(detail) {
      const { cityId, city } = detail;
      
      // Update selected city
      this.selectedCity = city;
      
      // Update globe selected marker
      this.globe.selectCity(cityId);
      
      // Load city music in player
      this.musicPlayer.loadCity(city);
    }
    
    // Handle player closed event
    _onPlayerClosed() {
      // Clear selected city
      this.selectedCity = null;
      
      // Clear globe selected marker
      this.globe.selectCity(null);
    }
    
    // Clean up resources when application is destroyed

    destroy() {
      // Remove event listeners
      document.removeEventListener('city-selected', this._onCitySelected);
      document.removeEventListener('player-closed', this._onPlayerClosed);
      
      // Destroy components
      this.globe.destroy();
      this.musicPlayer.destroy();
    }
  }
  
  function preloadAudioFiles() {
    console.log('Preloading audio files...');
    
    // Get all cities
    fetch('assets/data/cities.json')
      .then(response => response.json())
      .then(cities => {
        // Extract all audio URLs
        const audioUrls = [];
        cities.forEach(city => {
          if (city.playlist) {
            city.playlist.forEach(track => {
              if (track.url) {
                audioUrls.push(track.url);
              }
            });
          }
        });
        
        console.log('Found', audioUrls.length, 'audio files to preload');
        
        // Create hidden audio elements to force browser to request files
        audioUrls.forEach(url => {
          const audio = new Audio();
          audio.preload = 'metadata'; // Just load metadata, not full file
          audio.src = url;
          
          // Log success or failure
          audio.addEventListener('loadedmetadata', () => {
            console.log('✓ Audio file metadata loaded:', url);
          });
          
          audio.addEventListener('error', (e) => {
            console.error('✗ Audio file not found:', url, e);
          });
        });
      })
      .catch(error => {
        console.error('Error loading cities data:', error);
      });
  }

  // Initialize application when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing application");
    
    // Display debugging info
    console.log("Window dimensions:", window.innerWidth, "x", window.innerHeight);
    console.log("Globe container:", document.getElementById('globe-container'));
    console.log("Music player:", document.getElementById('music-player'));
    
    // Add a small delay to ensure all resources are loaded
    setTimeout(() => {
      try {
        // Create app instance
        const app = new MusicGlobeApp();

        // // preload audio files
        preloadAudioFiles();

        // Initialize app
        app.init().catch(error => {
          console.error('Failed to initialize application:', error);
          alert('Error initializing application. See console for details.');
        });
        
        // Store app instance on window for debugging
        window.app = app;
      } catch (error) {
        console.error('Critical error during app initialization:', error);
        alert('Critical error initializing application. See console for details.');
      }
    }, 500);
  });