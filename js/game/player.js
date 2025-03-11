// Player controls, movement, and interactions

// Create player object
function createPlayer(scene, spawnPoint) {
    // Create player mesh
    const playerGeometry = new THREE.CylinderGeometry(18, 18, 10, 32);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    
    // Position player at spawn point
    player.position.set(spawnPoint.x, spawnPoint.y, spawnPoint.z);
    
    // Rotate to face up in top-down view
    player.rotation.x = Math.PI / 2;
    
    // Add shadow properties
    player.castShadow = true;
    player.receiveShadow = true;
    
    // Add to scene
    scene.add(player);
    
    // Add player properties
    player.userData = {
      speed: 0,
      maxSpeed: 4,
      acceleration: 0.2,
      deceleration: 0.15,
      velocity: { x: 0, y: 0 },
      isMoving: false,
      isSneaking: false,
      battery: 100,
      batteryDrainRate: 0.02,
      footstepTimer: 0,
      footstepInterval: 0.5
    };
    
    // Add flashlight indicator (direction marker)
    addFlashlightIndicator(player);
    
    return player;
  }
  
  // Add flashlight direction indicator to player
  function addFlashlightIndicator(player) {
    const indicatorGeometry = new THREE.ConeGeometry(5, 15, 8);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    
    // Position in front of player
    indicator.position.set(20, 0, 0);
    
    // Rotate to point forward
    indicator.rotation.z = -Math.PI / 2;
    
    // Add to player
    player.add(indicator);
    
    // Store reference
    player.userData.flashlightIndicator = indicator;
  }
  
  // Update player movement and position
  function updatePlayer(player, controls, walls, furniture, deltaTime) {
    if (!player || !controls) return;
    
    // Get input state
    const movementInput = getMovementInput();
    player.userData.isMoving = (movementInput.x !== 0 || movementInput.y !== 0);
    player.userData.isSneaking = isSneak();
    
    // Adjust max speed based on sneaking
    const maxCurrentSpeed = player.userData.isSneaking ? 
      player.userData.maxSpeed * 0.5 : 
      player.userData.maxSpeed;
    
    // Apply acceleration/deceleration
    if (player.userData.isMoving) {
      player.userData.speed = Math.min(
        player.userData.speed + player.userData.acceleration,
        maxCurrentSpeed
      );
      
      // Calculate movement angle
      const angle = Math.atan2(movementInput.y, movementInput.x);
      
      // Update velocity based on angle and speed
      player.userData.velocity.x = Math.cos(angle) * player.userData.speed;
      player.userData.velocity.y = Math.sin(angle) * player.userData.speed;
      
      // Play footstep sounds
      updateFootsteps(player, deltaTime);
    } else {
      // Apply deceleration
      player.userData.speed = Math.max(
        player.userData.speed - player.userData.deceleration,
        0
      );
      
      // Maintain direction but reduce speed
      if (player.userData.speed > 0) {
        const currentAngle = Math.atan2(
          player.userData.velocity.y,
          player.userData.velocity.x
        );
        
        player.userData.velocity.x = Math.cos(currentAngle) * player.userData.speed;
        player.userData.velocity.y = Math.sin(currentAngle) * player.userData.speed;
      } else {
        player.userData.velocity.x = 0;
        player.userData.velocity.y = 0;
      }
    }
    
    // Calculate new position
    const newX = player.position.x + player.userData.velocity.x;
    const newY = player.position.y + player.userData.velocity.y;
    
    // Check collisions and update position
    const radius = player.geometry.parameters.radiusTop;
    
    // Try moving on X axis
    if (!checkCollision(newX, player.position.y, radius, walls, furniture)) {
      player.position.x = newX;
    }
    
    // Try moving on Y axis
    if (!checkCollision(player.position.x, newY, radius, walls, furniture)) {
      player.position.y = newY;
    }
    
    // Make camera follow player
    if (window.cameraController) {
      window.cameraController.update(player.position);
    }
  }
  
  // Check collision with walls and furniture
  function checkCollision(x, y, radius, walls, furniture) {
    // Check walls
    for (const wall of walls) {
      const wallData = wall.userData.originalData;
      
      // Calculate closest point on wall to player
      const closestX = Math.max(wallData.x, Math.min(x, wallData.x + wallData.width));
      const closestY = Math.max(wallData.y, Math.min(y, wallData.y + wallData.height));
      
      // Calculate distance between closest point and player
      const distanceX = x - closestX;
      const distanceY = y - closestY;
      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
      
      if (distanceSquared < (radius * radius)) {
        return true;
      }
    }
    
    // Check furniture (using helper from furniture.js)
    return checkFurnitureCollision(x, y, radius, furniture);
  }
  
  // Play footstep sounds based on movement
  function updateFootsteps(player, deltaTime) {
    // Update footstep timer
    player.userData.footstepTimer += deltaTime;
    
    // Calculate interval based on speed and sneaking
    const interval = player.userData.isSneaking ? 0.8 : 0.4;
    
    // Play sound when interval is reached
    if (player.userData.footstepTimer >= interval) {
      player.userData.footstepTimer = 0;
      playFootstepSound(player);
    }
  }
  
  // Play appropriate footstep sound based on location
  function playFootstepSound(player) {
    // This would connect to an audio system
    // For now, we'll just log that a step occurred
    // console.log("Step");
  }
  
  // Interact with objects in front of the player
  function interactWithObjects(player, scene, flashlight) {
    // Calculate direction player is facing (based on flashlight)
    const direction = new THREE.Vector3();
    flashlight.target.getWorldPosition(direction);
    direction.sub(player.position).normalize();
    
    // Create raycaster for interaction
    const raycaster = new THREE.Raycaster(
      player.position.clone(),
      direction,
      0,
      100
    );
    
    // Find intersections with scene objects
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Check for interactable objects
    for (const intersect of intersects) {
      const object = intersect.object;
      
      // Skip player itself
      if (object === player) continue;
      
      // Check if object is interactable
      if (object.userData && object.userData.interactable) {
        // Trigger the interaction
        object.userData.onInteract(player);
        return true;
      }
    }
    
    return false;
  }
  
  // Make an object interactable
  function makeInteractable(object, interactFunction) {
    if (!object) return;
    
    // Set interactable flag
    object.userData.interactable = true;
    
    // Set interaction function
    object.userData.onInteract = interactFunction || function(player) {
      console.log("Interacted with", object);
    };
  }
  
  // Create a battery pickup
  function createBatteryPickup(scene, position) {
    // Create a battery mesh
    const geometry = new THREE.BoxGeometry(15, 25, 10);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xFFFF00,
      emissive: 0x554400,
      emissiveIntensity: 0.3
    });
    
    const battery = new THREE.Mesh(geometry, material);
    battery.position.copy(position);
    battery.position.z += 5; // Lift slightly above ground
    
    // Add slight rotation for visual effect
    battery.rotation.z = Math.PI / 6;
    
    // Make it float and rotate
    const initialY = position.y;
    const rotationSpeed = 1;
    const floatHeight = 5;
    const floatSpeed = 1.5;
    
    // Animation update function
    battery.userData.update = function(deltaTime) {
      // Rotate
      battery.rotation.z += rotationSpeed * deltaTime;
      
      // Float up and down
      battery.position.y = initialY + Math.sin(Date.now() / 1000 * floatSpeed) * floatHeight;
    };
    
    // Make interactable
    makeInteractable(battery, function(player) {
      // Recharge player's flashlight
      if (player.userData.battery < 100) {
        player.userData.battery = 100;
        
        // Get flashlight and update
        const flashlight = player.children.find(child => child.isSpotLight);
        if (flashlight && flashlight.userData) {
          flashlight.userData.battery = 100;
        }
        
        // Remove battery from scene
        scene.remove(battery);
        
        // Play pickup sound
        // playSound('battery_pickup');
        
        // Show message
        showMessage("Battery recharged!");
      }
    });
    
    // Add to scene
    scene.add(battery);
    
    return battery;
  }
  
  // Show a message to the player
  function showMessage(text, duration = 3000) {
    // Create or get message element
    let messageElement = document.getElementById('playerMessage');
    
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'playerMessage';
      messageElement.style.position = 'absolute';
      messageElement.style.bottom = '100px';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translateX(-50%)';
      messageElement.style.padding = '10px 20px';
      messageElement.style.background = 'rgba(0, 0, 0, 0.7)';
      messageElement.style.color = 'white';
      messageElement.style.borderRadius = '5px';
      messageElement.style.fontFamily = 'Arial, sans-serif';
      messageElement.style.zIndex = '100';
      messageElement.style.opacity = '0';
      messageElement.style.transition = 'opacity 0.3s';
      document.body.appendChild(messageElement);
    }
    
    // Set message text
    messageElement.textContent = text;
    
    // Show message
    setTimeout(() => {
      messageElement.style.opacity = '1';
    }, 10);
    
    // Hide after duration
    setTimeout(() => {
      messageElement.style.opacity = '0';
    }, duration);
  }