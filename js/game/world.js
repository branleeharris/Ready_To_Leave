// World building with walls, rooms, and environment

// Create the world structure with walls
function createWorld(scene, wallsData) {
    const wallObjects = [];
    
    // Create wall objects from data
    for (const wall of wallsData) {
      const wallObject = createWall(wall, scene);
      wallObjects.push(wallObject);
    }
    
    // Add floor plane for the entire area
    createFloor(scene);
    
    // Create ceiling
    createCeiling(scene);
    
    // Add room labels (in dev mode)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      createRoomLabels(scene);
    }
    
    return wallObjects;
  }
  
  // Create a wall object from data
  function createWall(wallData, scene) {
    // Create wall geometry
    const geometry = new THREE.BoxGeometry(wallData.width, wallData.height, 100);
    const material = getMaterial('wall.standard');
    
    // Create mesh
    const wall = new THREE.Mesh(geometry, material);
    
    // Position the wall
    wall.position.set(
      wallData.x + wallData.width / 2,
      wallData.y + wallData.height / 2,
      50 // Half the height
    );
    
    // Add shadow properties
    wall.castShadow = true;
    wall.receiveShadow = true;
    
    // Store original data
    wall.userData = {
      type: 'wall',
      originalData: wallData
    };
    
    // Add to scene
    scene.add(wall);
    
    return wall;
  }
  
  // Create the floor
  function createFloor(scene) {
    // Create floor geometry (large plane)
    const geometry = new THREE.PlaneGeometry(3000, 3000);
    const material = getMaterial('wood.medium');
    
    // Create mesh
    const floor = new THREE.Mesh(geometry, material);
    
    // Position at y=0, facing up
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    
    // Add shadow properties
    floor.receiveShadow = true;
    
    // Add metadata
    floor.userData = {
      type: 'floor',
      alwaysVisible: true // Optimization flag
    };
    
    // Add to scene
    scene.add(floor);
    
    return floor;
  }
  
  // Create ceiling
  function createCeiling(scene) {
    // Create ceiling geometry
    const geometry = new THREE.PlaneGeometry(3000, 3000);
    const material = getMaterial('wall.standard');
    
    // Create mesh
    const ceiling = new THREE.Mesh(geometry, material);
    
    // Position above rooms, facing down
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.z = 100;
    
    // Add shadow properties
    ceiling.receiveShadow = true;
    
    // Add metadata
    ceiling.userData = {
      type: 'ceiling',
      alwaysVisible: true // Optimization flag
    };
    
    // Add to scene
    scene.add(ceiling);
    
    return ceiling;
  }
  
  // Create text labels for rooms (dev mode)
  function createRoomLabels(scene) {
    const rooms = [
      { name: "Entry Hall", x: 400, y: 300, width: 700, height: 400 },
      { name: "Living Room", x: 850, y: 300, width: 450, height: 400 },
      { name: "Kitchen", x: 850, y: 550, width: 450, height: 350 },
      { name: "Bedroom", x: 1350, y: 900, width: 350, height: 400 },
      { name: "Bathroom", x: 950, y: 1150, width: 350, height: 350 }
    ];
    
    // Add text for each room
    for (const room of rooms) {
      createRoomLabel(room, scene);
    }
  }
  
  // Create a text label for a room
  function createRoomLabel(room, scene) {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Draw text
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000000';
    context.font = 'Bold 36px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(room.name, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create material and geometry
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    
    const geometry = new THREE.PlaneGeometry(100, 50);
    
    // Create mesh
    const label = new THREE.Mesh(geometry, material);
    
    // Position at center of room
    label.position.set(
      room.x + room.width / 2,
      room.y + room.height / 2,
      10 // Just above ground
    );
    
    // Rotate to face up (top-down view)
    label.rotation.x = -Math.PI / 2;
    
    // Add metadata
    label.userData = {
      type: 'label',
      roomData: room,
      isDevOnly: true
    };
    
    // Add to scene
    scene.add(label);
    
    return label;
  }
  
  // Create special environment objects for specific rooms
  function createEnvironmentObjects(scene) {
    // A collection of objects to return
    const envObjects = [];
    
    // Add specific objects for each room (examples)
    
    // Living room TV static
    const tvScreen = createTVScreen(1150, 180, 100, 60, scene);
    envObjects.push(tvScreen);
    
    // Bathroom mirror
    const mirror = createMirror(1000, 1080, 80, 40, scene);
    envObjects.push(mirror);
    
    // Bedroom window with moonlight
    const window = createWindow(1500, 720, 80, 60, scene);
    envObjects.push(window);
    
    // Kitchen sink with dripping water
    const sink = createSink(950, 550, 60, 40, scene);
    envObjects.push(sink);
    
    // Add battery pickups
    const batteries = createBatteryPickups(scene);
    envObjects.push(...batteries);
    
    return envObjects;
  }
  
  // Create a TV screen with static effect
  function createTVScreen(x, y, width, height, scene) {
    // Create TV screen geometry
    const geometry = new THREE.PlaneGeometry(width, height);
    
    // Create shader material for TV static
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          vec2 st = vUv;
          float r = random(st * time);
          vec3 color = vec3(r) * vec3(0.2, 0.3, 0.9);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });
    
    // Create mesh
    const screen = new THREE.Mesh(geometry, material);
    
    // Position
    screen.position.set(x + width/2, y + height/2, 10);
    
    // Rotate to face up (top-down view)
    screen.rotation.x = -Math.PI / 2;
    
    // Add update function for animation
    screen.userData = {
      type: 'tvScreen',
      update: function(deltaTime) {
        material.uniforms.time.value += deltaTime;
      }
    };
    
    // Add to scene
    scene.add(screen);
    
    // Create a point light for the TV
    const light = new THREE.PointLight(0x6666ff, 0.5, 100, 2);
    light.position.set(x + width/2, y + height/2, 20);
    scene.add(light);
    
    return screen;
  }
  
  // Create a mirror
  function createMirror(x, y, width, height, scene) {
    // Use reflective surface from lighting.js
    // This is just a placeholder - the actual mirror functionality
    // is implemented through the reflective surfaces
    
    // Create frame
    const frameGeometry = new THREE.BoxGeometry(width + 10, height + 10, 5);
    const frameMaterial = getMaterial('wood.dark');
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Position
    frame.position.set(x + width/2, y + height/2, 7.5);
    
    // Rotate to face up (top-down view)
    frame.rotation.x = -Math.PI / 2;
    
    // Add to scene
    scene.add(frame);
    
    return frame;
  }
  
  // Create a window with moonlight
  function createWindow(x, y, width, height, scene) {
    // Create window frame
    const frameGeometry = new THREE.BoxGeometry(width + 10, height + 10, 5);
    const frameMaterial = getMaterial('wood.light');
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Position
    frame.position.set(x + width/2, y + height/2, 50); // On wall
    
    // Add to scene
    scene.add(frame);
    
    // Create window glass
    const glassGeometry = new THREE.PlaneGeometry(width, height);
    const glassMaterial = getMaterial('glass.standard');
    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    
    // Position
    glass.position.set(x + width/2, y + height/2, 52.5);
    
    // Add to scene
    scene.add(glass);
    
    // Add moonlight
    const light = new THREE.SpotLight(0xaaaaff, 0.5, 200, Math.PI/4, 0.5, 1);
    light.position.set(x + width/2, y + height/2, 60);
    light.target.position.set(x + width/2, y + height/2 + 100, 0);
    scene.add(light);
    scene.add(light.target);
    
    return frame;
  }
  
  // Create a sink with dripping water effect
  function createSink(x, y, width, height, scene) {
    // This is just a placeholder - the actual sink is created
    // as part of the furniture
    
    // Add dripping water sound
    // Would connect to audio system
    
    return null;
  }
  
  // Create battery pickups throughout the scene
  function createBatteryPickups(scene) {
    const batteries = [];
    
    // Define pickup locations
    const locations = [
      { x: 500, y: 400, z: 5 },
      { x: 1100, y: 300, z: 5 },
      { x: 1200, y: 600, z: 5 },
      { x: 1500, y: 800, z: 5 },
      { x: 900, y: 1200, z: 5 }
    ];
    
    // Create batteries
    for (const loc of locations) {
      const battery = createBatteryPickup(scene, new THREE.Vector3(loc.x, loc.y, loc.z));
      batteries.push(battery);
    }
    
    return batteries;
  }
  
  // Update environment objects
  function updateEnvironment(envObjects, deltaTime) {
    if (!envObjects) return;
    
    // Update each object
    for (const obj of envObjects) {
      if (obj && obj.userData && obj.userData.update) {
        obj.userData.update(deltaTime);
      }
    }
  }