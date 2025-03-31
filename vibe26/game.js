// Game State
const gameState = {
    isStarted: false,
    isPaused: false,
    player: {
        health: 500,
        maxHealth: 500,
        mana: 100,
        maxMana: 100,
        level: 1,
        position: new THREE.Vector3(0, 1, 5),
        rotation: new THREE.Euler(0, 0, 0),
        abilities: [
            { name: 'Attack', damage: 20, manaCost: 0, cooldown: 0, lastUsed: 0 },
            { name: 'Fireball', damage: 40, manaCost: 30, cooldown: 5, lastUsed: 0 },
            { name: 'Shield', damage: 0, manaCost: 20, cooldown: 8, lastUsed: 0 },
            { name: 'Heal', damage: 0, manaCost: 50, cooldown: 10, lastUsed: 0 }
        ],
        isShielded: false,
        shieldDuration: 0,
        manaRegenRate: 5, // Mana points per second
        lastManaRegen: 0,
        moveSpeed: 0.15,
        runSpeed: 0.3,
        isRunning: false,
        isJumping: false,
        isDodging: false,
        jumpForce: 0.4,
        jumpVelocity: 0,
        gravity: 0.015,
        dodgeSpeed: 0.4,
        dodgeDuration: 500, // milliseconds
        lastDodgeTime: 0,
        keys: {
            forward: false,
            backward: false,
            left: false,
            right: false,
            shift: false,
            space: false,
            q: false
        },
        collider: {
            radius: 0.5,
            height: 2
        }
    },
    boss: {
        health: 1000,
        maxHealth: 1000,
        phase: 1,
        totalPhases: 3,
        position: new THREE.Vector3(0, 2, -5),
        rotation: new THREE.Euler(0, 0, 0),
        abilities: [
            { name: 'FireBreath', damage: 15, cooldown: 5, lastUsed: 0 },
            { name: 'GroundSlam', damage: 20, cooldown: 8, lastUsed: 0 },
            { name: 'WingBlast', damage: 12, cooldown: 6, lastUsed: 0 },
            { name: 'DragonRage', damage: 25, cooldown: 12, lastUsed: 0 }
        ],
        currentAbility: null,
        lastAbilityTime: 0,
        attackInterval: 3000, // Attack every 3 seconds
        lastAttackTime: 0
    },
    environment: {
        type: 'mountain',
        hazards: [],
        platforms: []
    }
};

// Three.js Setup
let scene, camera, renderer;
let player, boss, environment;
let abilityButtons = {};

// Camera settings
const cameraSettings = {
    distance: 10,
    height: 5,
    smoothness: 0.1,
    targetOffset: new THREE.Vector3(0, 2, 0),
    rotationSpeed: 0.05,
    currentRotation: {
        x: 0,
        y: 0
    }
};

// Initialize the game
function init() {
    console.log('Initializing game...');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create environment
    createEnvironment();

    // Create characters
    createPlayer();
    createBoss();

    // Set up event listeners
    setupEventListeners();

    // Initialize ability buttons
    initializeAbilityButtons();

    // Start animation loop
    animate();
    
    console.log('Game initialized successfully');
}

// Initialize ability buttons
function initializeAbilityButtons() {
    const buttons = document.querySelectorAll('.ability-button');
    buttons.forEach(button => {
        const abilityName = button.dataset.ability;
        abilityButtons[abilityName] = {
            element: button,
            cooldownOverlay: document.createElement('div'),
            lastUsed: 0
        };
        
        // Add cooldown overlay
        const overlay = document.createElement('div');
        overlay.className = 'cooldown-overlay';
        overlay.style.display = 'none';
        button.appendChild(overlay);
        abilityButtons[abilityName].cooldownOverlay = overlay;

        // Add click handler
        button.addEventListener('click', () => {
            if (!gameState.isStarted || gameState.isPaused) return;
            useAbility(abilityName);
        });
    });

    // Add pause button handler
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
}

