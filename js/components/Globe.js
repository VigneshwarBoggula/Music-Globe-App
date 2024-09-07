// Globe.js - 3D Globe visualization component

class Globe {
  constructor(containerElement) {
    this.container = containerElement;
    this.cities = [];
    this.markers = [];
    this.cityLabels = [];
    this.selectedMarker = null;
    this.isInitialized = false;
    this.lastUpdateTime = 0;

    // Initialize Three.js objects
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.earthMesh = null;
    this.markerGroup = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Add loading indicator
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'globe-loading';
    this.loadingElement.textContent = 'Loading Globe...';
    this.container.appendChild(this.loadingElement);

    // Bind event handlers
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onMouseWheel = this._onMouseWheel.bind(this);
    this._animate = this._animate.bind(this);
  }

  // Initialize the globe component
  async init() {
    if (this.isInitialized) return;

    console.log("Initializing Globe component");
    console.log("Container dimensions:", this.container.clientWidth, "x", this.container.clientHeight);

    // Create renderer with explicit dimensions if container size is zero
    const width = Math.max(this.container.clientWidth, 800);
    const height = Math.max(this.container.clientHeight, 600);
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      canvas: document.createElement('canvas')
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000408, 1);
    this.container.appendChild(this.renderer.domElement);
    
    console.log("Renderer created", this.renderer);

    // Create camera with safe aspect ratio
    this.camera = new THREE.PerspectiveCamera(
      45, 
      width / height, 
      1, 
      2000
    );
    this.camera.position.z = CONFIG.globe.cameraDistance;
    console.log("Camera created", this.camera);

    // Create controls with safety checks
    if (!THREE.OrbitControls) {
      console.error("THREE.OrbitControls is not defined. Make sure it's properly loaded.");
      return;
    }
    
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = CONFIG.controls.dampingFactor;
    this.controls.rotateSpeed = CONFIG.controls.rotateSpeed;
    this.controls.zoomSpeed = CONFIG.controls.zoomSpeed;
    this.controls.minDistance = CONFIG.globe.cameraMinDistance;
    this.controls.maxDistance = CONFIG.globe.cameraMaxDistance;
    this.controls.enablePan = false;
    console.log("Controls created", this.controls);

