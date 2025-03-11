// Main game module - Initialization and Core Game Loop

// Global variables
let scene, camera, renderer, stats;
let player, flashlight, controls;
let updateVisibility, checkPerformance;

// Game state 
const gameState = {
  initialized: false,
  loaded: false,
  paused: false,
  currentRoom: null,
  startTime: 0,
  elapsedTime: 0,
  loadProgress: 0
};

// Game data - Original data from 2D version
const walls = [
  // External walls
  {x: 100, y: 100, width: 1600, height: 40, type: 'wall'}, // Top
  {x: 100, y: 100, width: 40, height: 1200, type: 'wall'}, // Left
  {x: 100, y: 1300, width: 700, height: 40, type: 'wall'}, // Bottom left
  {x: 950, y: 1300, width: 750, height: 40, type: 'wall'}, // Bottom right
  {x: 1700, y: 100, width: 40, height: 1200, type: 'wall'}, // Right
  
  // Room dividers - Entry Hall
  {x: 100, y: 500, width: 300, height: 40, type: 'wall'}, // Top partition
  {x: 500, y: 500, width: 300, height: 40, type: 'wall'}, // Top partition with door gap
  {x: 800, y: 100, width: 40, height: 300, type: 'wall'}, // Right divider
  {x: 800, y: 450, width: 40, height: 250, type: 'wall'}, // Right divider with door gap
  {x: 800, y: 800, width: 40, height: 500, type: 'wall'}, // Right divider continues to bottom
  
  // Living Room
  {x: 1300, y: 100, width: 40, height: 300, type: 'wall'}, // Left divider
  {x: 1300, y: 450, width: 40, height: 350, type: 'wall'}, // Left divider with door gap
  
  // Kitchen
  {x: 800, y: 700, width: 450, height: 40, type: 'wall'}, // Bottom partition
  {x: 1300, y: 700, width: 40, height: 300, type: 'wall'}, // Right divider
  {x: 1300, y: 1050, width: 40, height: 250, type: 'wall'}, // Right divider with door gap
  
  // Bedroom
  {x: 1300, y: 700, width: 400, height: 40, type: 'wall'}, // Top partition
  
  // Bathroom
  {x: 800, y: 1000, width: 300, height: 40, type: 'wall'}, // Top partition
  {x: 1200, y: 1000, width: 100, height: 40, type: 'wall'} // Top partition with door gap
];

// Furniture with height property for 3D rendering
const furniture = [
  // Entry Hall - Just a table and coat rack
  {x: 400, y: 200, width: 120, height: 60, heightZ: 40, type: 'table', color: '#8D6E63', topColor: '#A1887F'},
  {x: 600, y: 150, width: 40, height: 40, heightZ: 80, type: 'coatrack', color: '#5D4037', topColor: '#5D4037'},
  
  // Living Room - Couch, coffee table, TV stand
  {x: 900, y: 250, width: 200, height: 80, heightZ: 50, type: 'sofa', color: '#5D4037', topColor: '#6D4C41'},
  {x: 950, y: 400, width: 100, height: 60, heightZ: 30, type: 'table', color: '#795548', topColor: '#8D6E63'},
  {x: 1150, y: 200, width: 120, height: 50, heightZ: 40, type: 'tvstand', color: '#6D4C41', topColor: '#795548'},
  
  // Kitchen - Counter, island, fridge
  {x: 900, y: 550, width: 250, height: 60, heightZ: 50, type: 'counter', color: '#90A4AE', topColor: '#CFD8DC'},
  {x: 1000, y: 450, width: 100, height: 60, heightZ: 50, type: 'island', color: '#78909C', topColor: '#B0BEC5'},
  {x: 1200, y: 550, width: 60, height: 80, heightZ: 100, type: 'fridge', color: '#CFD8DC', topColor: '#ECEFF1'},
  
  // Bedroom - Bed, dresser, desk
  {x: 1450, y: 850, width: 180, height: 100, heightZ: 40, type: 'bed', color: '#9575CD', topColor: '#B39DDB'},
  {x: 1400, y: 1000, width: 120, height: 60, heightZ: 70, type: 'dresser', color: '#8D6E63', topColor: '#A1887F'},
  {x: 1600, y: 1000, width: 80, height: 60, heightZ: 50, type: 'desk', color: '#A1887F', topColor: '#BCAAA4'},
  
  // Bathroom - Toilet, sink, shower
  {x: 900, y: 1100, width: 60, height: 60, heightZ: 50, type: 'toilet', color: '#ECEFF1', topColor: '#FFFFFF'},
  {x: 1000, y: 1100, width: 80, height: 60, heightZ: 40, type: 'sink', color: '#B0BEC5', topColor: '#ECEFF1'},
  {x: 1100, y: 1100, width: 70, height: 120, heightZ: 80, type: 'shower', color: '#CFD8DC', topColor: '#ECEFF1'}
];