// Toggle pause state
function togglePause() {
    if (!gameState.isStarted) return;
    
    gameState.isPaused = !gameState.isPaused;
    const pauseButton = document.getElementById('pause-button');
    const pauseOverlay = document.getElementById('pause-overlay');
    
    if (pauseButton) {
        pauseButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
        pauseButton.style.backgroundColor = gameState.isPaused ? '#4CAF50' : '#f44336';
    }
    
    if (pauseOverlay) {
        pauseOverlay.style.display = gameState.isPaused ? 'flex' : 'none';
    }

    // Disable/enable ability buttons
    const buttons = document.querySelectorAll('.ability-button');
    buttons.forEach(button => {
        button.disabled = gameState.isPaused;
    });
}

// Use ability
function useAbility(abilityName) {
    const ability = gameState.player.abilities.find(a => a.name === abilityName);
    if (!ability) return;

    const currentTime = Date.now();
    const timeSinceLastUse = (currentTime - ability.lastUsed) / 1000;

    // Check cooldown
    if (timeSinceLastUse < ability.cooldown) {
        return;
    }

    // Check mana cost
    if (gameState.player.mana < ability.manaCost) {
        return;
    }

    // Use ability
    switch (abilityName) {
        case 'Attack':
            performAttack();
            break;
        case 'Fireball':
            castFireball();
            break;
        case 'Shield':
            activateShield();
            break;
        case 'Heal':
            castHeal();
            break;
    }

    // Update cooldown and mana
    ability.lastUsed = currentTime;
    gameState.player.mana -= ability.manaCost;
    updateUI();

    // Update button state
    const button = abilityButtons[abilityName];
    if (button) {
        button.element.disabled = true;
        button.cooldownOverlay.style.display = 'flex';
        button.cooldownOverlay.textContent = ability.cooldown;

        // Start cooldown timer
        let timeLeft = ability.cooldown;
        const cooldownInterval = setInterval(() => {
            timeLeft--;
            button.cooldownOverlay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(cooldownInterval);
                button.element.disabled = false;
                button.cooldownOverlay.style.display = 'none';
            }
        }, 1000);
    }
}

// Perform attack
function performAttack() {
    // Create attack animation
    const attackDuration = 500; // 500ms
    const startTime = Date.now();
    
    const originalRotation = player.rightArm.rotation.x;
    player.rightArm.rotation.x = -Math.PI / 2;

    setTimeout(() => {
        player.rightArm.rotation.x = originalRotation;
    }, attackDuration);

    // Deal damage
    gameState.boss.health -= gameState.player.abilities[0].damage;
    updateUI();
}

// Cast fireball
function castFireball() {
    // Create fireball effect
    const fireballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const fireballMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff2200,
        emissiveIntensity: 0.5
    });
    const fireball = new THREE.Mesh(fireballGeometry, fireballMaterial);
    fireball.position.copy(player.position);
    scene.add(fireball);

    // Animate fireball
    const startTime = Date.now();
    const duration = 1000; // 1 second
    const startPos = fireball.position.clone();
    const endPos = boss.position.clone();

    function animateFireball() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        fireball.position.lerpVectors(startPos, endPos, progress);

        if (progress < 1) {
            requestAnimationFrame(animateFireball);
        } else {
            scene.remove(fireball);
            // Deal damage
            gameState.boss.health -= gameState.player.abilities[1].damage;
            updateUI();
        }
    }

    animateFireball();
}

// Activate shield
function activateShield() {
    gameState.player.isShielded = true;
    gameState.player.shieldDuration = 5000; // 5 seconds

    // Create shield effect
    const shieldGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const shieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        emissive: 0x00ffff,
        emissiveIntensity: 0.2
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.copy(player.position);
    scene.add(shield);

    // Store shield reference
    player.shield = shield;

    // Remove shield after duration
    setTimeout(() => {
        gameState.player.isShielded = false;
        if (player.shield) {
            scene.remove(player.shield);
            player.shield = null;
        }
    }, gameState.player.shieldDuration);
}

// Cast heal
function castHeal() {
    // Create heal effect
    const healGeometry = new THREE.SphereGeometry(2, 32, 32);
    const healMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.3,
        emissive: 0x00ff00,
        emissiveIntensity: 0.2
    });
    const heal = new THREE.Mesh(healGeometry, healMaterial);
    heal.position.copy(player.position);
    scene.add(heal);

    // Store heal reference
    player.heal = heal;

    // Heal player for 150 health points
    gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + 150);
    updateUI();

    // Remove heal effect after 1 second
    setTimeout(() => {
        if (player.heal) {
            scene.remove(player.heal);
            player.heal = null;
        }
    }, 1000);
}

// Update UI
function updateUI() {
    // Update player stats
    document.getElementById('player-health').textContent = gameState.player.health;
    document.getElementById('player-health-fill').style.width = `${(gameState.player.health / gameState.player.maxHealth) * 100}%`;
    document.getElementById('player-mana').textContent = Math.round(gameState.player.mana);
    document.getElementById('player-mana-fill').style.width = `${(gameState.player.mana / gameState.player.maxMana) * 100}%`;

    // Update boss stats
    document.getElementById('boss-health').textContent = gameState.boss.health;
    document.getElementById('boss-health-fill').style.width = `${(gameState.boss.health / gameState.boss.maxHealth) * 100}%`;
    document.getElementById('boss-phase').textContent = gameState.boss.phase;

    // Check for game over
    if (gameState.boss.health <= 0) {
        alert('Victory! You have defeated the boss!');
        location.reload();
    }
    if (gameState.player.health <= 0) {
        alert('Game Over! The boss has defeated you!');
        location.reload();
    }
}

// Create environment
function createEnvironment() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Add environment based on type
    switch(gameState.environment.type) {
        case 'mountain':
            createMountainEnvironment();
            break;
        case 'forest':
            createForestEnvironment();
            break;
        case 'desert':
            createDesertEnvironment();
            break;
        case 'ice':
            createIceEnvironment();
            break;
    }
}

// Create mountain environment
function createMountainEnvironment() {
    // Add mountains in background
    for (let i = 0; i < 5; i++) {
        const mountainGeometry = new THREE.ConeGeometry(5, 15, 32);
        const mountainMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a4a4a,
            roughness: 0.9,
            metalness: 0.1
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(i * 10 - 20, 7.5, -20);
        mountain.castShadow = true;
        scene.add(mountain);
    }

    // Add lava pits
    const lavaGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
    const lavaMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff4400,
        emissive: 0xff2200,
        emissiveIntensity: 0.5
    });
    const lava = new THREE.Mesh(lavaGeometry, lavaMaterial);
    lava.position.set(0, 0.25, -10);
    scene.add(lava);
}