    // Create scene lights
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 7.0);
    this.scene.add(ambientLight);
    
    // Add a subtle hemisphere light for natural sky/ground reflection
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaff, 0x806040, 0.3);
    this.scene.add(hemisphereLight);

    // Create Earth mesh
    await this._createEarth();

    // Create marker group to hold all city markers
    this.markerGroup = new THREE.Group();
    this.scene.add(this.markerGroup);

    // Add event listeners
    window.addEventListener('resize', this._onWindowResize);
    this.renderer.domElement.addEventListener('mousemove', this._onMouseMove);
    this.renderer.domElement.addEventListener('click', this._onClick);
    this.renderer.domElement.addEventListener('wheel', this._onMouseWheel);

    // Set initialized flag
    this.isInitialized = true;

    // Remove loading element
    this.container.removeChild(this.loadingElement);

    // Start animation loop
    this._animate();
  }

  /**
   * Load city data and create markers
   * @param {Array} cities - Array of city data objects
   */
  setCities(cities) {
    this.cities = cities;
    
    // Clear existing markers
    if (this.markerGroup) {
      while (this.markerGroup.children.length) {
        const child = this.markerGroup.children[0];
        this.markerGroup.remove(child);
      }
    }
    
    this.markers = [];
    
    // Remove existing DOM city labels
    this.cityLabels.forEach(label => {
      if (label.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    this.cityLabels = [];

    // Create new markers for each city
    this.cities.forEach(city => {
      this._createCityMarker(city);
    });
  }

  /**
   * Select a city marker by ID
   * @param {string} cityId - The ID of the city to select
   */
  selectCity(cityId) {
    // Deselect current marker if there is one
    if (this.selectedMarker) {
      const prevMarker = this.selectedMarker;
      this.selectedMarker.material.color.setHex(CONFIG.globe.markerColor);
      this.selectedMarker = null;
    }

    // Find and select the new marker
    const markerIndex = this.markers.findIndex(m => m.userData.cityId === cityId);
    if (markerIndex >= 0) {
      this.selectedMarker = this.markers[markerIndex];
      this.selectedMarker.material.color.setHex(CONFIG.globe.markerActiveColor);
      
      // Move camera to look at the selected city
      const city = this.cities.find(c => c.id === cityId);
      if (city) {
        this._rotateGlobeToLocation(city.lat, city.lng);
      }
    }
  }

  /**
   * Create the Earth sphere with texture
   * @private
   */
  async _createEarth() {
    return new Promise((resolve, reject) => {
      console.log("Creating Earth sphere");
      
      // Create immediate basic colored sphere rather than waiting for texture
      const geometry = new THREE.SphereGeometry(
        CONFIG.globe.radius, 
        CONFIG.globe.segments, 
        CONFIG.globe.segments
      );
      
      // Start with a basic colored sphere
      const material = new THREE.MeshPhongMaterial({
        color: 0x2266aa,
        shininess: 25,
        specular: 0x333333
      });
      
      this.earthMesh = new THREE.Mesh(geometry, material);
      this.scene.add(this.earthMesh);
      console.log("Basic Earth added to scene", this.earthMesh);
      
      // Attempt to load texture in background
      const textureLoader = new THREE.TextureLoader();
      
      // Use a fallback texture URL in case the configured one doesn't work
      const textureUrl = CONFIG.globe.earthTexturePath || 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
      
      console.log("Loading Earth texture from:", textureUrl);
      
      textureLoader.load(
        textureUrl,
        (texture) => {
          console.log("Texture loaded successfully");
          // Update the material with the loaded texture
          this.earthMesh.material.map = texture;
          this.earthMesh.material.needsUpdate = true;
        },
        (progress) => {
          console.log("Texture loading progress:", progress);
        },
        (error) => {
          console.error('Error loading Earth texture:', error);
          // Already have fallback sphere, so just continue
        }
      );
      
      // Resolve immediately since we have at least the basic sphere
      resolve();
    });
  }

  /**
   * Create a marker for a city
   * @param {Object} city - City data object
   * @private
   */
  _createCityMarker(city) {
    // Convert lat/lng to 3D position on the globe surface
    const surfacePosition = this._latLngToVector3(city.lat, city.lng, CONFIG.globe.radius);
    
    // Create slightly elevated position for the marker (just enough to prevent z-fighting)
    const position = this._latLngToVector3(city.lat, city.lng, CONFIG.globe.radius * (1 + CONFIG.globe.markerHeight));
    
    // Create marker geometry and material
    const geometry = new THREE.SphereGeometry(CONFIG.globe.markerSize, 16, 16);
    const material = new THREE.MeshPhongMaterial({ 
      color: CONFIG.globe.markerColor,
      emissive: CONFIG.globe.markerColor,
      emissiveIntensity: 0.3,
      shininess: 30
    });
    
    // Create marker mesh
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(position);
    marker.userData = { cityId: city.id, city: city };
    this.markerGroup.add(marker);
    this.markers.push(marker);

    // Create the city label DOM element
    const label = document.createElement('div');
    label.className = 'city-label';
    label.textContent = city.name;
    label.style.display = 'none'; // Initially hidden
    this.container.appendChild(label);
    
    // Store reference to the label
    city.labelElement = label;
    this.cityLabels.push(label);
  }

  /**
   * Convert latitude/longitude to 3D coordinates
   * @param {number} lat - Latitude in degrees
   * @param {number} lng - Longitude in degrees
   * @param {number} radius - Radius to place the point at
   * @returns {THREE.Vector3} The 3D position
   * @private
   */
  _latLngToVector3(lat, lng, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Rotate the globe to face a specific latitude/longitude
   * @param {number} lat - Latitude in degrees
   * @param {number} lng - Longitude in degrees
   * @private
   */
  _rotateGlobeToLocation(lat, lng) {
    // Convert lat/lng to Cartesian coords
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    
    // Calculate target position
    const x = -Math.sin(phi) * Math.cos(theta);
    const y = Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta);
    
    // Create temporary vector and normalize
    const target = new THREE.Vector3(x, y, z);
    target.multiplyScalar(CONFIG.globe.cameraDistance);
    
    // Set up animation to rotate camera
    const startRotation = this.camera.position.clone();
    const startTime = Date.now();
    const duration = 1000; // 1 second animation
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        // Use easing function for smooth transition
        const easeProgress = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
          
        // Interpolate camera position
        this.camera.position.lerpVectors(startRotation, target, easeProgress);
        this.camera.lookAt(0, 0, 0);
        
        requestAnimationFrame(animateCamera);
      } else {
        // Final position
        this.camera.position.copy(target);
        this.camera.lookAt(0, 0, 0);
      }
    };
    
    animateCamera();
  }

  /**
   * Handle window resize event
   * @private
   */
  _onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  /**
   * Handle mouse move event for hover effects
   * @param {Event} event - Mouse event
   * @private
   */
  _onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Reset any highlighted markers
    this.markers.forEach(marker => {
      if (marker !== this.selectedMarker) {
        marker.material.color.setHex(CONFIG.globe.markerColor);
      }
    });
    
    // Check for intersections
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers);
    
    if (intersects.length > 0) {
      const marker = intersects[0].object;
      if (marker !== this.selectedMarker) {
        marker.material.color.setHex(CONFIG.globe.markerHoverColor);
      }
      
      // Show city name as tooltip
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'default';
    }
  }

  /**
   * Handle click event for selecting markers
   * @param {Event} event - Mouse event
   * @private
   */
  _onClick(event) {
    // Calculate mouse position in normalized device coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Check for intersections
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers);
    
    if (intersects.length > 0) {
      const marker = intersects[0].object;
      const city = marker.userData.city;
      
      // Dispatch event to notify app that a city was selected
      const selectEvent = new CustomEvent('city-selected', { 
        detail: { cityId: city.id, city: city } 
      });
      document.dispatchEvent(selectEvent);
    }
  }

  /**
   * Handle mouse wheel event for zooming
   * @param {Event} event - Wheel event
   * @private
   */
  _onMouseWheel(event) {
    // The OrbitControls will handle the zoom, this is just for additional functionality
    // We can use this to adjust label visibility based on zoom level
    this._updateCityLabels();
  }

  /**
   * Update city label positions and visibility
   * @private
   */
  _updateCityLabels() {
    if (!this.cities || !this.camera) return;
    
    // Get camera distance as percentage of max distance for label threshold
    const distanceRatio = this.camera.position.length() / CONFIG.globe.cameraMaxDistance;
    const showLabels = distanceRatio < CONFIG.data.labelDistanceThreshold;
    
    // Calculate which labels to show based on camera position
    const visibleLabels = [];
    
    this.markers.forEach((marker, index) => {
      const city = marker.userData.city;
      const label = city.labelElement;
      
      // Project 3D position to 2D screen position
      const screenPos = marker.position.clone().project(this.camera);
      
      // Convert to screen coordinates
      const x = (screenPos.x * 0.5 + 0.5) * this.renderer.domElement.clientWidth;
      const y = (1 - (screenPos.y * 0.5 + 0.5)) * this.renderer.domElement.clientHeight;
      
      // Check if marker is in front of the globe (z < 0 means behind)
      const isBehindGlobe = screenPos.z > 0;
      
      // Store distance and DOM element for visibility determination
      if (showLabels && !isBehindGlobe) {
        visibleLabels.push({
          dist: this.camera.position.distanceTo(marker.position),
          label,
          x,
          y
        });
      } else {
        // Hide label if not visible
        label.style.display = 'none';
      }
    });
    
    // Sort labels by distance to camera (closest first)
    visibleLabels.sort((a, b) => a.dist - b.dist);
    
    // Show only a limited number of labels to prevent overcrowding
    const maxLabels = Math.min(CONFIG.data.maxCityLabels, visibleLabels.length);
    
    for (let i = 0; i < visibleLabels.length; i++) {
      const labelData = visibleLabels[i];
      
      if (i < maxLabels) {
        // Position and show label
        labelData.label.style.left = `${labelData.x}px`;
        labelData.label.style.top = `${labelData.y - 15}px`; // Offset above marker
        labelData.label.style.display = 'block';
      } else {
        // Hide excess labels
        labelData.label.style.display = 'none';
      }
    }
  }

  /**
   * Animation loop
   * @private
   */
  _animate() {
    requestAnimationFrame(this._animate);
    
    const time = Date.now();
    
    // Only update on animation frames for performance
    if (time - this.lastUpdateTime > 16) { // ~60fps
      this.lastUpdateTime = time;
      
      // Update controls
      this.controls.update();
      
      // Update city labels
      this._updateCityLabels();
      
      // Auto-rotation removed
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Clean up resources when component is destroyed
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this._onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('mousemove', this._onMouseMove);
      this.renderer.domElement.removeEventListener('click', this._onClick);
      this.renderer.domElement.removeEventListener('wheel', this._onMouseWheel);
    }
    
    // Remove DOM elements
    this.cityLabels.forEach(label => {
      if (label.parentNode) {
        label.parentNode.removeChild(label);
      }
    });
    
    // Dispose Three.js objects
    if (this.earthMesh) {
      this.earthMesh.geometry.dispose();
      this.earthMesh.material.dispose();
    }
    
    this.markers.forEach(marker => {
      marker.geometry.dispose();
      marker.material.dispose();
    });
    
    // Remove from DOM
    if (this.renderer) {
      this.container.removeChild(this.renderer.domElement);
      this.renderer.dispose();
    }
  }
}