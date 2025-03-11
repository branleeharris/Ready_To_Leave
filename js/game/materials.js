// Material system for different surface types with realistic properties

// Material collection
const materials = {
    // Base materials
    basic: {},
    
    // Wall materials
    wall: {},
    
    // Wood materials with different finishes
    wood: {},
    
    // Metal surfaces
    metal: {},
    
    // Fabric surfaces
    fabric: {},
    
    // Glass/reflective surfaces
    glass: {},
    
    // Plastic surfaces
    plastic: {}
  };
  
  // Texture paths
  const texturePaths = {
    wood: {
      color: 'assets/textures/wood_color.jpg',
      normal: 'assets/textures/wood_normal.jpg',
      roughness: 'assets/textures/wood_roughness.jpg'
    },
    metal: {
      color: 'assets/textures/metal_color.jpg',
      normal: 'assets/textures/metal_normal.jpg',
      roughness: 'assets/textures/metal_roughness.jpg'
    },
    fabric: {
      color: 'assets/textures/fabric_color.jpg',
      normal: 'assets/textures/fabric_normal.jpg',
      roughness: 'assets/textures/fabric_roughness.jpg'
    },
    wall: {
      color: 'assets/textures/wall_color.jpg',
      normal: 'assets/textures/wall_normal.jpg',
      roughness: 'assets/textures/wall_roughness.jpg'
    },
    plastic: {
      color: 'assets/textures/plastic_color.jpg',
      normal: 'assets/textures/plastic_normal.jpg',
      roughness: 'assets/textures/plastic_roughness.jpg'
    }
  };
  
  // List of textures to load
  const textureList = [
    'wood_color', 'wood_normal', 'wood_roughness',
    'metal_color', 'metal_normal', 'metal_roughness',
    'fabric_color', 'fabric_normal', 'fabric_roughness',
    'wall_color', 'wall_normal', 'wall_roughness',
    'plastic_color', 'plastic_normal', 'plastic_roughness'
  ];
  
  // Texture cache
  const textureCache = {};
  
  // Initialize materials with textures
  async function initializeMaterials(textureLoader) {
    // Create fallback textures for basic mode
    createFallbackTextures();
    
    // Load textures in parallel
    try {
      await loadTextures(textureLoader);
      console.log('All textures loaded successfully');
    } catch (error) {
      console.warn('Error loading textures:', error);
      console.log('Using fallback basic materials');
    }
    
    // Create wall materials
    materials.wall.standard = new THREE.MeshStandardMaterial({
      color: 0x555555,
      roughness: 0.9,
      metalness: 0.1,
      map: textureCache.wall_color,
      normalMap: textureCache.wall_normal,
      roughnessMap: textureCache.wall_roughness
    });
    
    materials.wall.basic = new THREE.MeshLambertMaterial({
      color: 0x555555
    });
    
    // Create wood materials with different finishes
    materials.wood.dark = new THREE.MeshStandardMaterial({
      color: 0x5D4037,
      roughness: 0.7,
      metalness: 0.1,
      map: textureCache.wood_color,
      normalMap: textureCache.wood_normal,
      roughnessMap: textureCache.wood_roughness
    });
    
    materials.wood.medium = new THREE.MeshStandardMaterial({
      color: 0x8D6E63,
      roughness: 0.65,
      metalness: 0.1,
      map: textureCache.wood_color,
      normalMap: textureCache.wood_normal,
      roughnessMap: textureCache.wood_roughness
    });
    
    materials.wood.light = new THREE.MeshStandardMaterial({
      color: 0xA1887F,
      roughness: 0.6,
      metalness: 0.1,
      map: textureCache.wood_color,
      normalMap: textureCache.wood_normal,
      roughnessMap: textureCache.wood_roughness
    });
    
    // Create basic wood materials (fallback)
    materials.wood.darkBasic = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    materials.wood.mediumBasic = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
    materials.wood.lightBasic = new THREE.MeshLambertMaterial({ color: 0xA1887F });
    
    // Create metal surfaces
    materials.metal.standard = new THREE.MeshStandardMaterial({
      color: 0xCFD8DC,
      roughness: 0.2,
      metalness: 0.8,
      map: textureCache.metal_color,
      normalMap: textureCache.metal_normal,
      roughnessMap: textureCache.metal_roughness
    });
    
    materials.metal.dark = new THREE.MeshStandardMaterial({
      color: 0x78909C,
      roughness: 0.3,
      metalness: 0.7,
      map: textureCache.metal_color,
      normalMap: textureCache.metal_normal,
      roughnessMap: textureCache.metal_roughness
    });
    
    materials.metal.basic = new THREE.MeshLambertMaterial({ color: 0xCFD8DC });
    
    // Create fabric surfaces
    materials.fabric.standard = new THREE.MeshStandardMaterial({
      color: 0x9575CD,
      roughness: 0.9,
      metalness: 0.0,
      map: textureCache.fabric_color,
      normalMap: textureCache.fabric_normal,
      roughnessMap: textureCache.fabric_roughness
    });
    
    materials.fabric.blue = new THREE.MeshStandardMaterial({
      color: 0x5C6BC0,
      roughness: 0.9,
      metalness: 0.0,
      map: textureCache.fabric_color,
      normalMap: textureCache.fabric_normal,
      roughnessMap: textureCache.fabric_roughness
    });
    
    materials.fabric.basic = new THREE.MeshLambertMaterial({ color: 0x9575CD });
    
    // Create glass/reflective surfaces
    materials.glass.standard = new THREE.MeshStandardMaterial({
      color: 0xEEEEEE,
      roughness: 0.1,
      metalness: 0.9,
      opacity: 0.7,
      transparent: true
    });
    
    materials.glass.basic = new THREE.MeshBasicMaterial({ 
      color: 0xEEEEEE,
      opacity: 0.7,
      transparent: true
    });
    
    // Create plastic surfaces
    materials.plastic.standard = new THREE.MeshStandardMaterial({
      color: 0xECEFF1,
      roughness: 0.5,
      metalness: 0.2,
      map: textureCache.plastic_color,
      normalMap: textureCache.plastic_normal,
      roughnessMap: textureCache.plastic_roughness
    });
    
    materials.plastic.white = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.5,
      metalness: 0.2,
      map: textureCache.plastic_color,
      normalMap: textureCache.plastic_normal,
      roughnessMap: textureCache.plastic_roughness
    });
    
    materials.plastic.basic = new THREE.MeshLambertMaterial({ color: 0xECEFF1 });
    
    // Apply texture settings to all materials
    configureTextureSettings();
    
    return materials;
  }
  
  // Load all textures and store in cache
  async function loadTextures(textureLoader) {
    // Create an array of texture loading promises
    const loadPromises = [];
    
    for (const category in texturePaths) {
      for (const type in texturePaths[category]) {
        const path = texturePaths[category][type];
        const name = `${category}_${type}`;
        
        loadPromises.push(
          new Promise((resolve, reject) => {
            textureLoader.load(
              path,
              texture => {
                textureCache[name] = texture;
                resolve();
              },
              undefined, // onProgress not implemented
              error => {
                console.warn(`Failed to load texture: ${path}`, error);
                // Continue with fallback
                resolve();
              }
            );
          })
        );
      }
    }
    
    // Wait for all textures to load
    return Promise.all(loadPromises);
  }
  
  // Create fallback textures for when files can't be loaded
  function createFallbackTextures() {
    // Create 2x2 canvas textures for fallbacks
    for (const category in texturePaths) {
      for (const type in texturePaths[category]) {
        const name = `${category}_${type}`;
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 2;
        const ctx = canvas.getContext('2d');
        
        // Create appropriate color based on texture type
        let color;
        switch (type) {
          case 'normal':
            color = '#8080ff'; // Default normal map blue
            break;
          case 'roughness':
            color = '#888888'; // Medium roughness
            break;
          default:
            // For color maps, use the material's color
            switch (category) {
              case 'wood': color = '#8D6E63'; break;
              case 'metal': color = '#CFD8DC'; break;
              case 'fabric': color = '#9575CD'; break;
              case 'wall': color = '#555555'; break;
              case 'plastic': color = '#ECEFF1'; break;
              default: color = '#AAAAAA'; break;
            }
        }
        
        // Fill canvas with color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 2, 2);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        textureCache[name] = texture;
      }
    }
  }
  
  // Configure texture settings
  function configureTextureSettings() {
    for (const key in textureCache) {
      const texture = textureCache[key];
      
      // Apply common settings
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // Configure repeat based on texture type
      if (key.includes('wall')) {
        texture.repeat.set(0.2, 0.2);
      } else if (key.includes('wood')) {
        texture.repeat.set(0.5, 0.5);
      } else if (key.includes('fabric')) {
        texture.repeat.set(1, 1);
      } else {
        texture.repeat.set(0.5, 0.5);
      }
      
      // Apply mipmapping
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      
      // Set normal map intensity
      if (key.includes('normal')) {
        texture.normalScale = new THREE.Vector2(0.5, 0.5);
      }
    }
  }
  
  // Get appropriate material based on quality
  function getMaterial(type, quality = 'medium') {
    const categories = type.split('.');
    const materialCategory = materials[categories[0]];
    
    if (!materialCategory) {
      console.warn(`Material category not found: ${categories[0]}`);
      return new THREE.MeshLambertMaterial({ color: 0xFF00FF });
    }
    
    // For high and medium quality, use standard materials
    if (quality === 'high' || quality === 'medium') {
      const specificMaterial = materialCategory[categories[1] || 'standard'];
      
      if (specificMaterial) {
        return specificMaterial;
      } else {
        console.warn(`Specific material not found: ${categories[1] || 'standard'}`);
        return materialCategory.standard || new THREE.MeshLambertMaterial({ color: 0xFF00FF });
      }
    } 
    // For low quality, use basic materials
    else {
      const basicMaterial = materialCategory[`${categories[1] || ''}Basic`] || materialCategory.basic;
      
      if (basicMaterial) {
        return basicMaterial;
      } else {
        console.warn(`Basic material not found for: ${categories[0]}`);
        return new THREE.MeshLambertMaterial({ color: 0xFF00FF });
      }
    }
  }