// Reflective surfaces
const reflectiveSurfaces = [
  // Living Room - TV Screen
  {x: 1150, y: 180, width: 100, height: 60, reflectivity: 0.7, type: 'screen'},
  
  // Bathroom - Mirror
  {x: 1000, y: 1080, width: 80, height: 40, reflectivity: 0.9, type: 'mirror'},
  
  // Kitchen - Sink and metal surfaces
  {x: 950, y: 550, width: 60, height: 40, reflectivity: 0.6, type: 'metal'},
  
  // Bedroom - Window
  {x: 1500, y: 720, width: 80, height: 60, reflectivity: 0.5, type: 'glass'}
];

// Room definitions
const rooms = [
  { name: "Entry Hall", x: 400, y: 300, width: 700, height: 400 },
  { name: "Living Room", x: 850, y: 300, width: 450, height: 400 },
  { name: "Kitchen", x: 850, y: 550, width: 450, height: 350 },
  { name: "Bedroom", x: 1350, y: 900, width: 350, height: 400 },
  { name: "Bathroom", x: 950, y: 1150, width: 350, height: 350 }
];

// Spawn points (in open areas within rooms)
const spawnPoints = [
  { x: 400, y: 300 }, // Entry Hall
  { x: 950, y: 250 }, // Living Room
  { x: 1000, y: 600 }, // Kitchen
  { x: 1500, y: 950 }, // Bedroom
  { x: 1000, y: 1200 } // Bathroom
];

// Tracked objects for game logic
let wallObjects = [];
let furnitureObjects = [];
let reflectiveSurfaceObjects = [];
let textureLoader, audioLoader;
let ambientSound, footstepSound;

// Initialize the game
async function init() {
  console.log("Initializing game...");
  updateLoadingProgress(5, "Initializing...");
  
  // Initialize renderer (from renderer.js)
  const result = initRenderer();
  scene = result.scene;
  camera = result.camera;
  renderer = result.renderer;
  
  // Initialize stats monitor if in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    stats = new Stats();
    stats.dom.id = 'stats';
    document.body.appendChild(stats.dom);
  }
  
  // Initialize loaders
  updateLoadingProgress(10, "Loading resources...");
  textureLoader = new THREE.TextureLoader();
  audioLoader = new THREE.AudioLoader();
  
  // Initialize materials
  updateLoadingProgress(20, "Creating materials...");
  await initializeMaterials(textureLoader);
  
  // Create the world
  updateLoadingProgress(40, "Building world...");
  wallObjects = createWorld(scene, walls);
  
  // Create furniture
  updateLoadingProgress(60, "Adding furniture...");
  furnitureObjects = createFurniture(scene, furniture);
  
  // Create player
  updateLoadingProgress(80, "Creating player...");
  player = createPlayer(scene, findValidSpawn());
  
  // Create lighting system
  updateLoadingProgress(85, "Setting up lighting...");
  flashlight = createFlashlight(scene, player);
  reflectiveSurfaceObjects = createReflectiveSurfaces(scene, reflectiveSurfaces);
  
  // Set up input handlers
  updateLoadingProgress(90, "Setting up controls...");
  controls = setupInputHandlers(player, flashlight);
  
  // Set up performance monitoring
  updateLoadingProgress(95, "Optimizing performance...");
  checkPerformance = setupPerformanceMonitoring(scene, renderer, flashlight);
  updateVisibility = setupFrustumCulling(scene, camera);
  
  // Load sounds
  updateLoadingProgress(98, "Loading audio...");
  // Sound loading would go here
  
  // Mark as initialized and set start time
  gameState.initialized = true;
  gameState.startTime = Date.now();
  
  // Start the game loop
  updateLoadingProgress(100, "Ready!");
  setTimeout(startGame, 500); // Short delay to ensure everything is ready
}

// Start the game after loading
function startGame() {
  console.log("Starting game...");
  
  // Hide loading screen
  const loadingScreen = document.getElementById('loadingScreen');
  loadingScreen.style.opacity = 0;
  setTimeout(() => {
    loadingScreen.style.display = 'none';
  }, 500);
  
  // Set body class for cursor control
  document.body.classList.add('playing');
  
  // Lock pointer for FPS style
  renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || 
                                          renderer.domElement.mozRequestPointerLock;
  renderer.domElement.addEventListener('click', () => {
    if (!document.pointerLockElement) {
      renderer.domElement.requestPointerLock();
    }
  });
  
  // Start game loop
  gameState.loaded = true;
  requestAnimationFrame(gameLoop);
}

