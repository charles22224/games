document.addEventListener('DOMContentLoaded', () => {
    // Initialize game state
    const gameState = {
        player: {
            level: 1,
            health: 100,
            mana: 100
        },
        selectedDungeon: null,
        unlockedDungeons: new Set(['forest-temple', 'crystal-caves', 'sand-temple', 'frost-keep'])
    };

    // Get DOM elements
    const dungeonContainer = document.querySelector('.dungeon-container');
    const infoPanel = document.querySelector('.dungeon-info-panel');
    const closePanelButton = document.querySelector('.close-panel');
    const enterDungeonButton = document.querySelector('.enter-dungeon');
    const viewRewardsButton = document.querySelector('.view-rewards');

    // Audio elements
    const dungeonSelect = document.getElementById('dungeonSelect');
    const dungeonEnter = document.getElementById('dungeonEnter');

    // Dungeon data
    const dungeonData = {
        'forest-temple': {
            name: 'Forest Temple',
            type: 'Standard',
            level: '1-5',
            difficulty: 'Easy',
            party: '1-3 players',
            description: 'A mystical temple hidden deep within the ancient forest. Home to nature spirits and forest guardians.',
            rewards: ['Forest Spirit Armor', 'Nature\'s Blessing', 'Ancient Wood Staff']
        },
        'ancient-grove': {
            name: 'Ancient Grove',
            type: 'Elite',
            level: '10-15',
            difficulty: 'Hard',
            party: '3-5 players',
            description: 'A sacred grove where ancient magic still flows. Beware the powerful nature spirits that guard this place.',
            rewards: ['Grove Keeper\'s Armor', 'Ancient Magic Staff', 'Nature\'s Wrath']
        },
        'crystal-caves': {
            name: 'Crystal Caves',
            type: 'Standard',
            level: '5-10',
            difficulty: 'Medium',
            party: '2-4 players',
            description: 'A network of caves filled with magical crystals. The deeper you go, the more dangerous it becomes.',
            rewards: ['Crystal Armor', 'Mountain\'s Heart', 'Crystal Staff']
        },
        'dragons-lair': {
            name: 'Dragon\'s Lair',
            type: 'Hidden',
            level: '20+',
            difficulty: 'Extreme',
            party: '5+ players',
            description: 'The legendary lair of an ancient dragon. Only the bravest adventurers dare to enter.',
            rewards: ['Dragon Scale Armor', 'Dragon\'s Breath', 'Ancient Dragon Staff']
        },
        'sand-temple': {
            name: 'Sand Temple',
            type: 'Standard',
            level: '8-13',
            difficulty: 'Medium',
            party: '2-4 players',
            description: 'An ancient temple buried beneath the desert sands. The heat and sandstorms make it treacherous.',
            rewards: ['Desert Walker Armor', 'Sandstorm Staff', 'Oasis Blessing']
        },
        'oasis-of-death': {
            name: 'Oasis of Death',
            type: 'Elite',
            level: '15-20',
            difficulty: 'Hard',
            party: '3-5 players',
            description: 'A cursed oasis where water turns to poison. The undead guardians protect ancient treasures.',
            rewards: ['Death Walker Armor', 'Poison Staff', 'Undead Blessing']
        },
        'frost-keep': {
            name: 'Frost Keep',
            type: 'Standard',
            level: '12-17',
            difficulty: 'Medium',
            party: '2-4 players',
            description: 'A fortress of ice and snow. The cold is deadly, and the ice monsters are even worse.',
            rewards: ['Frost Armor', 'Ice Staff', 'Winter\'s Blessing']
        },
        'ice-queens-palace': {
            name: 'Ice Queen\'s Palace',
            type: 'Hidden',
            level: '25+',
            difficulty: 'Extreme',
            party: '5+ players',
            description: 'The palace of the legendary Ice Queen. The cold here can freeze even the strongest warriors.',
            rewards: ['Ice Queen\'s Armor', 'Frost Queen Staff', 'Eternal Winter']
        }
    };

    // Dungeon selection
    document.querySelectorAll('.dungeon').forEach(dungeon => {
        dungeon.addEventListener('click', () => {
            const dungeonId = dungeon.getAttribute('data-id');
            if (gameState.unlockedDungeons.has(dungeonId)) {
                selectDungeon(dungeonId);
            } else {
                showLockedMessage(dungeonId);
            }
        });
    });

    function selectDungeon(dungeonId) {
        const dungeon = dungeonData[dungeonId];
        gameState.selectedDungeon = dungeonId;

        // Update info panel
        document.querySelector('.dungeon-title').textContent = dungeon.name;
        document.querySelector('.dungeon-type').textContent = dungeon.type;
        document.querySelector('.dungeon-level').textContent = dungeon.level;
        document.querySelector('.dungeon-difficulty').textContent = dungeon.difficulty;
        document.querySelector('.dungeon-party').textContent = dungeon.party;
        document.querySelector('.dungeon-text').textContent = dungeon.description;

        // Enable/disable enter button based on level requirement
        const minLevel = parseInt(dungeon.level.split('-')[0]);
        enterDungeonButton.disabled = gameState.player.level < minLevel;

        // Show panel
        infoPanel.style.display = 'block';

        // Play selection sound
        dungeonSelect.currentTime = 0;
        dungeonSelect.play().catch(() => {});
    }

    function showLockedMessage(dungeonId) {
        const dungeon = dungeonData[dungeonId];
        document.querySelector('.dungeon-title').textContent = 'Locked Dungeon';
        document.querySelector('.dungeon-type').textContent = dungeon.type;
        document.querySelector('.dungeon-level').textContent = dungeon.level;
        document.querySelector('.dungeon-difficulty').textContent = dungeon.difficulty;
        document.querySelector('.dungeon-party').textContent = dungeon.party;
        document.querySelector('.dungeon-text').textContent = 'This dungeon is currently locked. Complete previous dungeons to unlock it.';
        enterDungeonButton.disabled = true;
        infoPanel.style.display = 'block';
    }

    // Close panel
    closePanelButton.addEventListener('click', () => {
        infoPanel.style.display = 'none';
        gameState.selectedDungeon = null;
    });

    // Enter dungeon
    enterDungeonButton.addEventListener('click', () => {
        if (gameState.selectedDungeon) {
            // Play enter sound
            dungeonEnter.currentTime = 0;
            dungeonEnter.play().catch(() => {});

            // Add transition effect
            dungeonContainer.style.opacity = '0';
            setTimeout(() => {
                // Here you would typically load the actual dungeon scene
                console.log(`Entering dungeon: ${gameState.selectedDungeon}`);
                // For now, just show a message
                alert('Entering dungeon... (Dungeon scene to be implemented)');
                dungeonContainer.style.opacity = '1';
            }, 1000);
        }
    });

    // View rewards
    viewRewardsButton.addEventListener('click', () => {
        if (gameState.selectedDungeon) {
            const dungeon = dungeonData[gameState.selectedDungeon];
            const rewardsList = dungeon.rewards.join('\n');
            alert(`Possible Rewards:\n${rewardsList}`);
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            infoPanel.style.display = 'none';
            gameState.selectedDungeon = null;
        }
    });
}); 