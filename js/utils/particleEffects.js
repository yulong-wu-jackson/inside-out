// particleEffects.js - Functions for creating and managing particle effects

/**
 * Initialize particles for landing page background
 */
function initParticles() {
  const particlesContainer = document.querySelector('.particles-container');
  
  // Create particles
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size between 3px and 8px
    const size = Math.random() * 5 + 3;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random opacity
    const opacity = Math.random() * 0.5 + 0.1;
    
    // Random color based on MBTI categories
    const colors = [
      'rgba(74, 107, 220, 0.7)', // Analysts
      'rgba(156, 86, 220, 0.7)',  // Diplomats
      'rgba(63, 158, 77, 0.7)',   // Sentinels
      'rgba(230, 161, 23, 0.7)'   // Explorers
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Apply styles
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      top: ${posY}%;
      left: ${posX}%;
      opacity: ${opacity};
      pointer-events: none;
    `;
    
    particlesContainer.appendChild(particle);
    
    // Animate with GSAP
    gsap.to(particle, {
      y: Math.random() * 100 - 10,
      x: Math.random() * 100 - 10,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 20 + 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}

// Make functions available globally
window.initParticles = initParticles; 