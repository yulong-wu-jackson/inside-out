// uiUtils.js - Utility functions for UI and navigation

/**
 * Initialize navigation dots and scroll behavior
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
    });
  });
  
  // Scroll indicator on landing page
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator && steps.length > 1) {
    scrollIndicator.addEventListener('click', () => {
      steps[1].scrollIntoView({ behavior: 'smooth' });
    });
  }
  
  // Update active dot on scroll
  window.addEventListener('scroll', debounce(updateActiveDot, 100));
}

/**
 * Update the active dot based on scroll position
 */
function updateActiveDot() {
  const sections = document.querySelectorAll('.step');
  const dots = document.querySelectorAll('.nav-dots .dot');
  
  if (!sections.length || !dots.length) return;
  
  // Get the current scroll position and viewport height
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  
  // Find which section is in view
  let activeIndex = 0;
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionCenter = sectionTop + (sectionHeight / 2);
    
    // If the section's top is above the center of the viewport and 
    // its bottom is below the center, it's the active section
    if (scrollPosition <= sectionTop + sectionHeight - (windowHeight / 3) && 
        scrollPosition + windowHeight >= sectionTop + (windowHeight / 3)) {
      activeIndex = index;
    }
  });
  
  // Update all dots
  dots.forEach((dot, index) => {
    if (index === activeIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/**
 * Initialize MBTI selection functionality
 */
function initMBTISelection() {
  const mbtiButtons = document.querySelectorAll('.mbti-button');
  const mbtiLetters = document.querySelectorAll('.mbti-letter');
  const mbtiIndicators = document.querySelectorAll('.mbti-letter-indicator');
  const confirmButton = document.getElementById('confirm-mbti');
  const skipButton = document.getElementById('skip-mbti');
  const resultMessage = document.getElementById('mbti-result-message');
  
  // Track previous MBTI type to detect changes
  let previousMBTIType = localStorage.getItem('userMBTIType') || '';
  
  // Initialize letters from localStorage if available
  const savedType = localStorage.getItem('userMBTIType');
  if (savedType && savedType !== 'unknown' && savedType.length === 4) {
    for (let i = 0; i < 4; i++) {
      mbtiLetters[i].textContent = savedType[i];
      mbtiIndicators[i].textContent = savedType[i];
      
      // Also select the corresponding buttons
      mbtiButtons.forEach(button => {
        if (button.dataset.position === i.toString() && button.dataset.letter === savedType[i]) {
          button.classList.add('selected');
        }
      });
    }
    confirmButton.disabled = false;
  } else {
    // Ensure letters are empty if no saved type
    mbtiLetters.forEach(letter => {
      letter.textContent = '';
    });
    
    // Reset indicators to underscores
    mbtiIndicators.forEach(indicator => {
      indicator.textContent = '_';
    });
    
    confirmButton.disabled = true;
  }
  
  // Add click event to MBTI buttons
  mbtiButtons.forEach(button => {
    button.addEventListener('click', () => {
      const position = parseInt(button.dataset.position);
      const letter = button.dataset.letter;
      
      // Deselect other buttons in the same group
      mbtiButtons.forEach(b => {
        if (b.dataset.position === button.dataset.position) {
          b.classList.remove('selected');
        }
      });
      
      // Select this button
      button.classList.add('selected');
      
      // Update the letter display
      mbtiLetters[position].textContent = letter;
      
      // Update the letter indicator
      mbtiIndicators[position].textContent = letter;
      
      // Check if all letters are selected
      const allSelected = Array.from(mbtiLetters).every(letter => letter.textContent !== '');
      confirmButton.disabled = !allSelected;
      
      // Clear any previous result message
      resultMessage.textContent = '';
      resultMessage.classList.remove('success');
    });
  });
  
  // Confirm button click
  confirmButton.addEventListener('click', () => {
    // Get the selected MBTI type
    const mbtiType = Array.from(mbtiLetters).map(letter => letter.textContent).join('');
    
    // Store previous type before updating
    previousMBTIType = localStorage.getItem('userMBTIType') || '';
    
    // Save to localStorage
    localStorage.setItem('userMBTIType', mbtiType);
    
    // Show success message with animation
    resultMessage.textContent = `Your MBTI type (${mbtiType}) has been saved!`;
    resultMessage.classList.add('success');
    
    // Refresh visualization if the type has changed
    if (previousMBTIType !== mbtiType) {
      if (typeof window.refreshVisualization === 'function') {
        window.refreshVisualization();
      }
    } else {
      // Even if the type hasn't changed, ensure it's highlighted
      if (typeof window.highlightUserTypeInChart === 'function') {
        window.highlightUserTypeInChart();
      }
    }
  });
  
  // Skip button click
  skipButton.addEventListener('click', () => {
    // Store previous type before updating
    previousMBTIType = localStorage.getItem('userMBTIType') || '';
    
    // Set as unknown
    localStorage.setItem('userMBTIType', 'unknown');
    
    // Reset the letter display
    mbtiLetters.forEach(letter => {
      letter.textContent = '';
    });
    
    // Reset the indicators
    mbtiIndicators.forEach(indicator => {
      indicator.textContent = '_';
    });
    
    // Deselect all buttons
    mbtiButtons.forEach(button => {
      button.classList.remove('selected');
    });
    
    // Disable confirm button
    confirmButton.disabled = true;
    
    // Show message
    resultMessage.textContent = 'No problem! You can always set your MBTI type later.';
    resultMessage.classList.add('success');
    
    // Refresh visualization if the type has changed
    if (previousMBTIType !== 'unknown') {
      if (typeof window.refreshVisualization === 'function') {
        window.refreshVisualization();
      }
    }
  });
}

// Imported from animationUtils to avoid circular dependencies
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
    initNavigation,
    updateActiveDot,
    initMBTISelection
  };
} 