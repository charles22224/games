document.addEventListener('DOMContentLoaded', () => {
    // Initialize game state
    const gameState = {
        player: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            health: 100,
            mana: 100,
            level: 1
        },
        time: {
            hour: 12,
            minute: 0,
            isNight: false
        }
    };

    // Get DOM elements
    const player = document.querySelector('.player-character');
    const cityContainer = document.querySelector('.city-container');
    const timeDisplay = document.querySelector('.time');
    const dayNightIndicator = document.querySelector('.day-night-indicator');
    const healthBar = document.querySelector('.health-bar');
    const manaBar = document.querySelector('.mana-bar');
    const levelDisplay = document.querySelector('.level');
    const interactionMenu = document.querySelector('.interaction-menu');
    const closeMenuButton = document.querySelector('.close-menu');

    // Audio elements
    const cityAmbience = document.getElementById('cityAmbience');
    const footsteps = document.getElementById('footsteps');
    const npcInteraction = document.getElementById('npcInteraction');

    // Initialize audio
    cityAmbience.volume = 0.3;
    footsteps.volume = 0.2;
    npcInteraction.volume = 0.2;

    // Start ambient sound
    cityAmbience.play().catch(error => {
        console.log('Audio autoplay prevented:', error);
    });

    // Player movement
    let isMoving = false;
    const moveSpeed = 5;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'w' || e.key === 'ArrowUp') {
            gameState.player.y -= moveSpeed;
            isMoving = true;
        }
        if (e.key === 's' || e.key === 'ArrowDown') {
            gameState.player.y += moveSpeed;
            isMoving = true;
        }
        if (e.key === 'a' || e.key === 'ArrowLeft') {
            gameState.player.x -= moveSpeed;
            isMoving = true;
        }
        if (e.key === 'd' || e.key === 'ArrowRight') {
            gameState.player.x += moveSpeed;
            isMoving = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            isMoving = false;
        }
    });

    // Update player position
    function updatePlayerPosition() {
        player.style.transform = `translate(${gameState.player.x}px, ${gameState.player.y}px)`;
        
        // Play footsteps when moving
        if (isMoving && footsteps.paused) {
            footsteps.play().catch(() => {});
        } else if (!isMoving) {
            footsteps.pause();
            footsteps.currentTime = 0;
        }
    }

    // Time system
    function updateTime() {
        gameState.time.minute += 1;
        if (gameState.time.minute >= 60) {
            gameState.time.minute = 0;
            gameState.time.hour += 1;
            if (gameState.time.hour >= 24) {
                gameState.time.hour = 0;
            }
        }

        // Update time display
        const hour = gameState.time.hour.toString().padStart(2, '0');
        const minute = gameState.time.minute.toString().padStart(2, '0');
        timeDisplay.textContent = `${hour}:${minute}`;

        // Update day/night cycle
        const isNight = gameState.time.hour >= 20 || gameState.time.hour < 6;
        if (isNight !== gameState.time.isNight) {
            gameState.time.isNight = isNight;
            cityContainer.classList.toggle('night', isNight);
            dayNightIndicator.textContent = isNight ? '🌙' : '☀️';
        }
    }

    // NPC interaction
    const npcs = document.querySelectorAll('.npc');
    npcs.forEach(npc => {
        npc.addEventListener('click', () => {
            const npcType = npc.getAttribute('data-npc');
            const npcName = npc.querySelector('.npc-name').textContent;
            
            // Update interaction menu
            interactionMenu.querySelector('.npc-title').textContent = npcName;
            interactionMenu.style.display = 'block';
            
            // Play interaction sound
            npcInteraction.currentTime = 0;
            npcInteraction.play().catch(() => {});
        });
    });

    // Close interaction menu
    closeMenuButton.addEventListener('click', () => {
        interactionMenu.style.display = 'none';
    });

    // Menu option handlers
    document.querySelectorAll('.menu-option').forEach(option => {
        option.addEventListener('click', () => {
            const action = option.textContent.toLowerCase();
            console.log(`Selected action: ${action}`);
            // Handle different actions here
            interactionMenu.style.display = 'none';
        });
    });

    // Update UI
    function updateUI() {
        healthBar.style.setProperty('--health', `${gameState.player.health}%`);
        manaBar.style.setProperty('--mana', `${gameState.player.mana}%`);
        levelDisplay.textContent = `Level ${gameState.player.level}`;
    }

    // Game loop
    function gameLoop() {
        updatePlayerPosition();
        updateTime();
        updateUI();
        requestAnimationFrame(gameLoop);
    }

    // Start game loop
    gameLoop();
}); 