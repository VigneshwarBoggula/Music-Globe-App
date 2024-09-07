// MusicPlayer.js - Music player component

class MusicPlayer {
  constructor() {
    // DOM elements
    this.container = document.getElementById('music-player');
    this.cityNameElement = document.getElementById('city-name');
    this.cityDescriptionElement = document.getElementById('city-description');
    this.playlistElement = document.getElementById('playlist-items');
    this.currentTrackInfoElement = document.getElementById('current-track-info');
    this.audioElement = document.getElementById('audio-player');
    this.closeButton = document.getElementById('close-player');
    
    // State
    this.currentCity = null;
    this.playlist = [];
    this.currentTrackIndex = -1;
    this.isPlaying = false;
    
    // Bind event handlers
    this._onCloseButtonClick = this._onCloseButtonClick.bind(this);
    this._onAudioEnded = this._onAudioEnded.bind(this);
    this._onTrackClick = this._onTrackClick.bind(this);
    
    // Add event listeners
    this.closeButton.addEventListener('click', this._onCloseButtonClick);
    this.audioElement.addEventListener('ended', this._onAudioEnded);
    this.audioElement.addEventListener('play', () => { this.isPlaying = true; });
    this.audioElement.addEventListener('pause', () => { this.isPlaying = false; });
  }
  
  /**
   * Load and display a city's music
   * @param {Object} city - City data object with playlist information
   */
  loadCity(city) {
    // Save reference to current city
    this.currentCity = city;
    
    // Update header information
    this.cityNameElement.textContent = city.name;
    this.cityDescriptionElement.textContent = city.description;
    
    // Clear current playlist
    this.playlist = [];
    this.playlistElement.innerHTML = '';
    
    // Reset current track
    this.currentTrackIndex = -1;
    this.currentTrackInfoElement.textContent = 'Select a track to play';
    this.audioElement.src = '';
    this.audioElement.pause();
    
    // Create playlist items
    city.playlist.forEach((track, index) => {
      this.playlist.push(track);
      this._createPlaylistItem(track, index);
    });
    
    // Show the player
    this.show();
  }
  
  /**
   * Create a playlist item DOM element
   * @param {Object} track - Track data
   * @param {number} index - Index in the playlist
   * @private
   */
  _createPlaylistItem(track, index) {
    const listItem = document.createElement('li');
    listItem.className = 'playlist-item';
    listItem.dataset.index = index;
    
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'track-details';
    
    const title = document.createElement('div');
    title.className = 'track-title';
    title.textContent = track.title;
    
    const artist = document.createElement('div');
    artist.className = 'track-artist';
    artist.textContent = track.artist;
    
    const metaContainer = document.createElement('div');
    metaContainer.className = 'track-meta';
    
    // Create badge for decade
    if (track.decade) {
      const badge = document.createElement('span');
      badge.className = `badge badge-decade-${track.decade.toLowerCase()}`;
      badge.textContent = track.decade;
      metaContainer.appendChild(badge);
    }
    
    // Add year if available
    if (track.year) {
      const yearSpan = document.createElement('span');
      yearSpan.className = 'track-year';
      yearSpan.textContent = track.year;
      metaContainer.appendChild(yearSpan);
    }
    
    // Add tooltip with track details
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip-text';
    tooltip.textContent = `${track.title} - ${track.year}`;
    
    // Assemble the list item
    detailsContainer.appendChild(title);
    detailsContainer.appendChild(artist);
    detailsContainer.appendChild(metaContainer);
    listItem.appendChild(detailsContainer);
    
    // Add event listeners
    listItem.addEventListener('click', () => this._onTrackClick(index));
    
    // Add to the playlist element
    this.playlistElement.appendChild(listItem);
  }
  
  /**
   * Play a track by index
   * @param {number} index - Index of the track to play
   */
  playTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;
    
    // Update track index
    this.currentTrackIndex = index;
    const track = this.playlist[index];
    
    // Update audio source
    this.audioElement.src = track.url;
    
    // Update track info display
    this.currentTrackInfoElement.textContent = `Now playing: ${track.title} - ${track.artist}`;
    
    // Update playlist visual state
    this._updatePlaylistState();
    
    // Play the audio
    this.audioElement.play().catch(error => {
      console.error('Error playing audio:', error);
      this.currentTrackInfoElement.textContent = 'Error playing track. Please try again.';
    });
  }
  
  /**
   * Play the next track in the playlist
   */
  playNextTrack() {
    const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.playTrack(nextIndex);
  }
  
  /**
   * Play the previous track in the playlist
   */
  playPreviousTrack() {
    const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(prevIndex);
  }
  
  /**
   * Update the visual state of the playlist
   * @private
   */
  _updatePlaylistState() {
    // Remove active class from all items
    const items = this.playlistElement.querySelectorAll('.playlist-item');
    items.forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current track
    if (this.currentTrackIndex >= 0) {
      const currentItem = this.playlistElement.querySelector(`.playlist-item[data-index="${this.currentTrackIndex}"]`);
      if (currentItem) {
        currentItem.classList.add('active');
      }
    }
  }
  
  /**
   * Show the music player
   */
  show() {
    // Remove hidden class to show player
    this.container.classList.remove('hidden');
    
    // Add a small delay before transitioning in for smoother animation
    setTimeout(() => {
      this.container.style.opacity = '1';
      this.container.style.transform = 'translateX(0)';
    }, 10);
  }
  
  /**
   * Hide the music player
   */
  hide() {
    // Add transition out effect
    this.container.style.opacity = '0';
    this.container.style.transform = 'translateX(calc(100% + 2rem))';
    
    // Add hidden class after transition completes
    setTimeout(() => {
      this.container.classList.add('hidden');
      
      // Pause audio if playing
      if (this.isPlaying) {
        this.audioElement.pause();
      }
    }, CONFIG.player.fadeOutDuration);
  }
  
  /**
   * Handle track click event
   * @param {number} index - Index of the clicked track
   * @private
   */
  _onTrackClick(index) {
    this.playTrack(index);
  }
  
  /**
   * Handle audio ended event to auto-play next track
   * @private
   */
  _onAudioEnded() {
    this.playNextTrack();
  }
  
  /**
   * Handle close button click event
   * @private
   */
  _onCloseButtonClick() {
    this.hide();
    
    // Dispatch event to notify app that player was closed
    const closeEvent = new CustomEvent('player-closed');
    document.dispatchEvent(closeEvent);
  }
  
  /**
   * Clean up resources when component is destroyed
   */
  destroy() {
    // Remove event listeners
    this.closeButton.removeEventListener('click', this._onCloseButtonClick);
    this.audioElement.removeEventListener('ended', this._onAudioEnded);
    
    // Remove playlist item event listeners
    const items = this.playlistElement.querySelectorAll('.playlist-item');
    items.forEach(item => {
      const index = parseInt(item.dataset.index);
      item.removeEventListener('click', () => this._onTrackClick(index));
    });
    
    // Pause and clear audio
    this.audioElement.pause();
    this.audioElement.src = '';
  }
}