// Update loading progress
function updateLoadingProgress(percent, message) {
  gameState.loadProgress = percent;
  
  const progressFill = document.querySelector('.progress-fill');
  const loadingContent = document.querySelector('.loading-content h2');
  
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
  
  if (loadingContent && message) {
    loadingContent.textContent = message;
  }
}

// Find valid spawn point
function findValidSpawn() {
  for (const point of spawnPoints) {
    let validSpawn = true;
    
    // Check collisions with furniture
    for (const item of furniture) {
      if (
        point.x >= item.x - 30 && point.x <= item.x + item.width + 30 &&
        point.y >= item.y - 30 && point.y <= item.y + item.height + 30
      ) {
        validSpawn = false;
        break;
      }
    }
    
    if (validSpawn) {
      return { x: point.x, y: point.y, z: 20 }; // z is height in 3D space
    }
  }
  
  // Fallback to first point
  return { x: spawnPoints[0].x, y: spawnPoints[0].y, z: 20 };
}

// Check which room the player is in
function updatePlayerRoom() {
  const playerPosition = {
    x: player.position.x,
    y: player.position.y
  };
  
  let inRoom = null;
  
  for (const room of rooms) {
    if (
      playerPosition.x >= room.x && 
      playerPosition.x <= room.x + room.width &&
      playerPosition.y >= room.y && 
      playerPosition.y <= room.y + room.height
    ) {
      inRoom = room;
      break;
    }
  }
  
  // Update UI if room changed
  if (inRoom !== gameState.currentRoom) {
    gameState.currentRoom = inRoom;
    
    const locationDisplay = document.getElementById('locationDisplay');
    
    if (inRoom) {
      locationDisplay.textContent = inRoom.name;
      locationDisplay.style.opacity = 1;
      
      // Hide after a few seconds
      setTimeout(() => {
        locationDisplay.style.opacity = 0;
      }, 3000);
    } else {
      locationDisplay.style.opacity = 0;
    }
  }
}

// Update game state
function update(deltaTime) {
  if (!gameState.initialized || !gameState.loaded || gameState.paused) {
    return;
  }
  
  // Update player movement and controls
  updatePlayer(player, controls, wallObjects, furnitureObjects, deltaTime);
  
  // Update flashlight (position, direction, battery)
  updateFlashlight(flashlight, player, deltaTime);
  
  // Update reflective surfaces
  updateReflections(reflectiveSurfaceObjects, flashlight, player);
  
  // Check which room the player is in
  updatePlayerRoom();
  
  // Update battery UI
  updateBatteryUI(player.userData.battery);
  
  // Update frustum culling for performance
  if (updateVisibility) {
    updateVisibility();
  }
  
  // Update elapsed time
  gameState.elapsedTime = (Date.now() - gameState.startTime) / 1000;
}

// Update battery UI
function updateBatteryUI(level) {
  const batteryLevel = document.getElementById('batteryLevel');
  const battery = document.getElementById('battery');
  
  if (batteryLevel) {
    batteryLevel.style.width = `${level}%`;
    
    // Add visual effects for low battery
    if (level < 15) {
      if (!battery.classList.contains('low-battery')) {
        battery.classList.add('low-battery');
      }
    } else {
      battery.classList.remove('low-battery');
    }
  }
}

// Main game loop
let lastTime = 0;
function gameLoop(time) {
  // Calculate delta time
  const deltaTime = lastTime === 0 ? 0 : (time - lastTime) / 1000;
  lastTime = time;
  
  // Skip large jumps in time (e.g., when tab is inactive)
  if (deltaTime > 0.1) {
    requestAnimationFrame(gameLoop);
    return;
  }
  
  // Update game state
  update(deltaTime);
  
  // Render scene
  renderer.render(scene, camera);
  
  // Update performance monitoring
  if (stats) {
    stats.update();
  }
  
  if (checkPerformance) {
    checkPerformance(deltaTime);
  }
  
  // Request next frame
  requestAnimationFrame(gameLoop);
}

// Pause/resume game
function togglePause() {
  gameState.paused = !gameState.paused;
  
  // Show/hide pause menu
  // (If you implement a pause menu later)
}

// Handle window resize
window.addEventListener('resize', () => {
  // Update camera aspect ratio
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  if (camera && renderer) {
    if (camera.type === 'PerspectiveCamera') {
      camera.aspect = width / height;
    } else if (camera.type === 'OrthographicCamera') {
      const aspectRatio = width / height;
      const cameraHeight = camera.right / aspectRatio;
      
      camera.top = cameraHeight / 2;
      camera.bottom = -cameraHeight / 2;
    }
    
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gameState.paused = true;
  }
});

// Handle escape key for pause
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    togglePause();
  }
  
  // Toggle UI visibility with 'H' key
  if (e.key === 'h' || e.key === 'H') {
    document.body.classList.toggle('ui-hidden');
  }
});

// Initialize the game when page is loaded
window.addEventListener('load', init);