// CityMarker.js - city marker component for globe

class CityMarker {
  constructor(city, position, scene) {
    this.city = city;
    this.position = position;
    this.scene = scene;
    this.mesh = null;
    this.isHovered = false;
    this.isSelected = false;
    
    // Create the marker
    this._createMarker();
  }
  
  // Create the 3D marker mesh
  _createMarker() {
    // Create marker geometry and material
    const geometry = new THREE.SphereGeometry(CONFIG.globe.markerSize, 16, 16);
    const material = new THREE.MeshPhongMaterial({ 
      color: CONFIG.globe.markerColor,
      emissive: CONFIG.globe.markerColor,
      emissiveIntensity: 0.3,
      shininess: 30,
      transparent: true,
      opacity: 0.9
    });
    
    // Create marker mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    
    // Add metadata to the mesh for raycasting
    this.mesh.userData = { 
      cityId: this.city.id,
      type: 'cityMarker',
      instance: this
    };
    
    // Add pulse effect (if desired)
    this._addPulseEffect();
  }
  
  // Add a pulse effect to the marker
  _addPulseEffect() {
    // Create a larger translucent sphere that pulsates
    const pulseGeometry = new THREE.SphereGeometry(CONFIG.globe.markerSize * 2, 16, 16);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.globe.markerColor,
      transparent: true,
      opacity: 0.3
    });
    
    this.pulseMesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
    this.pulseMesh.position.copy(this.position);
    this.pulseMesh.scale.set(1, 1, 1);
    
    // Add to scene to render it independently
    this.scene.add(this.pulseMesh);
    
    // Start the pulse animation
    this._animatePulse();
  }
  
  // Animate the pulse effect
  _animatePulse() {
    // Base scale (fully contracted)
    let scale = 1;
    // Direction (1 = expanding, -1 = contracting)
    let direction = 1;
    // Speed of pulsing
    const speed = 0.02;
    // Min/max scale
    const minScale = 1;
    const maxScale = 1.5;
    
    const animate = () => {
      // Only animate if the marker is selected
      if (this.isSelected) {
        // Update scale
        scale += direction * speed;
        
        // Reverse direction at min/max
        if (scale >= maxScale) {
          direction = -1;
        } else if (scale <= minScale) {
          direction = 1;
        }
        
        // Apply scale
        this.pulseMesh.scale.set(scale, scale, scale);
      } else {
        // Reset scale when not selected
        this.pulseMesh.scale.set(1, 1, 1);
        
        // If hovered, make pulse visible but don't animate
        this.pulseMesh.visible = this.isHovered;
      }
      
      // Continue animation loop
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
  }
  
  // Set the hover state of the marker
  setHovered(isHovered) {
    this.isHovered = isHovered;
    
    // Update material color
    if (this.isSelected) {
      // If selected, don't change the color
      return;
    }
    
    const color = isHovered ? CONFIG.globe.markerHoverColor : CONFIG.globe.markerColor;
    this.mesh.material.color.setHex(color);
    
    if (this.pulseMesh) {
      this.pulseMesh.material.color.setHex(color);
      this.pulseMesh.visible = isHovered;
    }
  }
  
  // Set the selected state of the marker
  setSelected(isSelected) {
    this.isSelected = isSelected;
    
    // Update material color
    const color = isSelected ? CONFIG.globe.markerActiveColor : 
                 (this.isHovered ? CONFIG.globe.markerHoverColor : CONFIG.globe.markerColor);
                 
    this.mesh.material.color.setHex(color);
    
    if (this.pulseMesh) {
      this.pulseMesh.material.color.setHex(color);
      this.pulseMesh.visible = true;
    }
  }
  
  // Update the marker's position
  updatePosition(newPosition) {
    this.position.copy(newPosition);
    this.mesh.position.copy(newPosition);
    
    if (this.pulseMesh) {
      this.pulseMesh.position.copy(newPosition);
    }
  }
  
  // Get the 3D mesh for this marker
  getMesh() {
    return this.mesh;
  }
  
  // Clean up resources when marker is removed
  destroy() {
    // Remove pulse mesh if it exists
    if (this.pulseMesh && this.scene) {
      this.scene.remove(this.pulseMesh);
      this.pulseMesh.geometry.dispose();
      this.pulseMesh.material.dispose();
      this.pulseMesh = null;
    }
    
    // Dispose mesh resources
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}