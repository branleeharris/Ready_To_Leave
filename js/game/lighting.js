// Lighting system with dynamic flashlight and reflections

// Create flashlight
function createFlashlight(scene, player) {
    // Create spotlight for flashlight
    const flashlight = new THREE.SpotLight(
      0xffffcc, // Warm light color
      4.0, // Intensity
      250, // Range
      Math.PI / 8, // Spotlight angle
      0.2, // Penumbra (soft edge)
      2.0 // Decay
    );
    
    // Configure shadow settings
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.width = 1024;
    flashlight.shadow.mapSize.height = 1024;
    flashlight.shadow.camera.near = 10;
    flashlight.shadow.camera.far = 400;
    flashlight.shadow.bias = -0.001;
    
    // Position flashlight above the player
    flashlight.position.set(0, 0, 20);
    
    // Create target for aiming
    const target = new THREE.Object3D();
    target.position.set(50, 0, 0); // Default aim direction
    
    // Add to player
    player.add(flashlight);
    player.add(target);
    flashlight.target = target;
    
    // Add visual cone for flashlight beam
    addFlashlightCone(flashlight);
    
    // Store initial battery level
    flashlight.userData = {
      battery: 100,
      batteryDrainRate: 0.02,
      originalIntensity: flashlight.intensity,
      originalDistance: flashlight.distance
    };
    
    return flashlight;
  }
  
  // Add visual cone for flashlight beam
  function addFlashlightCone(flashlight) {
    // Create cone geometry for flashlight beam
    const coneLength = 300;
    const coneRadius = Math.tan(flashlight.angle) * coneLength;
    
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneLength, 32, 1, true);
    const coneMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffcc,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
      depthWrite: false, // Prevent z-fighting
      blending: THREE.AdditiveBlending
    });
    
    const lightCone = new THREE.Mesh(coneGeometry, coneMaterial);
    lightCone.rotation.x = Math.PI;
    lightCone.position.set(0, 0, -coneLength/2);
    
    // Store reference in userData
    flashlight.userData.cone = lightCone;
    
    // Add to flashlight
    flashlight.add(lightCone);
  }
  
  // Create reflective surfaces
  function createReflectiveSurfaces(scene, surfacesData) {
    const reflectiveObjects = [];
    
    for (const surface of surfacesData) {
      // Create the surface object
      const geometry = new THREE.PlaneGeometry(surface.width, surface.height);
      let material;
      
      // Different materials based on type
      switch (surface.type) {
        case 'mirror':
          material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.05,
            envMapIntensity: 1.0
          });
          break;
        case 'screen':
          material = new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.7,
            roughness: 0.2,
            emissive: 0x222222
          });
          break;
        case 'metal':
          material = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.8,
            roughness: 0.3
          });
          break;
        case 'glass':
          material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.1,
            transparent: true,
            opacity: 0.4
          });
          break;
        default:
          material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.5,
            roughness: 0.5
          });
      }
      
      // Create the mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // Position the surface
      mesh.position.set(
        surface.x + surface.width / 2,
        surface.y + surface.height / 2,
        10 // Slightly above ground for visibility
      );
      
      // Make it face up (for top-down view)
      mesh.rotation.x = -Math.PI / 2;
      
      // Add shadow properties
      mesh.receiveShadow = true;
      
      // Add metadata
      mesh.userData = {
        isReflective: true,
        reflectivity: surface.reflectivity,
        originalData: surface,
        type: surface.type
      };
      
      // Add to scene
      scene.add(mesh);
      
      // Create point light for reflection effect (initially off)
      const reflection = new THREE.PointLight(
        0xffffcc, // Same color as flashlight
        0, // Start with zero intensity (off)
        surface.reflectivity * 120, // Range based on reflectivity
        2 // Light decay
      );
      
      // Position at the center of the surface
      reflection.position.set(
        surface.x + surface.width / 2,
        surface.y + surface.height / 2,
        20 // Above the surface
      );
      
      // Add metadata
      reflection.userData = {
        isReflection: true,
        sourceObject: mesh,
        active: false
      };
      
      // Add to scene
      scene.add(reflection);
      
      // Store both objects for updates
      reflectiveObjects.push({
        surface: mesh,
        reflection: reflection,
        originalData: surface
      });
    }
    
    return reflectiveObjects;
  }
  
  // Update flashlight based on battery level and player position
  function updateFlashlight(flashlight, player, deltaTime) {
    if (!flashlight || !player) return;
    
    // Update battery level
    const batteryData = flashlight.userData;
    batteryData.battery = Math.max(0, batteryData.battery - batteryData.batteryDrainRate);
    
    // Update flashlight properties based on battery
    const batteryFactor = batteryData.battery / 100;
    flashlight.distance = batteryData.originalDistance * batteryFactor;
    
    // Update cone size
    if (batteryData.cone) {
      batteryData.cone.scale.set(batteryFactor, batteryFactor, batteryFactor);
    }
    
    // If battery is critically low, add flickering effect
    if (batteryData.battery < 15) {
      const flickerAmount = (Math.random() - 0.5) * 0.4;
      flashlight.intensity = batteryData.originalIntensity + flickerAmount;
      
      // Add flicker class to battery UI
      const batteryElement = document.getElementById('battery');
      if (batteryElement && !batteryElement.classList.contains('flicker')) {
        batteryElement.classList.add('flicker');
      }
    } else {
      flashlight.intensity = batteryData.originalIntensity;
      
      // Remove flicker class
      const batteryElement = document.getElementById('battery');
      if (batteryElement && batteryElement.classList.contains('flicker')) {
        batteryElement.classList.remove('flicker');
      }
    }
    
    // Update flashlight position to match player
    // (This actually happens automatically since flashlight is a child of player)
  }
  
  // Update reflective surfaces based on flashlight position
  function updateReflections(reflectiveObjects, flashlight, player) {
    if (!flashlight || !player || !reflectiveObjects) return;
    
    // Get flashlight position and direction
    const flashlightPosition = new THREE.Vector3();
    flashlight.getWorldPosition(flashlightPosition);
    
    const targetPosition = new THREE.Vector3();
    flashlight.target.getWorldPosition(targetPosition);
    
    const flashlightDirection = new THREE.Vector3()
      .subVectors(targetPosition, flashlightPosition)
      .normalize();
    
    // Update each reflective surface
    for (const obj of reflectiveObjects) {
      const surface = obj.surface;
      const reflection = obj.reflection;
      
      if (!surface || !reflection) continue;
      
      // Get surface position
      const surfacePosition = new THREE.Vector3();
      surface.getWorldPosition(surfacePosition);
      
      // Calculate distance from flashlight to surface
      const distanceToSurface = flashlightPosition.distanceTo(surfacePosition);
      
      // Check if surface is within flashlight range
      if (distanceToSurface <= flashlight.distance) {
        // Calculate direction to surface
        const toSurfaceDirection = new THREE.Vector3()
          .subVectors(surfacePosition, flashlightPosition)
          .normalize();
        
        // Calculate angle between flashlight direction and surface direction
        const angle = flashlightDirection.angleTo(toSurfaceDirection);
        
        // Check if surface is within flashlight cone angle
        if (angle <= flashlight.angle) {
          // Calculate intensity based on angle, distance, and reflectivity
          const angleRatio = 1 - (angle / flashlight.angle);
          const distanceRatio = 1 - (distanceToSurface / flashlight.distance);
          const intensity = angleRatio * distanceRatio * surface.userData.reflectivity;
          
          // Update reflection light
          reflection.intensity = intensity * 0.7;
          reflection.userData.active = true;
          
          // Apply special effects based on surface type
          applyReflectionEffects(surface, reflection, intensity);
        } else {
          // Turn off reflection if not in cone
          reflection.intensity = 0;
          reflection.userData.active = false;
        }
      } else {
        // Turn off reflection if out of range
        reflection.intensity = 0;
        reflection.userData.active = false;
      }
    }
  }
  
  // Apply special effects for different reflective surface types
  function applyReflectionEffects(surface, reflection, intensity) {
    if (!surface || !surface.userData) return;
    
    const type = surface.userData.type;
    const material = surface.material;
    
    switch (type) {
      case 'mirror':
        // Strong reflection, enhance metalness
        material.metalness = 0.9 + (intensity * 0.1);
        material.roughness = Math.max(0.05 - (intensity * 0.05), 0.01);
        // Slight color tint when illuminated
        material.color.setRGB(0.95, 0.97, 1.0);
        break;
        
      case 'screen':
        // Screens light up when illuminated
        material.emissive.setRGB(
          0.1 + intensity * 0.3,
          0.1 + intensity * 0.3,
          0.2 + intensity * 0.4
        );
        // Reduce intensity for screen reflection (screens emit their own light)
        reflection.intensity *= 0.5;
        break;
        
      case 'metal':
        // Adjust metalness based on illumination
        material.metalness = 0.8 + (intensity * 0.2);
        material.roughness = Math.max(0.3 - (intensity * 0.2), 0.1);
        break;
        
      case 'glass':
        // Glass becomes more transparent when illuminated
        material.opacity = 0.4 + (intensity * 0.2);
        // Slight color tint
        material.color.setRGB(
          0.9 + intensity * 0.1,
          0.9 + intensity * 0.1,
          1.0
        );
        break;
        
      default:
        // Default behavior for other reflective surfaces
        material.metalness = 0.5 + (intensity * 0.3);
        material.roughness = Math.max(0.5 - (intensity * 0.3), 0.2);
    }
  }
  
  // Helper function to create point lights for objects
  function createObjectLight(position, color, intensity, distance) {
    const light = new THREE.PointLight(color, intensity, distance, 2);
    light.position.copy(position);
    light.castShadow = false; // Usually we don't need these lights to cast shadows
    
    return light;
  }
  
  // Create a visual bloom effect for reflections (if needed)
  function createBloomEffect(intensity, position, scene) {
    // Create a glowing sphere
    const glowGeometry = new THREE.SphereGeometry(intensity * 10, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffcc,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      
      const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
      glowSphere.position.copy(position);
      
      // Add to scene
      scene.add(glowSphere);
      
      // Return for later reference
      return glowSphere;
    }
    
    // Cast rays for detailed reflection calculations
    function castRays(origin, direction, distance, scene) {
      const raycaster = new THREE.Raycaster(origin, direction, 0, distance);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Return first hit (if any)
      if (intersects.length > 0) {
        return intersects[0];
      }
      
      return null;
    }
    
    // Create ambient lighting for the scene
    function createAmbientLighting(scene) {
      // Dim ambient light for minimal visibility
      const ambientLight = new THREE.AmbientLight(0x333344, 0.05);
      scene.add(ambientLight);
      
      // Add hemisphere light for more natural ambient lighting
      const hemisphereLight = new THREE.HemisphereLight(0x222233, 0x111122, 0.2);
      scene.add(hemisphereLight);
      
      return {
        ambient: ambientLight,
        hemisphere: hemisphereLight
      };
    }
    
    // Create slight directional lighting for shadows when in debug mode
    function createDebugLighting(scene) {
      // Only when in development
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return null;
      }
      
      // Add directional light for debugging
      const debugLight = new THREE.DirectionalLight(0xffffff, 0.3);
      debugLight.position.set(500, 500, 500);
      debugLight.castShadow = true;
      
      // Configure shadow settings
      debugLight.shadow.mapSize.width = 1024;
      debugLight.shadow.mapSize.height = 1024;
      debugLight.shadow.camera.near = 100;
      debugLight.shadow.camera.far = 1200;
      debugLight.shadow.camera.left = -700;
      debugLight.shadow.camera.right = 700;
      debugLight.shadow.camera.top = 700;
      debugLight.shadow.camera.bottom = -700;
      
      // Debug flag
      debugLight.userData = {
        isDebugLight: true
      };
      
      // Add to scene but start disabled
      debugLight.visible = false;
      scene.add(debugLight);
      
      // Add helper (also hidden by default)
      const helper = new THREE.DirectionalLightHelper(debugLight, 10);
      helper.visible = false;
      scene.add(helper);
      
      // Add key handler to toggle debug light
      window.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
          debugLight.visible = !debugLight.visible;
          helper.visible = debugLight.visible;
          if (debugLight.visible) {
            console.log('Debug lighting enabled');
          } else {
            console.log('Debug lighting disabled');
          }
        }
      });
      
      return debugLight;
    }