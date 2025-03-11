// Furniture creation with detailed 3D models

// Factory for creating furniture
const furnitureFactory = {
    // Create table with legs
    createTable: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Table top
      const topGeometry = new THREE.BoxGeometry(item.width, item.height, 5);
      const topMaterial = getMaterial('wood.light');
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(0, 0, item.heightZ - 2.5);
      top.castShadow = true;
      top.receiveShadow = true;
      
      // Table legs
      const legGeometry = new THREE.BoxGeometry(10, 10, item.heightZ - 5);
      const legMaterial = getMaterial('wood.medium');
      
      // Create legs at corners
      const legPositions = [
        [-item.width/2 + 10, -item.height/2 + 10, (item.heightZ - 5)/2],
        [item.width/2 - 10, -item.height/2 + 10, (item.heightZ - 5)/2],
        [-item.width/2 + 10, item.height/2 - 10, (item.heightZ - 5)/2],
        [item.width/2 - 10, item.height/2 - 10, (item.heightZ - 5)/2]
      ];
      
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
      });
      
      group.add(top);
      group.userData = { type: 'table', originalData: item };
      return group;
    },
    
    // Create sofa with cushions
    createSofa: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Base/frame
      const baseGeometry = new THREE.BoxGeometry(item.width, item.height, 15);
      const baseMaterial = getMaterial('wood.dark');
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, 7.5);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      
      // Back
      const backGeometry = new THREE.BoxGeometry(item.width, 15, 35);
      const back = new THREE.Mesh(backGeometry, baseMaterial);
      back.position.set(0, item.height/2 - 7.5, 30);
      back.castShadow = true;
      back.receiveShadow = true;
      group.add(back);
      
      // Arm rests
      const armGeometry = new THREE.BoxGeometry(20, item.height, 25);
      const armLeft = new THREE.Mesh(armGeometry, baseMaterial);
      armLeft.position.set(-item.width/2 + 10, 0, 20);
      armLeft.castShadow = true;
      armLeft.receiveShadow = true;
      group.add(armLeft);
      
      const armRight = new THREE.Mesh(armGeometry, baseMaterial);
      armRight.position.set(item.width/2 - 10, 0, 20);
      armRight.castShadow = true;
      armRight.receiveShadow = true;
      group.add(armRight);
      
      // Seat cushions
      const cushionMaterial = getMaterial('fabric.standard');
      const cushionGeometry = new THREE.BoxGeometry(
        item.width - 50,
        item.height - 30,
        10
      );
      const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
      cushion.position.set(0, 0, 20);
      cushion.castShadow = true;
      cushion.receiveShadow = true;
      group.add(cushion);
      
      // Back cushions
      const backCushionGeometry = new THREE.BoxGeometry(
        (item.width - 50) / 2 - 5,
        15,
        20
      );
      
      const leftCushion = new THREE.Mesh(backCushionGeometry, cushionMaterial);
      leftCushion.position.set(-((item.width - 50) / 4) - 2.5, item.height/2 - 15, 35);
      leftCushion.castShadow = true;
      leftCushion.receiveShadow = true;
      group.add(leftCushion);
      
      const rightCushion = new THREE.Mesh(backCushionGeometry, cushionMaterial);
      rightCushion.position.set(((item.width - 50) / 4) + 2.5, item.height/2 - 15, 35);
      rightCushion.castShadow = true;
      rightCushion.receiveShadow = true;
      group.add(rightCushion);
      
      group.userData = { type: 'sofa', originalData: item };
      return group;
    },
    
    // Create bed with frame and mattress
    createBed: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Frame
      const frameHeight = 15;
      const frameGeometry = new THREE.BoxGeometry(item.width, item.height, frameHeight);
      const frameMaterial = getMaterial('wood.dark');
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(0, 0, frameHeight/2);
      frame.castShadow = true;
      frame.receiveShadow = true;
      group.add(frame);
      
      // Mattress
      const mattressGeometry = new THREE.BoxGeometry(item.width - 20, item.height - 20, 25);
      const mattressMaterial = getMaterial('fabric.standard');
      const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
      mattress.position.set(0, 0, frameHeight + 12.5);
      mattress.castShadow = true;
      mattress.receiveShadow = true;
      group.add(mattress);
      
      // Pillow
      const pillowGeometry = new THREE.BoxGeometry(item.width / 3, item.height / 3, 10);
      const pillowMaterial = getMaterial('fabric.blue');
      const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
      pillow.position.set(0, -item.height/3, frameHeight + 25 + 5);
      pillow.castShadow = true;
      pillow.receiveShadow = true;
      group.add(pillow);
      
      // Headboard
      const headboardGeometry = new THREE.BoxGeometry(item.width, 20, 50);
      const headboard = new THREE.Mesh(headboardGeometry, frameMaterial);
      headboard.position.set(0, -item.height/2 - 10, 25);
      headboard.castShadow = true;
      headboard.receiveShadow = true;
      group.add(headboard);
      
      group.userData = { type: 'bed', originalData: item };
      return group;
    },
    
    // Create dresser with drawers
    createDresser: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Main body
      const bodyGeometry = new THREE.BoxGeometry(item.width, item.height, item.heightZ);
      const bodyMaterial = getMaterial('wood.medium');
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.set(0, 0, item.heightZ/2);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // Drawers
      const drawerRows = 3;
      const drawerCols = 2;
      const drawerWidth = (item.width - 15) / drawerCols;
      const drawerHeight = (item.height - 15) / drawerRows;
      const drawerDepth = 2;
      const drawerMaterial = getMaterial('wood.light');
      const handleMaterial = getMaterial('metal.standard');
      
      for (let row = 0; row < drawerRows; row++) {
        for (let col = 0; col < drawerCols; col++) {
          // Drawer front
          const drawerGeometry = new THREE.BoxGeometry(drawerWidth - 5, drawerHeight - 5, drawerDepth);
          const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
          drawer.position.set(
            (col - 0.5) * drawerWidth + (col === 0 ? 2.5 : -2.5),
            (row - 1) * drawerHeight + (row === 0 ? -2.5 : row === 2 ? 2.5 : 0),
            item.heightZ/2 + 1
          );
          drawer.castShadow = true;
          drawer.receiveShadow = true;
          group.add(drawer);
          
          // Handle
          const handleGeometry = new THREE.BoxGeometry(10, 3, 3);
          const handle = new THREE.Mesh(handleGeometry, handleMaterial);
          handle.position.set(
            drawer.position.x,
            drawer.position.y,
            item.heightZ/2 + 3.5
          );
          handle.castShadow = true;
          handle.receiveShadow = true;
          group.add(handle);
        }
      }
      
      group.userData = { type: 'dresser', originalData: item };
      return group;
    },
    
    // Create desk with legs
    createDesk: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Top
      const topGeometry = new THREE.BoxGeometry(item.width, item.height, 5);
      const topMaterial = getMaterial('wood.light');
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(0, 0, item.heightZ - 2.5);
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);
      
      // Legs
      const legGeometry = new THREE.BoxGeometry(5, 5, item.heightZ - 5);
      const legMaterial = getMaterial('wood.dark');
      
      const legPositions = [
        [-item.width/2 + 5, -item.height/2 + 5, (item.heightZ - 5)/2],
        [item.width/2 - 5, -item.height/2 + 5, (item.heightZ - 5)/2],
        [-item.width/2 + 5, item.height/2 - 5, (item.heightZ - 5)/2],
        [item.width/2 - 5, item.height/2 - 5, (item.heightZ - 5)/2]
      ];
      
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        leg.receiveShadow = true;
        group.add(leg);
      });
      
      // Add drawers
      const drawerWidth = item.width - 20;
      const drawerHeight = item.height - 20;
      const drawerDepth = 20;
      
      const drawerGeometry = new THREE.BoxGeometry(drawerWidth, drawerHeight, drawerDepth);
      const drawerMaterial = getMaterial('wood.medium');
      const drawer = new THREE.Mesh(drawerGeometry, drawerMaterial);
      drawer.position.set(0, 0, item.heightZ - drawerDepth/2 - 5);
      drawer.castShadow = true;
      drawer.receiveShadow = true;
      group.add(drawer);
      
      // Handle
      const handleGeometry = new THREE.BoxGeometry(10, 3, 3);
      const handleMaterial = getMaterial('metal.standard');
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.set(0, -5, item.heightZ - 5);
      handle.castShadow = true;
      handle.receiveShadow = true;
      group.add(handle);
      
      group.userData = { type: 'desk', originalData: item };
      return group;
    },
    
    // Create fridge with door and handle
    createFridge: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Main body
      const bodyGeometry = new THREE.BoxGeometry(item.width, item.height, item.heightZ);
      const bodyMaterial = getMaterial('metal.standard');
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.set(0, 0, item.heightZ/2);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);
      
      // Door divider line
      const dividerGeometry = new THREE.BoxGeometry(item.width, 2, 1);
      const dividerMaterial = getMaterial('metal.dark');
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      divider.position.set(0, item.height/6, item.heightZ/2 + 0.5);
      divider.castShadow = false;
      divider.receiveShadow = true;
      group.add(divider);
      
      // Handles
      const handleGeometry = new THREE.BoxGeometry(3, 15, 3);
      const handleMaterial = getMaterial('metal.dark');
      
      // Top door handle
      const topHandle = new THREE.Mesh(handleGeometry, handleMaterial);
      topHandle.position.set(item.width/2 - 5, item.height/3, item.heightZ/2 + 2);
      topHandle.castShadow = true;
      topHandle.receiveShadow = true;
      group.add(topHandle);
      
      // Bottom door handle
      const bottomHandle = new THREE.Mesh(handleGeometry, handleMaterial);
      bottomHandle.position.set(item.width/2 - 5, -item.height/4, item.heightZ/2 + 2);
      bottomHandle.castShadow = true;
      bottomHandle.receiveShadow = true;
      group.add(bottomHandle);
      
      group.userData = { type: 'fridge', originalData: item };
      return group;
    },
    
    // Create counter or cabinet
    createCounter: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Base cabinet
      const baseGeometry = new THREE.BoxGeometry(item.width, item.height, item.heightZ - 5);
      const baseMaterial = getMaterial('wood.medium');
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, (item.heightZ - 5)/2);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      
      // Countertop
      const topGeometry = new THREE.BoxGeometry(item.width + 6, item.height + 6, 5);
      const topMaterial = getMaterial('plastic.standard');
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(0, 0, item.heightZ - 2.5);
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);
      
      // Cabinet doors
      const numDoors = Math.ceil(item.width / 60);
      const doorWidth = (item.width - 10) / numDoors;
      
      for (let i = 0; i < numDoors; i++) {
        const doorGeometry = new THREE.BoxGeometry(doorWidth - 5, item.height - 10, 2);
        const doorMaterial = getMaterial('wood.light');
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(
          (i - (numDoors - 1) / 2) * doorWidth,
          0,
          item.heightZ / 4
        );
        door.castShadow = true;
        door.receiveShadow = true;
        group.add(door);
        
        // Door handle
        const handleGeometry = new THREE.CylinderGeometry(1, 1, 5, 8);
        const handleMaterial = getMaterial('metal.standard');
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(
          door.position.x + doorWidth / 4,
          0,
          item.heightZ / 4 + 2
        );
        handle.castShadow = true;
        handle.receiveShadow = true;
        group.add(handle);
      }
      
      group.userData = { type: 'counter', originalData: item };
      return group;
    },
    
    // Create toilet
    createToilet: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Base
      const baseGeometry = new THREE.BoxGeometry(item.width, item.height - 10, 20);
      const baseMaterial = getMaterial('plastic.white');
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, -5, 10);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      
      // Seat
      const seatGeometry = new THREE.BoxGeometry(item.width, item.height - 15, 5);
      const seatMaterial = getMaterial('plastic.white');
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.set(0, -2.5, 22.5);
      seat.castShadow = true;
      seat.receiveShadow = true;
      group.add(seat);
      
      // Tank
      const tankGeometry = new THREE.BoxGeometry(item.width - 10, 10, 30);
      const tankMaterial = getMaterial('plastic.white');
      const tank = new THREE.Mesh(tankGeometry, tankMaterial);
      tank.position.set(0, item.height/2 - 5, 25);
      tank.castShadow = true;
      tank.receiveShadow = true;
      group.add(tank);
      
      // Lid
      const lidGeometry = new THREE.BoxGeometry(item.width, item.height - 15, 3);
      const lidMaterial = getMaterial('plastic.white');
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, -2.5, 26.5);
      lid.castShadow = true;
      lid.receiveShadow = true;
      group.add(lid);
      
      group.userData = { type: 'toilet', originalData: item };
      return group;
    },
    
    // Create sink
    createSink: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Cabinet
      const cabinetGeometry = new THREE.BoxGeometry(item.width, item.height, 35);
      const cabinetMaterial = getMaterial('wood.medium');
      const cabinet = new THREE.Mesh(cabinetGeometry, cabinetMaterial);
      cabinet.position.set(0, 0, 17.5);
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      group.add(cabinet);
      
      // Countertop
      const counterGeometry = new THREE.BoxGeometry(item.width + 10, item.height + 10, 5);
      const counterMaterial = getMaterial('plastic.white');
      const counter = new THREE.Mesh(counterGeometry, counterMaterial);
      counter.position.set(0, 0, 37.5);
      counter.castShadow = true;
      counter.receiveShadow = true;
      group.add(counter);
      
      // Sink basin
      const basinGeometry = new THREE.BoxGeometry(item.width - 20, item.height - 20, 10);
      const basinMaterial = getMaterial('metal.standard');
      const basin = new THREE.Mesh(basinGeometry, basinMaterial);
      basin.position.set(0, 0, 35);
      basin.castShadow = true;
      basin.receiveShadow = true;
      group.add(basin);
      
      // Faucet base
      const faucetBaseGeometry = new THREE.CylinderGeometry(3, 3, 5, 8);
      const faucetMaterial = getMaterial('metal.standard');
      const faucetBase = new THREE.Mesh(faucetBaseGeometry, faucetMaterial);
      faucetBase.position.set(0, -item.height/4, 42.5);
      faucetBase.castShadow = true;
      faucetBase.receiveShadow = true;
      group.add(faucetBase);
      
      // Faucet neck
      const faucetNeckGeometry = new THREE.CylinderGeometry(2, 2, 15, 8);
      const faucetNeck = new THREE.Mesh(faucetNeckGeometry, faucetMaterial);
      faucetNeck.rotation.x = Math.PI / 2;
      faucetNeck.position.set(0, -item.height/4 - 7.5, 47.5);
      faucetNeck.castShadow = true;
      faucetNeck.receiveShadow = true;
      group.add(faucetNeck);
      
      group.userData = { type: 'sink', originalData: item };
      return group;
    },
    
    // Create shower
    createShower: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Shower base
      const baseGeometry = new THREE.BoxGeometry(item.width, item.height, 5);
      const baseMaterial = getMaterial('plastic.white');
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.set(0, 0, 2.5);
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);
      
      // Glass walls - Create semicircular walls
      const glassHeight = 75;
      const wallMaterial = getMaterial('glass.standard');
      
      // Back wall
      const backWallGeometry = new THREE.BoxGeometry(item.width, 5, glassHeight);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.set(0, -item.height/2 + 2.5, glassHeight/2 + 5);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      group.add(backWall);
      
      // Side walls
      const sideWallGeometry = new THREE.BoxGeometry(5, item.height, glassHeight);
      
      const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      leftWall.position.set(-item.width/2 + 2.5, 0, glassHeight/2 + 5);
      leftWall.castShadow = true;
      leftWall.receiveShadow = true;
      group.add(leftWall);
      
      const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
      rightWall.position.set(item.width/2 - 2.5, 0, glassHeight/2 + 5);
      rightWall.castShadow = true;
      rightWall.receiveShadow = true;
      group.add(rightWall);
      
      // Shower head
      const headGeometry = new THREE.CylinderGeometry(5, 5, 5, 8);
      const headMaterial = getMaterial('metal.standard');
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.rotation.x = Math.PI / 2;
      head.position.set(0, -item.height/2 + 10, glassHeight - 10);
      head.castShadow = true;
      head.receiveShadow = true;
      group.add(head);
      
      // Shower rod
      const rodGeometry = new THREE.CylinderGeometry(1, 1, item.width - 10, 8);
      const rodMaterial = getMaterial('metal.standard');
      const rod = new THREE.Mesh(rodGeometry, rodMaterial);
      rod.rotation.z = Math.PI / 2;
      rod.position.set(0, item.height/2 - 10, glassHeight - 5);
      rod.castShadow = true;
      rod.receiveShadow = true;
      group.add(rod);
      
      group.userData = { type: 'shower', originalData: item };
      return group;
    },
    
    // Create a default fallback for unknown furniture
    createDefault: function(item, materials) {
      const group = new THREE.Group();
      group.position.set(item.x + item.width/2, item.y + item.height/2, 0);
      
      // Create a simple box
      const geometry = new THREE.BoxGeometry(item.width, item.height, item.heightZ || 40);
      const material = getMaterial('wood.medium');
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, (item.heightZ || 40) / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      
      group.userData = { type: 'unknown', originalData: item };
      return group;
    }
  };
  
  // Create furniture from data
  function createFurniture(scene, furnitureData) {
    const furnitureObjects = [];
    
    for (const item of furnitureData) {
      let furniture;
      
      // Create different types of furniture based on the type
      switch (item.type) {
        case 'table':
          furniture = furnitureFactory.createTable(item);
          break;
        case 'sofa':
          furniture = furnitureFactory.createSofa(item);
          break;
        case 'bed':
          furniture = furnitureFactory.createBed(item);
          break;
        case 'dresser':
          furniture = furnitureFactory.createDresser(item);
          break;
        case 'desk':
          furniture = furnitureFactory.createDesk(item);
          break;
        case 'fridge':
          furniture = furnitureFactory.createFridge(item);
          break;
        case 'counter':
        case 'island':
        case 'tvstand':
          furniture = furnitureFactory.createCounter(item);
          break;
        case 'toilet':
          furniture = furnitureFactory.createToilet(item);
          break;
        case 'sink':
          furniture = furnitureFactory.createSink(item);
          break;
        case 'shower':
          furniture = furnitureFactory.createShower(item);
          break;
        default:
          furniture = furnitureFactory.createDefault(item);
          break;
      }
      
      // Add furniture to scene
      scene.add(furniture);
      
      // Add to tracking array
      furnitureObjects.push({
        threeObject: furniture,
        originalData: item,
        // Add collision box (for simplified collision detection)
        collider: {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          type: item.type
        }
      });
    }
    
    return furnitureObjects;
  }
  
  // Create lower detail versions of furniture for performance optimization
  function createLowDetailFurniture(scene, furnitureObjects) {
    // For each furniture, create a simplified version
    furnitureObjects.forEach(furniture => {
      const item = furniture.originalData;
      
      // Create simplified geometry (just a box)
      const geometry = new THREE.BoxGeometry(item.width, item.height, item.heightZ || 40);
      const material = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(item.color || '#8D6E63')
      });
      
      const simpleMesh = new THREE.Mesh(geometry, material);
      simpleMesh.position.set(
        item.x + item.width/2,
        item.y + item.height/2,
        (item.heightZ || 40) / 2
      );
      simpleMesh.castShadow = true;
      simpleMesh.receiveShadow = true;
      
      // Add metadata
      simpleMesh.userData = {
        isLowDetail: true,
        originalData: item,
        detailLevel: 0.5,
        highDetailObject: furniture.threeObject
      };
      
      // Hide by default
      simpleMesh.visible = false;
      
      // Add to scene
      scene.add(simpleMesh);
      
      // Reference in original object
      furniture.lowDetailObject = simpleMesh;
    });
  }
  
  // Check collisions with furniture
  function checkFurnitureCollision(x, y, radius, furniture) {
    for (const item of furniture) {
      const collider = item.collider;
      
      // Expanded bounds with radius
      const expandedX = collider.x - radius;
      const expandedY = collider.y - radius;
      const expandedWidth = collider.width + (radius * 2);
      const expandedHeight = collider.height + (radius * 2);
      
      // Check if player is inside expanded bounds
      if (
        x >= expandedX && x <= expandedX + expandedWidth &&
        y >= expandedY && y <= expandedY + expandedHeight
      ) {
        // More precise collision: find closest point on rectangle and check distance
        const closestX = Math.max(collider.x, Math.min(x, collider.x + collider.width));
        const closestY = Math.max(collider.y, Math.min(y, collider.y + collider.height));
        
        const distanceX = x - closestX;
        const distanceY = y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        
        if (distanceSquared < (radius * radius)) {
          return true;
        }
      }
    }
    
    return false;
  }