// Create player character
function createPlayer() {
    // Create player body (slightly slimmer and taller)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 2.2, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a90e2,
        metalness: 0.3,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.copy(gameState.player.position);
    body.castShadow = true;
    scene.add(body);

    // Create player head (more detailed)
    const headGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.5,
        roughness: 0.5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.copy(gameState.player.position).add(new THREE.Vector3(0, 2.3, 0));
    head.castShadow = true;
    scene.add(head);

    // Create player arms (thinner and longer)
    const armGeometry = new THREE.BoxGeometry(0.25, 1.2, 0.25);
    const armMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a90e2,
        metalness: 0.3,
        roughness: 0.7
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.copy(gameState.player.position).add(new THREE.Vector3(-0.6, 1.6, 0));
    leftArm.castShadow = true;
    scene.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.copy(gameState.player.position).add(new THREE.Vector3(0.6, 1.6, 0));
    rightArm.castShadow = true;
    scene.add(rightArm);

    // Create player legs (thinner and longer)
    const legGeometry = new THREE.BoxGeometry(0.25, 1.2, 0.25);
    const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4a90e2,
        metalness: 0.3,
        roughness: 0.7
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.copy(gameState.player.position).add(new THREE.Vector3(-0.25, 0, 0));
    leftLeg.castShadow = true;
    scene.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.copy(gameState.player.position).add(new THREE.Vector3(0.25, 0, 0));
    rightLeg.castShadow = true;
    scene.add(rightLeg);

    // Create cape
    const capeGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.1);
    const capeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2c3e50,
        metalness: 0.1,
        roughness: 0.9
    });
    const cape = new THREE.Mesh(capeGeometry, capeMaterial);
    cape.position.copy(gameState.player.position).add(new THREE.Vector3(0, 1.1, -0.4));
    cape.castShadow = true;
    scene.add(cape);

    // Create shoulder pads
    const shoulderGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.2);
    const shoulderMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.5,
        roughness: 0.5
    });
    
    const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    leftShoulder.position.copy(gameState.player.position).add(new THREE.Vector3(-0.6, 2, 0));
    leftShoulder.castShadow = true;
    scene.add(leftShoulder);

    const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    rightShoulder.position.copy(gameState.player.position).add(new THREE.Vector3(0.6, 2, 0));
    rightShoulder.castShadow = true;
    scene.add(rightShoulder);

    // Create belt
    const beltGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.8);
    const beltMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffd700,
        metalness: 0.5,
        roughness: 0.5
    });
    const belt = new THREE.Mesh(beltGeometry, beltMaterial);
    belt.position.copy(gameState.player.position).add(new THREE.Vector3(0, 1.1, 0));
    belt.castShadow = true;
    scene.add(belt);

    // Store player reference
    player = {
        body,
        head,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        cape,
        leftShoulder,
        rightShoulder,
        belt,
        position: gameState.player.position,
        rotation: gameState.player.rotation
    };
}

// Create boss character
function createBoss() {
    // Create boss body
    const bodyGeometry = new THREE.BoxGeometry(3, 4, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.copy(gameState.boss.position);
    body.castShadow = true;
    scene.add(body);

    // Create boss head
    const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 4, -5);
    head.castShadow = true;
    scene.add(head);

    // Create boss wings
    const wingGeometry = new THREE.BoxGeometry(4, 0.5, 2);
    const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-2, 2, -5);
    leftWing.rotation.z = Math.PI / 4;
    leftWing.castShadow = true;
    scene.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(2, 2, -5);
    rightWing.rotation.z = -Math.PI / 4;
    rightWing.castShadow = true;
    scene.add(rightWing);

    // Store boss reference
    boss = {
        body,
        head,
        leftWing,
        rightWing,
        position: gameState.boss.position,
        rotation: gameState.boss.rotation
    };
}

// Set up event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start button
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }

    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle key down
function handleKeyDown(event) {
    if (!gameState.isStarted) return;

    switch(event.key.toLowerCase()) {
        case 'w':
            if (!gameState.isPaused) gameState.player.keys.forward = true;
            break;
        case 's':
            if (!gameState.isPaused) gameState.player.keys.backward = true;
            break;
        case 'a':
            if (!gameState.isPaused) gameState.player.keys.left = true;
            break;
        case 'd':
            if (!gameState.isPaused) gameState.player.keys.right = true;
            break;
        case 'shift':
            if (!gameState.isPaused) {
                gameState.player.keys.shift = true;
                gameState.player.isRunning = true;
            }
            break;
        case ' ':
            if (!gameState.isPaused) {
                gameState.player.keys.space = true;
                if (!gameState.player.isJumping) {
                    gameState.player.isJumping = true;
                    gameState.player.jumpVelocity = gameState.player.jumpForce;
                }
            }
            break;
        case 'q':
            if (!gameState.isPaused) {
                gameState.player.keys.q = true;
                performDodge();
            }
            break;
        case 'escape':
            togglePause();
            break;
        case 'arrowleft':
            if (!gameState.isPaused) cameraSettings.currentRotation.y += cameraSettings.rotationSpeed;
            break;
        case 'arrowright':
            if (!gameState.isPaused) cameraSettings.currentRotation.y -= cameraSettings.rotationSpeed;
            break;
        case 'arrowup':
            if (!gameState.isPaused) cameraSettings.currentRotation.x = Math.max(-Math.PI/2, cameraSettings.currentRotation.x - cameraSettings.rotationSpeed);
            break;
        case 'arrowdown':
            if (!gameState.isPaused) cameraSettings.currentRotation.x = Math.min(Math.PI/2, cameraSettings.currentRotation.x + cameraSettings.rotationSpeed);
            break;
    }
}

// Handle key up
function handleKeyUp(event) {
    if (!gameState.isStarted) return;

    switch(event.key.toLowerCase()) {
        case 'w':
            gameState.player.keys.forward = false;
            break;
        case 's':
            gameState.player.keys.backward = false;
            break;
        case 'a':
            gameState.player.keys.left = false;
            break;
        case 'd':
            gameState.player.keys.right = false;
            break;
        case 'shift':
            gameState.player.keys.shift = false;
            gameState.player.isRunning = false;
            break;
        case ' ':
            gameState.player.keys.space = false;
            break;
        case 'q':
            gameState.player.keys.q = false;
            break;
    }
}

// Start game
function startGame() {
    console.log('Starting game...');
    
    if (gameState.isStarted) {
        console.log('Game already started');
        return;
    }
    
    gameState.isStarted = true;
    
    // Hide start screen
    const startScreen = document.getElementById('start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log('Start screen hidden');
    }

    // Show UI elements
    const ui = document.getElementById('ui');
    if (ui) {
        ui.style.display = 'block';
        console.log('UI elements shown');
    }

    // Show and enable pause button
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.style.display = 'block';
        pauseButton.disabled = false;
        pauseButton.textContent = 'Pause';
    }

    // Enable ability buttons
    const buttons = document.querySelectorAll('.ability-button');
    buttons.forEach(button => {
        button.disabled = false;
    });

    // Initialize game
    init();
    
    console.log('Game started successfully');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    if (!gameState.isPaused) {
        // Update player movement
        updatePlayerMovement();

        // Update camera
        updateCamera();

        // Animate characters
        animatePlayer();
        animateBoss();

        // Regenerate mana
        regenerateMana();

        // Update UI
        updateUI();
    }

    // Render scene
    renderer.render(scene, camera);
}

// Animate player
function animatePlayer() {
    if (!player) return;

    const time = Date.now() * 0.001;
    const baseY = 1;
    const bounceHeight = 0.1;
    
    // Determine if player is moving
    const isMoving = gameState.player.keys.forward || gameState.player.keys.backward || 
                     gameState.player.keys.left || gameState.player.keys.right;
    
    // Update animation based on movement state
    if (isMoving) {
        // Running animation
        const runSpeed = gameState.player.isRunning ? 4 : 2;
        const runHeight = gameState.player.isRunning ? 0.15 : 0.1;
        
        // Body bounce
        player.body.position.y = baseY + Math.sin(time * runSpeed) * runHeight;
        
        // Head movement
        player.head.position.y = baseY + 2 + Math.sin(time * runSpeed) * runHeight;
        
        // Arm swing
        player.leftArm.rotation.x = Math.sin(time * runSpeed) * 0.5;
        player.rightArm.rotation.x = -Math.sin(time * runSpeed) * 0.5;
        
        // Leg movement
        player.leftLeg.rotation.x = Math.sin(time * runSpeed) * 0.5;
        player.rightLeg.rotation.x = -Math.sin(time * runSpeed) * 0.5;
    } else {
        // Idle animation
        player.body.position.y = baseY + Math.sin(time * 2) * bounceHeight;
        player.head.position.y = baseY + 2 + Math.sin(time * 2) * bounceHeight;
        player.leftArm.rotation.x = 0;
        player.rightArm.rotation.x = 0;
        player.leftLeg.rotation.x = 0;
        player.rightLeg.rotation.x = 0;
    }
}

// Animate boss
function animateBoss() {
    if (!boss) return;

    const time = Date.now() * 0.001;
    
    // Base idle animation
    boss.body.position.y = 2 + Math.sin(time) * 0.2;
    boss.head.position.y = 4 + Math.sin(time) * 0.2;
    boss.leftWing.rotation.z = Math.PI / 4 + Math.sin(time * 2) * 0.1;
    boss.rightWing.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.1;

    // Check if it's time to attack
    const currentTime = Date.now();
    if (currentTime - gameState.boss.lastAttackTime >= gameState.boss.attackInterval) {
        performBossAttack();
        gameState.boss.lastAttackTime = currentTime;
    }
}

// Perform boss attack
function performBossAttack() {
    if (!boss || !gameState.isStarted) return;

    const currentTime = Date.now();
    const availableAbilities = gameState.boss.abilities.filter(ability => 
        (currentTime - ability.lastUsed) / 1000 >= ability.cooldown
    );

    if (availableAbilities.length === 0) return;

    // Select random ability based on phase
    let selectedAbility;
    switch (gameState.boss.phase) {
        case 1:
            selectedAbility = availableAbilities[Math.floor(Math.random() * 2)]; // Only first two abilities
            break;
        case 2:
            selectedAbility = availableAbilities[Math.floor(Math.random() * 3)]; // First three abilities
            break;
        case 3:
            selectedAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)]; // All abilities
            break;
    }

    // Execute the selected ability
    switch (selectedAbility.name) {
        case 'FireBreath':
            performFireBreath();
            break;
        case 'GroundSlam':
            performGroundSlam();
            break;
        case 'WingBlast':
            performWingBlast();
            break;
        case 'DragonRage':
            performDragonRage();
            break;
    }

    // Update ability cooldown
    selectedAbility.lastUsed = currentTime;
}

// Boss abilities
function performFireBreath() {
    // Create fire breath effect
    const fireGeometry = new THREE.ConeGeometry(2, 8, 32);
    const fireMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4400,
        emissive: 0xff2200,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const fire = new THREE.Mesh(fireGeometry, fireMaterial);
    fire.position.copy(boss.position).add(new THREE.Vector3(0, 2, 2));
    fire.rotation.x = -Math.PI / 2;
    scene.add(fire);

    // Animate fire breath
    const startTime = Date.now();
    const duration = 1000; // 1 second

    function animateFireBreath() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        fire.scale.y = 1 - progress;
        fire.position.z = boss.position.z + 2 + progress * 4;

        if (progress < 1) {
            requestAnimationFrame(animateFireBreath);
        } else {
            scene.remove(fire);
            // Deal damage
            gameState.player.health -= gameState.boss.abilities[0].damage;
            updateUI();
        }
    }

    animateFireBreath();
}

function performGroundSlam() {
    // Create ground slam effect
    const slamGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 32);
    const slamMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const slam = new THREE.Mesh(slamGeometry, slamMaterial);
    slam.position.copy(player.position);
    slam.position.y = 0.25;
    scene.add(slam);

    // Animate ground slam
    const startTime = Date.now();
    const duration = 500; // 0.5 seconds

    function animateGroundSlam() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        slam.scale.y = 1 - progress;
        slam.material.opacity = 0.8 * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(animateGroundSlam);
        } else {
            scene.remove(slam);
            // Deal damage
            gameState.player.health -= gameState.boss.abilities[1].damage;
            updateUI();
        }
    }

    animateGroundSlam();
}

function performWingBlast() {
    // Create wing blast effect
    const blastGeometry = new THREE.BoxGeometry(8, 0.5, 2);
    const blastMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8800,
        emissive: 0xff8800,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const blast = new THREE.Mesh(blastGeometry, blastMaterial);
    blast.position.copy(boss.position).add(new THREE.Vector3(0, 2, 0));
    scene.add(blast);

    // Animate wing blast
    const startTime = Date.now();
    const duration = 800; // 0.8 seconds

    function animateWingBlast() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        blast.scale.x = 1 - progress;
        blast.material.opacity = 0.8 * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(animateWingBlast);
        } else {
            scene.remove(blast);
            // Deal damage
            gameState.player.health -= gameState.boss.abilities[2].damage;
            updateUI();
        }
    }

    animateWingBlast();
}

function performDragonRage() {
    // Create dragon rage effect
    const rageGeometry = new THREE.SphereGeometry(5, 32, 32);
    const rageMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const rage = new THREE.Mesh(rageGeometry, rageMaterial);
    rage.position.copy(boss.position);
    scene.add(rage);

    // Animate dragon rage
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds

    function animateDragonRage() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        rage.scale.setScalar(1 + progress);
        rage.material.opacity = 0.8 * (1 - progress);

        if (progress < 1) {
            requestAnimationFrame(animateDragonRage);
        } else {
            scene.remove(rage);
            // Deal damage
            gameState.player.health -= gameState.boss.abilities[3].damage;
            updateUI();
        }
    }

    animateDragonRage();
}

// Regenerate mana
function regenerateMana() {
    const currentTime = Date.now();
    const timeSinceLastRegen = (currentTime - gameState.player.lastManaRegen) / 1000;
    
    // Regenerate mana based on time passed
    if (timeSinceLastRegen >= 1) { // Update every second
        const manaToAdd = gameState.player.manaRegenRate * timeSinceLastRegen;
        gameState.player.mana = Math.min(gameState.player.maxMana, gameState.player.mana + manaToAdd);
        gameState.player.lastManaRegen = currentTime;
        updateUI();
    }
}

// Update player movement
function updatePlayerMovement() {
    if (!player || !gameState.isStarted) return;

    const moveSpeed = gameState.player.isRunning ? gameState.player.runSpeed : gameState.player.moveSpeed;
    const newPosition = player.position.clone();
    let isMoving = false;
    let moveDirection = new THREE.Vector3();

    // Calculate movement direction
    if (gameState.player.keys.forward) {
        moveDirection.z -= 1;
        isMoving = true;
    }
    if (gameState.player.keys.backward) {
        moveDirection.z += 1;
        isMoving = true;
    }
    if (gameState.player.keys.left) {
        moveDirection.x -= 1;
        isMoving = true;
    }
    if (gameState.player.keys.right) {
        moveDirection.x += 1;
        isMoving = true;
    }

    // Normalize movement direction
    if (isMoving) {
        moveDirection.normalize();
        moveDirection.multiplyScalar(moveSpeed);
        newPosition.add(moveDirection);

        // Update rotation to face movement direction
        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        player.rotation.y = angle;
    }

    // Apply jump physics
    if (gameState.player.isJumping) {
        gameState.player.jumpVelocity -= gameState.player.gravity;
        newPosition.y += gameState.player.jumpVelocity;

        // Check for ground collision
        if (newPosition.y <= 1) {
            newPosition.y = 1;
            gameState.player.isJumping = false;
            gameState.player.jumpVelocity = 0;
        }
    }

    // Check collision before applying movement
    if (!checkCollision(newPosition)) {
        player.position.copy(newPosition);
        updatePlayerParts();
    }
}

// Check collision with environment
function checkCollision(newPosition) {
    const playerCollider = gameState.player.collider;
    
    // Check collision with ground boundaries
    const groundSize = 25; // Half of the ground size
    if (Math.abs(newPosition.x) > groundSize - playerCollider.radius ||
        Math.abs(newPosition.z) > groundSize - playerCollider.radius) {
        return true;
    }

    // Check collision with mountains
    const mountains = scene.children.filter(child => child.geometry instanceof THREE.ConeGeometry);
    for (const mountain of mountains) {
        const mountainPos = mountain.position;
        const mountainRadius = mountain.geometry.parameters.radius;
        const mountainHeight = mountain.geometry.parameters.height;
        
        const dx = newPosition.x - mountainPos.x;
        const dz = newPosition.z - mountainPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < mountainRadius + playerCollider.radius) {
            return true;
        }
    }

    return false;
}

