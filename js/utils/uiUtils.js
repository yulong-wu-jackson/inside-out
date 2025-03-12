// uiUtils.js - Utility functions for UI and navigation

/**
 * Initialize navigation functionality
 */
function initNavigation() {
  const dots = document.querySelectorAll('.nav-dots .dot');
  const steps = document.querySelectorAll('.step');
  
  // Initialize the active dot based on current scroll position
  updateActiveDot();
  
  // Add click event listeners to dots
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      // Scroll to the corresponding section
      steps[index].scrollIntoView({ behavior: 'smooth' });
      
      // Update active dot
      dots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      updateActiveDot();
    });
  });
  
  // Update active dot on scroll
  window.addEventListener('scroll', debounce(updateActiveDot, 100));
}

/**
 * Update the active dot based on scroll position
 */
function updateActiveDot() {
  const steps = document.querySelectorAll('.step');
  const dots = document.querySelectorAll('.nav-dots .dot');
  
  // Very simple approach: find the *last* section whose top is at or above the viewport
  let activeIndex = 0;
  
  // Process sections in reverse order (bottom to top)
  // This ensures we find the last section that starts above the viewport
  for (let i = steps.length - 1; i >= 0; i--) {
    const rect = steps[i].getBoundingClientRect();
    
    // If this section's top is at or above the viewport top, it's our section
    // We add a small negative offset (-10px) to make it slightly more responsive
    if (rect.top <= 250) {
      activeIndex = i;
      break; // Found it, no need to check earlier sections
    }
  }
  
  // Special case for the first section - it should be active when we're at the top of the page
  if (window.scrollY < 10) {
    activeIndex = 0;
  }
  
  // Edge case for last section - ensure we highlight it if we're at the bottom of the page
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
    activeIndex = steps.length - 1;
  }
  
  // Update the active dot
  dots.forEach((dot, index) => {
    if (index === activeIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @return {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Make functions available globally
window.initNavigation = initNavigation;
window.updateActiveDot = updateActiveDot;
window.debounce = debounce;