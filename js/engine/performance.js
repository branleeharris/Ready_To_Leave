// Performance monitoring and dynamic quality adjustment

// Quality settings for different performance targets
const qualityPresets = {
    low: {
      shadowMapSize: 2048,
      shadowEnabled: true,
      reflectionsEnabled: true,
      maxLights: 10,
      texturesEnabled: true,
      maxFurnitureDetail: 1.0,
      pixelRatio: window.devicePixelRatio,
      fogDensity: 0.001,
      drawDistance: 1500
    },
    medium: {
      shadowMapSize: 2048,
      shadowEnabled: true,
      reflectionsEnabled: true,
      maxLights: 10,
      texturesEnabled: true,
      maxFurnitureDetail: 1.0,
      pixelRatio: window.devicePixelRatio,
      fogDensity: 0.001,
      drawDistance: 1500
    },
    high: {
      shadowMapSize: 2048,
      shadowEnabled: true,
      reflectionsEnabled: true,
      maxLights: 10,
      texturesEnabled: true,
      maxFurnitureDetail: 1.0,
      pixelRatio: window.devicePixelRatio,
      fogDensity: 0.001,
      drawDistance: 1500
    }
  };
  
  // Performance monitoring state
  const performanceMonitor = {
    framesAnalyzed: 0,
    totalFrameTime: 0,
    frameTimeHistory: [],
    maxHistoryLength: 120, // 2 seconds at 60fps
    currentQuality: 'medium',
    targetFPS: 45,
    adaptiveQualityEnabled: true
  };
  
  // Set up performance monitoring
  function setupPerformanceMonitoring(scene, renderer, flashlight) {
    // Determine initial quality based on device capabilities
    performanceMonitor.currentQuality = detectInitialQuality();
    
    // Apply initial quality settings
    applyQualitySettings(scene, renderer, flashlight, performanceMonitor.currentQuality);
    
    // Create debug panel if in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      createDebugPanel();
    }
    
    // Return function to check performance each frame
    return function checkPerformance(deltaTime) {
      // Skip if adaptive quality is disabled
      if (!performanceMonitor.adaptiveQualityEnabled) return;
      
      // Track performance
      analyzePerformance(deltaTime);
      
      // Adjust quality if needed (once every 60 frames)
      if (performanceMonitor.framesAnalyzed % 60 === 0) {
        const newQuality = determineOptimalQuality();
        
        if (newQuality !== performanceMonitor.currentQuality) {
          console.log(`Adjusting quality to ${newQuality} based on performance`);
          performanceMonitor.currentQuality = newQuality;
          applyQualitySettings(scene, renderer, flashlight, newQuality);
          
          // Update debug panel if it exists
          updateDebugPanel();
        }
      }
    };
  }
  
  // Analyze current performance
  function analyzePerformance(deltaTime) {
    performanceMonitor.framesAnalyzed++;
    performanceMonitor.totalFrameTime += deltaTime;
    
    // Add to history and maintain maximum length
    performanceMonitor.frameTimeHistory.push(deltaTime);
    if (performanceMonitor.frameTimeHistory.length > performanceMonitor.maxHistoryLength) {
      performanceMonitor.frameTimeHistory.shift();
    }
    
    // Update debug panel if needed
    if (performanceMonitor.framesAnalyzed % 10 === 0) {
      updateDebugPanel();
    }
  }
  
  // Determine optimal quality level based on performance
  function determineOptimalQuality() {
    // Calculate average frame time
    const avgFrameTime = performanceMonitor.totalFrameTime / performanceMonitor.frameTimeHistory.length;
    const currentFPS = 1 / avgFrameTime;
    
    // Calculate 95th percentile of frame times (to catch stutters)
    const sortedTimes = [...performanceMonitor.frameTimeHistory].sort((a, b) => a - b);
    const percentile95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const worstCaseFPS = 1 / percentile95;
    
    // Make decision based on both average and worst-case performance
    if (worstCaseFPS < 25 || currentFPS < 40) {
      return 'low';
    } else if ((worstCaseFPS >= 25 && worstCaseFPS < 45) || (currentFPS >= 40 && currentFPS < 55)) {
      return 'medium';
    } else {
      return 'high';
    }
  }
  
  // Apply quality settings to the scene
  function applyQualitySettings(scene, renderer, flashlight, quality) {
    const settings = qualityPresets[quality];
    
    // Update renderer settings
    renderer.setPixelRatio(settings.pixelRatio);
    renderer.shadowMap.enabled = settings.shadowEnabled;
    
    // Update fog for draw distance
    if (scene.fog) {
      scene.fog.density = settings.fogDensity;
    }
    
    // Update flashlight
    if (flashlight) {
      flashlight.castShadow = settings.shadowEnabled;
      flashlight.shadow.mapSize.width = settings.shadowMapSize;
      flashlight.shadow.mapSize.height = settings.shadowMapSize;
    }
    
    // Update all lights and materials in the scene
    scene.traverse(object => {
      // Handle lights
      if (object.isLight && object !== flashlight) {
        if (object.castShadow !== undefined) {
          object.castShadow = settings.shadowEnabled;
        }
        
        // Handle reflections (point lights used for reflections)
        if (object.userData && object.userData.isReflection) {
          object.visible = settings.reflectionsEnabled && object.userData.active;
        }
      }
      
      // Handle materials
      if (object.isMesh) {
        // Update shadow properties
        if (object.receiveShadow !== undefined) {
          object.receiveShadow = settings.shadowEnabled;
        }
        
        // Update materials for texture settings
        if (object.material) {
          if (Array.isArray(object.material)) {
            // Handle multi-material objects
            object.material.forEach(material => updateMaterial(material, settings));
          } else {
            // Handle single material objects
            updateMaterial(object.material, settings);
          }
        }
        
        // Handle LOD (Level of Detail) if implemented
        if (object.userData && object.userData.detailLevel !== undefined) {
          object.visible = object.userData.detailLevel <= settings.maxFurnitureDetail;
        }
      }
    });
  }
  
  // Update a material based on quality settings
  function updateMaterial(material, settings) {
    if (!material) return;
    
    // Enable/disable textures
    if (material.map) material.map.enabled = settings.texturesEnabled;
    if (material.normalMap) material.normalMap.enabled = settings.texturesEnabled;
    if (material.roughnessMap) material.roughnessMap.enabled = settings.texturesEnabled;
    if (material.metalnessMap) material.metalnessMap.enabled = settings.texturesEnabled;
    
    // Simplify material for low quality
    if (!settings.texturesEnabled) {
      // Use simpler lighting model for low-end devices
      if (material.type === 'MeshStandardMaterial' && !settings.shadowEnabled) {
        // Store original values if not already stored
        if (!material.userData) material.userData = {};
        if (!material.userData.originalValues) {
          material.userData.originalValues = {
            color: material.color.clone(),
            roughness: material.roughness,
            metalness: material.metalness
          };
        }
      }
    } else {
      // Restore original values if they exist
      if (material.userData && material.userData.originalValues) {
        material.color.copy(material.userData.originalValues.color);
        material.roughness = material.userData.originalValues.roughness;
        material.metalness = material.userData.originalValues.metalness;
      }
    }
  }
  
  // Detect initial quality setting based on device
  function detectInitialQuality() {
    // Check for high-end device
    const isHighEnd = window.devicePixelRatio > 1 && 
                      !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return 'low';
    }
    
    // Check for shadows support
    const shadowsSupported = gl.getExtension('OES_texture_float') && 
                            gl.getExtension('OES_standard_derivatives');
    
    if (!shadowsSupported) {
      return 'low';
    }
    
    // Return appropriate quality based on device
    return isHighEnd ? 'high' : 'medium';
  }
  
  // Create debug panel for development
  function createDebugPanel() {
    // Create panel
    const panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.style.position = 'absolute';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.background = 'rgba(0, 0, 0, 0.7)';
    panel.style.color = 'white';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.fontFamily = 'monospace';
    panel.style.zIndex = '1000';
    panel.style.fontSize = '12px';
    panel.style.width = '200px';
    panel.style.display = 'none'; // Hidden by default
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Debug';
    toggleButton.style.position = 'absolute';
    toggleButton.style.bottom = '10px';
    toggleButton.style.left = '10px';
    toggleButton.style.zIndex = '1000';
    toggleButton.style.padding = '5px 10px';
    toggleButton.style.background = 'rgba(0, 0, 0, 0.7)';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';
    
    // Toggle panel visibility
    toggleButton.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    
    // Add quality selector
    const qualitySelector = document.createElement('div');
    qualitySelector.innerHTML = `
      <p>Quality: 
        <select id="qualitySelect">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </p>
      <p>
        <label>
          <input type="checkbox" id="adaptiveQuality" checked> 
          Adaptive Quality
        </label>
      </p>
      <hr>
    `;
    panel.appendChild(qualitySelector);
    
    // Add stats container
    const statsContainer = document.createElement('div');
    statsContainer.id = 'statsContainer';
    statsContainer.innerHTML = `
      <p>FPS: <span id="fpsValue">0</span></p>
      <p>Frame Time: <span id="frameTimeValue">0</span> ms</p>
      <p>Worst Frame: <span id="worstFrameValue">0</span> ms</p>
      <p>Current Quality: <span id="currentQualityValue">medium</span></p>
    `;
    panel.appendChild(statsContainer);
    
    // Add to document
    document.body.appendChild(panel);
    document.body.appendChild(toggleButton);
    
    // Set up event listeners
    document.getElementById('qualitySelect').value = performanceMonitor.currentQuality;
    document.getElementById('qualitySelect').addEventListener('change', (e) => {
      performanceMonitor.currentQuality = e.target.value;
      applyQualitySettings(scene, renderer, flashlight, performanceMonitor.currentQuality);
    });
    
    document.getElementById('adaptiveQuality').addEventListener('change', (e) => {
      performanceMonitor.adaptiveQualityEnabled = e.target.checked;
    });
    
    // Initial update
    updateDebugPanel();
  }
  
  // Update debug panel with current stats
  function updateDebugPanel() {
    const debugPanel = document.getElementById('statsContainer');
    if (!debugPanel) return;
    
    // Calculate stats
    const avgFrameTime = performanceMonitor.totalFrameTime / Math.max(1, performanceMonitor.frameTimeHistory.length);
    const fps = Math.round(1 / avgFrameTime);
    
    // Find worst frame time
    let worstFrameTime = 0;
    if (performanceMonitor.frameTimeHistory.length > 0) {
      worstFrameTime = Math.max(...performanceMonitor.frameTimeHistory);
    }
    
    // Update display
    document.getElementById('fpsValue').textContent = fps;
    document.getElementById('frameTimeValue').textContent = (avgFrameTime * 1000).toFixed(2);
    document.getElementById('worstFrameValue').textContent = (worstFrameTime * 1000).toFixed(2);
    document.getElementById('currentQualityValue').textContent = performanceMonitor.currentQuality;
    
    // Update quality selector if quality changed externally
    const qualitySelect = document.getElementById('qualitySelect');
    if (qualitySelect && qualitySelect.value !== performanceMonitor.currentQuality) {
      qualitySelect.value = performanceMonitor.currentQuality;
    }
  }
  
  // Set up frustum culling to improve performance
  function setupFrustumCulling(scene, camera) {
    // Create frustum for culling
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4();
    
    // Return function to update visibility of objects
    return function updateVisibility() {
      // Update frustum from current camera
      camera.updateMatrixWorld();
      projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(projScreenMatrix);
      
      // Check each object against frustum
      scene.traverse(object => {
        if (object.isMesh && !object.userData.alwaysVisible) {
          // Skip if object has no geometry
          if (!object.geometry) return;
          
          // Create or update bounding sphere
          if (!object.geometry.boundingSphere) {
            object.geometry.computeBoundingSphere();
          }
          
          // Get world position
          const position = new THREE.Vector3();
          position.setFromMatrixPosition(object.matrixWorld);
          
          // Create a copy of the bounding sphere at the world position
          const boundingSphere = object.geometry.boundingSphere.clone();
          boundingSphere.center.copy(position);
          
          // Check if object is in frustum and update visibility
          object.visible = frustum.intersectsSphere(boundingSphere);
        }
      });
    };
  }