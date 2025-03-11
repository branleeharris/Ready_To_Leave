// Three.js renderer setup and scene creation

function initRenderer() {
    // Create the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    // Setup camera (orthographic for top-down view)
    const aspectRatio = window.innerWidth / window.innerHeight;
    const viewSize = 600; // Controls how much of the world is visible
    const camera = new THREE.OrthographicCamera(
      viewSize * aspectRatio / -2,
      viewSize * aspectRatio / 2,
      viewSize / 2,
      viewSize / -2,
      1,
      1000
    );
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);
    
    // Create renderer with shadows enabled
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      canvas: document.createElement('canvas')
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add to DOM
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
      gameContainer.appendChild(renderer.domElement);
    } else {
      document.body.appendChild(renderer.domElement);
      console.warn("Game container not found, appending to body");
    }
    
    // Add ambient light for minimal visibility
    const ambientLight = new THREE.AmbientLight(0x333344, 0.15);
    scene.add(ambientLight);
    
    // Create floor plane for shadows
    const floorGeometry = new THREE.PlaneGeometry(3000, 3000);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222, 
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.z = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Set up fog for atmosphere and performance
    scene.fog = new THREE.FogExp2(0x111111, 0.0015);
    
    // Set up camera controller for later use
    const cameraController = {
      target: new THREE.Vector3(0, 0, 0),
      update: function(playerPosition) {
        // Move camera to follow player
        camera.position.x = playerPosition.x;
        camera.position.y = playerPosition.y;
        camera.position.z = 500; // Keep height constant
        
        // Update target to match player position but maintain height
        this.target.set(playerPosition.x, playerPosition.y, 0);
        camera.lookAt(this.target);
      }
    };
    
    // Make camera controller available globally for player movement
    window.cameraController = cameraController;
    
    // Check if device supports shadows and complex rendering
    const supportsAdvancedRendering = checkDeviceCapabilities();
    
    // Set initial quality based on device capabilities
    const quality = supportsAdvancedRendering ? 'medium' : 'low';
    setInitialQuality(renderer, scene, quality); // RENAMED this function call
    
    // Return created objects
    return {
      scene,
      camera,
      renderer,
      cameraController,
      quality
    };
  }
  
  // Check device capabilities
  function checkDeviceCapabilities() {
    // Check if WebGL is available
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      showWebGLWarning();
      return false;
    }
    
    // Basic detection for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check for WebGL extensions and capabilities
    const supportsShadowMaps = gl.getExtension('OES_texture_float');
    const supportsDerivatives = gl.getExtension('OES_standard_derivatives');
    
    // Consider both hardware and extension support
    return !isMobile && supportsShadowMaps && supportsDerivatives;
  }
  
  // Display warning for devices without WebGL
  function showWebGLWarning() {
    const warning = document.createElement('div');
    warning.style.position = 'absolute';
    warning.style.top = '50%';
    warning.style.left = '50%';
    warning.style.transform = 'translate(-50%, -50%)';
    warning.style.padding = '20px';
    warning.style.background = 'rgba(0, 0, 0, 0.8)';
    warning.style.color = 'white';
    warning.style.borderRadius = '5px';
    warning.style.textAlign = 'center';
    warning.style.zIndex = '1000';
    warning.innerHTML = `
      <h2>WebGL Not Supported</h2>
      <p>Your browser or device doesn't appear to support WebGL, which is required for this game.</p>
      <p>Please try a different browser or device.</p>
    `;
    document.body.appendChild(warning);
  }
  
  // RENAMED FUNCTION to avoid conflict with performance.js
  function setInitialQuality(renderer, scene, quality) {
    const settings = {
      low: {
        shadowMapSize: 512,
        shadows: false,
        pixelRatio: 0.8,
        antialias: false,
        fog: false
      },
      medium: {
        shadowMapSize: 1024,
        shadows: true,
        pixelRatio: 1,
        antialias: true,
        fog: true
      },
      high: {
        shadowMapSize: 2048,
        shadows: true,
        pixelRatio: window.devicePixelRatio,
        antialias: true,
        fog: true
      }
    };
    
    const current = settings[quality];
    
    // Apply settings
    renderer.shadowMap.enabled = current.shadows;
    // Note: antialias can't be changed after WebGLRenderer is created
    renderer.setPixelRatio(current.pixelRatio);
    
    // Update shadow map sizes for lights
    scene.traverse(obj => {
      if (obj.isLight && obj.shadow) {
        obj.shadow.mapSize.width = current.shadowMapSize;
        obj.shadow.mapSize.height = current.shadowMapSize;
        obj.castShadow = current.shadows;
      }
    });
    
    // Toggle fog
    if (scene.fog) {
      scene.fog.enabled = current.fog;
    }
    
    console.log(`Applied ${quality} quality settings in renderer`);
  }