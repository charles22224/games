// Three.js setup
let scene, camera, renderer, controls;
let player, boss, environment;
let gameState = {
    player: {
        health: 100,
        maxHealth: 100,
        mana: 100,
        maxMana: 100,
        level: 1,
        abilities: [
            { name: 'Attack', damage: 20, manaCost: 0, cooldown: 0 },
            { name: 'Fireball', damage: 40, manaCost: 30, cooldown: 5 },
            { name: 'Shield', damage: 0, manaCost: 20, cooldown: 8 },
            { name: 'Heal', damage: 0, manaCost: 40, cooldown: 10 }
        ]
    },
    boss: {
        name: 'Dragon Lord',
        health: 1000,
        maxHealth: 1000,
        phase: 1,
        totalPhases: 3,
        abilities: [],
        currentAbility: null,
        lastAbilityTime: 0
    },
    environment: {
        type: 'mountain',
        hazards: [],
        platforms: []
    },
    combatLog: [],
    isPhaseTransitioning: false,
    isGameStarted: false
};

// Initialize Three.js scene
function initScene() {
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

    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Create environment
    createEnvironment();

    // Create characters
    createPlayer();
    createBoss();

    // Start animation loop
    animate();
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
    // Create player body
    const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 1, 5);
    body.castShadow = true;
    scene.add(body);

    // Create player head
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 2.5, 5);
    head.castShadow = true;
    scene.add(head);

    // Create player arms
    const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 1.5, 5);
    leftArm.castShadow = true;
    scene.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 1.5, 5);
    rightArm.castShadow = true;
    scene.add(rightArm);

    // Create player legs
    const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, 0, 5);
    leftLeg.castShadow = true;
    scene.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, 0, 5);
    rightLeg.castShadow = true;
    scene.add(rightLeg);

    // Store player reference
    player = {
        body,
        head,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        position: new THREE.Vector3(0, 1, 5)
    };
}

// Create boss character
function createBoss() {
    // Create boss body
    const bodyGeometry = new THREE.BoxGeometry(3, 4, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 2, -5);
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
        position: new THREE.Vector3(0, 2, -5)
    };
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Animate characters
    animatePlayer();
    animateBoss();

    // Render scene
    renderer.render(scene, camera);
}

// Animate player
function animatePlayer() {
    if (!player) return;

    // Add idle animation
    const time = Date.now() * 0.001;
    player.body.position.y = 1 + Math.sin(time * 2) * 0.1;
    player.head.position.y = 2.5 + Math.sin(time * 2) * 0.1;
}

// Animate boss
function animateBoss() {
    if (!boss) return;

    // Add idle animation
    const time = Date.now() * 0.001;
    boss.body.position.y = 2 + Math.sin(time) * 0.2;
    boss.head.position.y = 4 + Math.sin(time) * 0.2;
    boss.leftWing.rotation.z = Math.PI / 4 + Math.sin(time * 2) * 0.1;
    boss.rightWing.rotation.z = -Math.PI / 4 + Math.sin(time * 2) * 0.1;
}

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start game function
function startGame() {
    if (gameState.isGameStarted) return;
    
    gameState.isGameStarted = true;
    
    // Hide start screen
    const startScreen = document.querySelector('.start-screen');
    if (startScreen) {
        startScreen.style.display = 'none';
    }

    // Initialize Three.js scene
    initScene();

    // Start background music
    const bossMusic = document.getElementById('bossMusic');
    if (bossMusic) {
        bossMusic.play().catch(error => {
            console.log('Audio playback failed:', error);
        });
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up start button listener
    const startButton = document.querySelector('.start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
}); 