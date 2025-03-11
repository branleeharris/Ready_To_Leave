// Input handling for keyboard, mouse, and touch controls

// Input state tracking
const inputState = {
    keys: {},
    mouse: {
      x: 0,
      y: 0,
      isLocked: false,
      sensitivity: 0.2
    },
    touch: {
      joystick: {
        active: false,
        startX: 0,
        startY: 0,
        moveX: 0,
        moveY: 0,
        distance: 0,
        angle: 0
      },
      swipe: {
        active: false,
        startX: 0,
        startY: 0,
        moveX: 0,
        moveY: 0
      }
    }
  };
  
  // Setup input handlers
  function setupInputHandlers(player, flashlight) {
    // Setup keyboard handlers
    window.addEventListener('keydown', e => {
      inputState.keys[e.key.toLowerCase()] = true;
    });
  
    window.addEventListener('keyup', e => {
      inputState.keys[e.key.toLowerCase()] = false;
    });
  
    // Setup mouse handlers
    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement) {
        inputState.mouse.isLocked = true;
        
        // Use movement X/Y for locked pointer for smooth camera
        inputState.mouse.x += e.movementX * inputState.mouse.sensitivity;
        inputState.mouse.y += e.movementY * inputState.mouse.sensitivity;
      } else {
        inputState.mouse.isLocked = false;
        
        // Raw coordinates when pointer is not locked
        inputState.mouse.x = e.clientX;
        inputState.mouse.y = e.clientY;
      }
      
      // Update flashlight direction based on mouse position
      updateFlashlightDirection(flashlight, player, inputState.mouse);
    });
  
    // Handle pointer lock changes
    document.addEventListener('pointerlockchange', () => {
      inputState.mouse.isLocked = document.pointerLockElement !== null;
    });
  
    // Set up touch controls for mobile
    setupTouchControls();
    
    // Create joystick if on mobile
    if (isMobileDevice()) {
      createVirtualJoystick();
    }
  
    // Return the input state for use in game logic
    return inputState;
  }
  
  // Update flashlight direction based on mouse position
  function updateFlashlightDirection(flashlight, player, mouseState) {
    if (!flashlight || !player) return;
    
    let targetX, targetY;
    
    if (mouseState.isLocked) {
      // When pointer is locked, use accumulated movement values
      const distance = 50; // Distance to aim point
      targetX = Math.cos(mouseState.x * 0.01) * distance;
      targetY = Math.sin(mouseState.x * 0.01) * distance;
    } else {
      // When pointer is not locked, calculate direction from screen center to mouse
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const dirX = (mouseState.x - centerX);
      const dirY = (mouseState.y - centerY);
      
      // Normalize and scale
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      if (length > 0) {
        targetX = (dirX / length) * 50;
        targetY = (dirY / length) * 50;
      } else {
        targetX = 50;
        targetY = 0;
      }
    }
    
    // Update flashlight target (if flashlight has a target property)
    if (flashlight.target) {
      flashlight.target.position.set(targetX, targetY, 0);
    }
  }
  
  // Get movement input vector from keyboard or virtual joystick
  function getMovementInput() {
    let x = 0;
    let y = 0;
    
    // Keyboard input
    if (inputState.keys['w'] || inputState.keys['arrowup']) y += 1;
    if (inputState.keys['s'] || inputState.keys['arrowdown']) y -= 1;
    if (inputState.keys['a'] || inputState.keys['arrowleft']) x -= 1;
    if (inputState.keys['d'] || inputState.keys['arrowright']) x += 1;
    
    // Touch joystick input (overrides keyboard if active)
    if (inputState.touch.joystick.active) {
      const { distance, angle } = inputState.touch.joystick;
      // Normalize distance to maximum of 1
      const normalizedDistance = Math.min(distance / 50, 1);
      
      x = Math.cos(angle) * normalizedDistance;
      y = Math.sin(angle) * normalizedDistance;
    }
    
    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }
    
    return { x, y };
  }
  
  // Check if user is sneaking (holding shift)
  function isSneak() {
    return inputState.keys['shift'] || false;
  }
  
  // Create virtual joystick for mobile
  function createVirtualJoystick() {
    // Create joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.className = 'mobile-controls';
    joystickContainer.innerHTML = `
      <div class="joystick-base">
        <div class="joystick-thumb"></div>
      </div>
    `;
    document.body.appendChild(joystickContainer);
    
    // Style the joystick
    const style = document.createElement('style');
    style.textContent = `
      .joystick-base {
        position: absolute;
        width: 100px;
        height: 100px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        touch-action: none;
        left: 30px;
        bottom: 30px;
      }
      .joystick-thumb {
        position: absolute;
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        top: 25px;
        left: 25px;
        transform: translate(0, 0);
      }
    `;
    document.head.appendChild(style);
    
    // Get elements
    const joystickBase = document.querySelector('.joystick-base');
    const joystickThumb = document.querySelector('.joystick-thumb');
    
    // Add touch event listeners
    joystickBase.addEventListener('touchstart', handleJoystickStart);
    joystickBase.addEventListener('touchmove', handleJoystickMove);
    joystickBase.addEventListener('touchend', handleJoystickEnd);
    
    // Joystick touch handlers
    function handleJoystickStart(e) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = joystickBase.getBoundingClientRect();
      
      inputState.touch.joystick.active = true;
      inputState.touch.joystick.startX = rect.left + rect.width / 2;
      inputState.touch.joystick.startY = rect.top + rect.height / 2;
    }
    
    function handleJoystickMove(e) {
      if (!inputState.touch.joystick.active) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - inputState.touch.joystick.startX;
      const deltaY = touch.clientY - inputState.touch.joystick.startY;
      
      // Calculate distance and angle
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 50);
      const angle = Math.atan2(deltaY, deltaX);
      
      // Update joystick visual position
      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;
      joystickThumb.style.transform = `translate(${moveX}px, ${moveY}px)`;
      
      // Update input state
      inputState.touch.joystick.moveX = moveX;
      inputState.touch.joystick.moveY = moveY;
      inputState.touch.joystick.distance = distance;
      inputState.touch.joystick.angle = angle;
    }
    
    function handleJoystickEnd(e) {
      e.preventDefault();
      
      // Reset joystick
      joystickThumb.style.transform = 'translate(0, 0)';
      inputState.touch.joystick.active = false;
      inputState.touch.joystick.moveX = 0;
      inputState.touch.joystick.moveY = 0;
      inputState.touch.joystick.distance = 0;
    }
  }
  
  // Setup touch controls for screen swipes (camera control)
  function setupTouchControls() {
    // Only add these events on touch devices
    if (isMobileDevice()) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    function handleTouchStart(e) {
      // Ignore if it's the joystick
      if (e.target.closest('.joystick-base')) return;
      
      const touch = e.touches[0];
      
      inputState.touch.swipe.active = true;
      inputState.touch.swipe.startX = touch.clientX;
      inputState.touch.swipe.startY = touch.clientY;
    }
    
    function handleTouchMove(e) {
      if (!inputState.touch.swipe.active) return;
      
      // Ignore if it's the joystick
      if (e.target.closest('.joystick-base')) return;
      
      const touch = e.touches[0];
      
      // Calculate movement
      inputState.touch.swipe.moveX = touch.clientX - inputState.touch.swipe.startX;
      inputState.touch.swipe.moveY = touch.clientY - inputState.touch.swipe.startY;
      
      // Update mouse position for camera
      inputState.mouse.x += inputState.touch.swipe.moveX * 0.1;
      inputState.mouse.y += inputState.touch.swipe.moveY * 0.1;
      
      // Reset start position to prevent huge jumps
      inputState.touch.swipe.startX = touch.clientX;
      inputState.touch.swipe.startY = touch.clientY;
    }
    
    function handleTouchEnd() {
      inputState.touch.swipe.active = false;
    }
  }
  
  // Check if device is mobile/touch
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }