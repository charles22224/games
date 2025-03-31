document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-button');
    const hoverSound = document.getElementById('hoverSound');
    const ambientSound = document.getElementById('ambientSound');
    const customizationTab = document.querySelector('.customization-tab');
    
    // Start ambient sound when the page loads
    ambientSound.volume = 0.3;
    ambientSound.play().catch(error => {
        console.log('Audio autoplay prevented:', error);
    });

    // Handle hover sound effect
    startButton.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.volume = 0.2;
        hoverSound.play().catch(error => {
            console.log('Hover sound prevented:', error);
        });
    });

    // Handle start button click
    startButton.addEventListener('click', () => {
        // Add a fade-out effect
        document.body.style.transition = 'opacity 1s ease-out';
        document.body.style.opacity = '0';
        
        // Wait for the fade-out animation to complete before redirecting
        setTimeout(() => {
            // Here you would typically redirect to your game
            console.log('Starting game...');
            // window.location.href = 'game.html';
        }, 1000);
    });

    // Add subtle mouse movement effect to the background
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        
        document.querySelector('.menu-container').style.transform = 
            `translate(${x}px, ${y}px)`;
    });

    // Customization Tab Interactions
    if (customizationTab) {
        console.log('Customization tab found');
        
        customizationTab.addEventListener('click', (e) => {
            console.log('Customization tab clicked');
            e.preventDefault();
            e.stopPropagation();
            
            // Add shatter effect
            customizationTab.classList.add('shatter');
            
            // Create shard particles
            createShardParticles(customizationTab);
            
            // Play shatter sound if available
            const shatterSound = new Audio('assets/shatter.mp3');
            shatterSound.volume = 0.3;
            shatterSound.play().catch(error => {
                console.log('Shatter sound prevented:', error);
            });

            // Wait for animation to complete before transitioning
            setTimeout(() => {
                console.log('Transitioning to customization screen...');
                window.location.href = 'customize.html';
            }, 1000);
        });
    } else {
        console.error('Customization tab not found');
    }

    // Fullscreen functionality
    const fullscreenButton = document.querySelector('.fullscreen-button');
    
    // Function to enter fullscreen
    function enterFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
    }

    // Enter fullscreen on page load
    enterFullscreen();

    // Handle fullscreen button click
    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            enterFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Update fullscreen button text based on state
    document.addEventListener('fullscreenchange', () => {
        const buttonText = fullscreenButton.querySelector('.button-text');
        if (document.fullscreenElement) {
            buttonText.textContent = 'EXIT FULLSCREEN';
        } else {
            buttonText.textContent = 'FULLSCREEN';
        }
    });

    // Handle fullscreen exit attempts
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            // Re-enter fullscreen if exited
            setTimeout(enterFullscreen, 100);
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.fullscreenElement) {
            // Re-enter fullscreen if escaped
            setTimeout(enterFullscreen, 100);
        }
    });
});

// Function to create shard particles
function createShardParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const shard = document.createElement('div');
        shard.className = 'shard-particle';
        
        // Random angle and distance for particle movement
        const angle = (Math.random() * 360) * Math.PI / 180;
        const distance = 50 + Math.random() * 100;
        
        // Calculate final position
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const rotation = Math.random() * 360;
        
        // Set custom properties for animation
        shard.style.setProperty('--tx', `${tx}px`);
        shard.style.setProperty('--ty', `${ty}px`);
        shard.style.setProperty('--r', `${rotation}deg`);
        
        // Position the shard at the center of the element
        shard.style.left = `${centerX}px`;
        shard.style.top = `${centerY}px`;
        
        document.body.appendChild(shard);
        
        // Remove the shard after animation
        setTimeout(() => shard.remove(), 1000);
    }
} 