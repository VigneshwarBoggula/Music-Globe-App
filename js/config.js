// config.js - app configuration constants

const CONFIG = {
  // Globe configuration
  globe: {
    radius: 200,                            // Size of the globe
    segments: 64,                           // Detail level of globe sphere
    cameraDistance: 600,                    // Initial camera distance
    cameraMaxDistance: 700,                 // Maximum camera zoom out
    cameraMinDistance: 300,                 // Minimum camera zoom in (closest)
    markerSize: 1.5,                        // Size of city markers (reduced)
    markerColor: 0xcc3232,                  // Color of city markers
    markerHoverColor: 0xe7b416,             // Color of marker when hovered
    markerActiveColor: 0x2dc937,            // Color of marker when active/selected
    markerHeight: 0.001,                    // Height of marker above globe surface (reduced to almost on the surface)
    earthTexturePath: "assets/img/earth-texture.jpg"
  },
  
  // Data configuration
  data: {
    citiesDataPath: "assets/data/cities.json",
    maxCityLabels: 15,                      // Maximum number of city labels to show at once
    labelDistanceThreshold: 0.7             // How close camera needs to be to show labels (0-1)
  },
  
  // Music player configuration
  player: {
    fadeInDuration: 300,                    // Fade-in duration for player in ms
    fadeOutDuration: 200,                   // Fade-out duration for player in ms
    crossFadeDuration: 2000,                // Audio crossfade duration in ms
  },
  
  // Interaction configuration
  controls: {
    rotateSpeed: 0.5,                       // Globe rotation speed with mouse/touch
    dampingFactor: 0.1,                     // Controls inertia/smoothing
    zoomSpeed: 1.0,                         // Camera zoom speed
    keyboardRotateSpeed: 2.0                // Rotation speed when using keyboard
  },
  
  // Initial start location (coordinates for camera to point at on load)
  initialLocation: {
    latitude: 40.7128,                      // New York latitude
    longitude: -74.0060                     // New York longitude
  },
  
  // UI configuration
  ui: {
    tooltipShowDelay: 200,                  // Delay before showing tooltip in ms
    tooltipHideDelay: 100                   // Delay before hiding tooltip in ms
  },

  // Audio player configuration
  audio: {
    preloadStrategy: 'auto',        // 'auto', 'metadata', or 'none'
    preloadNextTrack: true,         // Whether to preload the next track in playlist
    maxConcurrentLoads: 2,          // Maximum number of tracks loading simultaneously
    showLoadingIndicators: true,    // Whether to show loading indicators
    bufferingThreshold: 5000,       // Milliseconds of audio to buffer before playing (5 seconds)
    streamingChunkSize: 1024 * 64,  // 64KB chunks for stream loading (if supported by server)
    lowBandwidthMode: false,        // Enable for cellular connections or slow networks
    preferredFormat: 'mp3',      
    preferredBitrate: 128,          
    allowFormatFallback: false
  }
};