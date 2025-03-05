// animationUtils.js - Utility functions for animations and visual effects

/**
 * Initialize animations using GSAP
 */
function initAnimations() {
  // Animate landing page elements
  const landingTimeline = gsap.timeline();
  landingTimeline
    .from('.glass-container', { 
      duration: 1.2, 
      y: 50, 
      opacity: 0, 
      ease: 'power3.out' 
    })
    .from('.scroll-indicator', { 
      duration: 0.4, 
      y: 30, 
      opacity: 0, 
      ease: 'power2.out' 
    }, '-=0.5');
  
  // Animate MBTI traits on scroll
  gsap.utils.toArray('.trait').forEach((trait, i) => {
    gsap.from(trait, {
      scrollTrigger: {
        trigger: trait,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      y: 50,
      opacity: 0,
      duration: 0.5,
      delay: i * 0.1,
      ease: 'power2.out'
    });
  });
  
  // Animate MBTI selection section
  const selectionTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#mbti-selection',
      start: 'top 60%',
      toggleActions: 'play none none none'
    }
  });
  
  selectionTimeline
    .from('.mbti-selection-container', { 
      duration: 0.5, 
      y: 50, 
      opacity: 0, 
      ease: 'power2.out' 
    })
    .from('.mbti-letter', { 
      duration: 0.6, 
      y: 30, 
      opacity: 0, 
      stagger: 0.1, 
      ease: 'back.out(1.7)' 
    }, '-=0.4')
    .from('.mbti-button-group', { 
      duration: 0.6, 
      y: 20, 
      opacity: 0, 
      stagger: 0.1, 
      ease: 'power2.out' 
    }, '-=0.2')
    .from('.mbti-action-buttons', { 
      duration: 0.6, 
      y: 20, 
      opacity: 0, 
      ease: 'power2.out' 
    }, '-=0.2');
  
  // Animate distribution section
  gsap.from('#type-distribution-chart', {
    scrollTrigger: {
      trigger: '#mbti-distribution',
      start: 'top 60%',
      toggleActions: 'play none none none'
    },
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power2.out'
  });
}

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
      y: Math.random() * 100 - 50,
      x: Math.random() * 100 - 50,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 20 + 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Export functions to be used by main.js
if (typeof module !== 'undefined') {
  module.exports = {
    initAnimations,
    initParticles,
    debounce
  };
} 