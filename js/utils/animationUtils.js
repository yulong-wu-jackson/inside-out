// animationUtils.js - Utility functions for animations and visual effects

/**
 * Initialize animations using GSAP
 */
function initAnimations() {
  // Animate landing page elements
  let landingTimeline;
  
  // Function to run the landing page animations
  function animateLandingElements() {
    // Clear any existing animation to prevent conflicts
    if (landingTimeline) {
      landingTimeline.kill();
    }
    
    // Make sure elements are visible after animation completes
    gsap.set('.glass-container', { clearProps: "all" });
    
    // Create fresh animation timeline
    landingTimeline = gsap.timeline();
    landingTimeline
      .from('.glass-container', { 
        duration: 1.2, 
        y: 50, 
        opacity: 0, 
        ease: 'power3.out',
        onComplete: () => {
          // Ensure visibility even if animation is interrupted
          gsap.set('.glass-container', { opacity: 1, y: 0 });
        }
      })
      .from('.scroll-indicator', { 
        duration: 0.4, 
        y: 30, 
        opacity: 0, 
        ease: 'power2.out',
        onComplete: () => {
          // Ensure visibility even if animation is interrupted
          gsap.set('.scroll-indicator', { opacity: 1, y: 0 });
        }
      }, '-=0.5');
  }
  
  // Run animations immediately on load
  // slightly delayed to ensure elements are visible
  setTimeout(() => {
    animateLandingElements();
  }, 3200);
  
  // Re-run animations when page becomes visible if it was hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check if we're on the landing section
      const landingSection = document.querySelector('#landing');
      if (landingSection && isElementInViewport(landingSection)) {
        console.log('Page became visible, replaying landing animations');
        animateLandingElements();
      }
    }
  });
  
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
      duration: 0, 
      y: 30, 
      opacity: 0, 
      stagger: 0.1, 
      ease: 'back.out(1.7)' 
    }, '-=0.4')
    .from('.mbti-button-group', { 
      duration: 0.3, 
      y: 20, 
      opacity: 0, 
      stagger: 0.1, 
      ease: 'power2.out' 
    }, '-=0.2')
    .from('.mbti-action-buttons', { 
      duration: 0.3, 
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
 * Helper function to check if element is in viewport
 * @param {HTMLElement} el - Element to check
 * @return {boolean} Whether element is in viewport
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Make functions available globally
window.initAnimations = initAnimations;
window.isElementInViewport = isElementInViewport;