// Update camera position
function updateCamera() {
    if (!player || !gameState.isStarted) return;

    // Calculate target position
    const targetPosition = player.position.clone().add(cameraSettings.targetOffset);
    
    // Calculate camera position based on rotation
    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(player.position);
    
    // Calculate offset based on camera rotation
    const offset = new THREE.Vector3(0, cameraSettings.height, cameraSettings.distance);
    
    // Apply rotation
    offset.applyEuler(new THREE.Euler(
        cameraSettings.currentRotation.x,
        cameraSettings.currentRotation.y,
        0
    ));
    
    cameraPosition.add(offset);
    
    // Smoothly update camera position
    camera.position.lerp(cameraPosition, cameraSettings.smoothness);
    
    // Make camera look at player
    camera.lookAt(targetPosition);
}

// Perform dodge
function performDodge() {
    if (gameState.player.isDodging) return;

    const currentTime = Date.now();
    if (currentTime - gameState.player.lastDodgeTime < gameState.player.dodgeDuration) return;

    gameState.player.isDodging = true;
    gameState.player.lastDodgeTime = currentTime;

    // Calculate dodge direction based on movement direction
    let dodgeDirection = new THREE.Vector3();
    if (gameState.player.keys.forward) dodgeDirection.z -= 1;
    if (gameState.player.keys.backward) dodgeDirection.z += 1;
    if (gameState.player.keys.left) dodgeDirection.x -= 1;
    if (gameState.player.keys.right) dodgeDirection.x += 1;

    // If no movement direction, dodge to the right
    if (dodgeDirection.length() === 0) {
        dodgeDirection.x = 1;
    }

    dodgeDirection.normalize();
    dodgeDirection.multiplyScalar(gameState.player.dodgeSpeed);

    // Apply dodge movement
    const newPosition = player.position.clone().add(dodgeDirection);
    if (!checkCollision(newPosition)) {
        player.position.copy(newPosition);
        updatePlayerParts();
    }

    // Reset dodge state after duration
    setTimeout(() => {
        gameState.player.isDodging = false;
    }, gameState.player.dodgeDuration);
}

// Update player parts position
function updatePlayerParts() {
    if (!player) return;

    const playerHeight = player.position.y;
    const baseHeight = 1; // The normal ground height

    // Calculate jump offset for all parts
    let jumpOffset = 0;
    if (gameState.player.isJumping) {
        const jumpProgress = (playerHeight - baseHeight) / (gameState.player.jumpForce / gameState.player.gravity);
        jumpOffset = Math.sin(jumpProgress * Math.PI) * 0.5;
    }

    // Update all player parts position relative to the body
    player.body.position.copy(player.position);
    player.head.position.copy(player.position).add(new THREE.Vector3(0, 2.3 + jumpOffset, 0));
    player.leftArm.position.copy(player.position).add(new THREE.Vector3(-0.6, 1.6 + jumpOffset, 0));
    player.rightArm.position.copy(player.position).add(new THREE.Vector3(0.6, 1.6 + jumpOffset, 0));
    player.leftLeg.position.copy(player.position).add(new THREE.Vector3(-0.25, jumpOffset, 0));
    player.rightLeg.position.copy(player.position).add(new THREE.Vector3(0.25, jumpOffset, 0));
    player.cape.position.copy(player.position).add(new THREE.Vector3(0, 1.1 + jumpOffset, -0.4));
    player.leftShoulder.position.copy(player.position).add(new THREE.Vector3(-0.6, 2 + jumpOffset, 0));
    player.rightShoulder.position.copy(player.position).add(new THREE.Vector3(0.6, 2 + jumpOffset, 0));
    player.belt.position.copy(player.position).add(new THREE.Vector3(0, 1.1 + jumpOffset, 0));

    // Update shield position if active
    if (player.shield) {
        player.shield.position.copy(player.position);
    }

    // Update heal position if active
    if (player.heal) {
        player.heal.position.copy(player.position);
    }
} 