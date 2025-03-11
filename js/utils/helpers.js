// Utility functions for the game

// Color manipulation helpers
// Lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
      0x1000000 + 
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }
  
  // Darken a color
  function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return '#' + (
      0x1000000 + 
      (R > 0 ? R : 0) * 0x10000 + 
      (G > 0 ? G : 0) * 0x100 + 
      (B > 0 ? B : 0)
    ).toString(16).slice(1);
  }
  
  // Convert a hex color to RGB
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }
  
  // Convert RGB to hex
  function rgbToHex(r, g, b) {
    return '#' + 
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  // Math helper functions
  // Get random integer between min and max (inclusive)
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Get random float between min and max
  function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  // Lerp (linear interpolation)
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  // Clamp a value between min and max
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  // Get distance between two points
  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Get angle (in radians) between two points
  function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  
  // Ease functions
  const easing = {
    // Linear - no easing
    linear: t => t,
    
    // Quadratic
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Cubic
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    // Exponential
    easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeInOutExpo: t => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
      return 0.5 * (-Math.pow(2, -10 * --t) + 2);
    }
  };
  
  // Device detection helpers
  // Check if device is mobile
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }
  
  // Check if WebGL is available
  function webGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e) {
      return false;
    }
  }
  
  // Check if device can handle shadows
  function canHandleShadows() {
    // Check WebGL version and extensions
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return false;
      
      // Check for extensions needed for shadows
      const hasExtensions = gl.getExtension('OES_texture_float') && 
                           gl.getExtension('OES_standard_derivatives');
      
      // Also consider device performance
      const isMobileDevice = isMobile();
      
      return hasExtensions && !isMobileDevice;
    } catch(e) {
      return false;
    }
  }
  
  // UI helpers
  // Create a button
  function createButton(text, onClick, options = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);
    
    // Apply styles
    button.style.padding = options.padding || '8px 16px';
    button.style.background = options.background || '#4CAF50';
    button.style.color = options.color || 'white';
    button.style.border = options.border || 'none';
    button.style.borderRadius = options.borderRadius || '4px';
    button.style.cursor = 'pointer';
    button.style.fontSize = options.fontSize || '16px';
    button.style.fontFamily = 'Arial, sans-serif';
    
    // Hover effect
    button.addEventListener('mouseover', () => {
      button.style.background = lightenColor(options.background || '#4CAF50', 10);
    });
    
    button.addEventListener('mouseout', () => {
      button.style.background = options.background || '#4CAF50';
    });
    
    return button;
  }
  
  // Show a modal dialog
  function showModal(title, content, buttons = []) {
    // Create modal container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.background = '#222';
    modalContent.style.color = 'white';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.maxWidth = '80%';
    modalContent.style.maxHeight = '80%';
    modalContent.style.overflow = 'auto';
    
    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;
    modalTitle.style.margin = '0 0 10px 0';
    modalContent.appendChild(modalTitle);
    
    // Add content
    if (typeof content === 'string') {
      const modalText = document.createElement('p');
      modalText.textContent = content;
      modalContent.appendChild(modalText);
    } else {
      modalContent.appendChild(content);
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '20px';
    
    // Add buttons
    buttons.forEach(buttonConfig => {
      const button = createButton(
        buttonConfig.text,
        () => {
          if (buttonConfig.onClick) {
            buttonConfig.onClick();
          }
          document.body.removeChild(modal);
        },
        buttonConfig.options || {}
      );
      button.style.marginLeft = '10px';
      buttonContainer.appendChild(button);
    });
    
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);
    
    // Add to document
    document.body.appendChild(modal);
    
    // Return modal element
    return modal;
  }
  
  // Copy text to clipboard
  function copyToClipboard(text) {
    if (!navigator.clipboard) {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        console.log('Text copied to clipboard');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
      
      document.body.removeChild(textArea);
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => console.log('Text copied to clipboard'))
      .catch(err => console.error('Failed to copy: ', err));
  }
  
  // Format time (seconds) to MM:SS
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Debug helpers
  // Log with styled console output
  function logDebug(message, type = 'info') {
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      return;
    }
    
    const styles = {
      info: 'color: #5c94ff; font-weight: bold;',
      success: 'color: #4CAF50; font-weight: bold;',
      warning: 'color: #FFC107; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold;'
    };
    
    console.log(`%c[${type.toUpperCase()}] ${message}`, styles[type] || styles.info);
  }
  
  // Create simple performance monitor
  function createPerformanceMonitor() {
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      return null;
    }
    
    // Create container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.bottom = '10px';
    container.style.left = '10px';
    container.style.background = 'rgba(0, 0, 0, 0.7)';
    container.style.color = 'white';
    container.style.padding = '5px 10px';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '12px';
    container.style.zIndex = '1000';
    container.style.borderRadius = '4px';
    
    // Create FPS counter
    const fpsElement = document.createElement('div');
    fpsElement.textContent = 'FPS: 0';
    container.appendChild(fpsElement);
    
    // Add to document
    document.body.appendChild(container);
    
    // Variables for FPS calculation
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 0;
    
    // Update function
    function update() {
      // Count frames
      frameCount++;
      
      // Calculate FPS every second
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      
      if (elapsed >= 1000) {
        fps = Math.round(frameCount * 1000 / elapsed);
        frameCount = 0;
        lastTime = currentTime;
        
        // Update display
        fpsElement.textContent = `FPS: ${fps}`;
        
        // Color based on performance
        if (fps >= 55) {
          fpsElement.style.color = '#4CAF50';
        } else if (fps >= 30) {
          fpsElement.style.color = '#FFC107';
        } else {
          fpsElement.style.color = '#F44336';
        }
      }
      
      // Request next frame
      requestAnimationFrame(update);
    }
    
    // Start monitoring
    update();
    
    return container;
  }