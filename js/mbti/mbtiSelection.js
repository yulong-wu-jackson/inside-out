// mbtiSelection.js - Functions for MBTI type selection and management

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
  console.log('DEBUG - Current MBTI type in localStorage:', localStorage.getItem('userMBTIType'));
  
  // Initialize letters from localStorage if available
  const savedType = localStorage.getItem('userMBTIType');
  if (savedType && savedType !== 'unknown' && savedType.length === 4) {
    console.log('DEBUG - Initializing MBTI selection with saved type:', savedType);
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
    console.log('DEBUG - No valid MBTI type saved, resetting UI');
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
      console.log(`DEBUG - Selected letter ${letter} at position ${position}`);
      
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
    console.log('DEBUG - Confirming MBTI type:', mbtiType);
    
    // Store previous type before updating
    previousMBTIType = localStorage.getItem('userMBTIType') || '';
    
    // Save to localStorage
    localStorage.setItem('userMBTIType', mbtiType);
    console.log('DEBUG - Saved to localStorage. Previous:', previousMBTIType, 'New:', mbtiType);
    
    // Show success message with animation
    resultMessage.textContent = `Your MBTI type (${mbtiType}) has been saved!`;
    resultMessage.classList.add('success');
    
    // Refresh visualization if the type has changed
    if (previousMBTIType !== mbtiType) {
      console.log('DEBUG - MBTI type changed, refreshing visualization');
      refreshVisualization();
    } else {
      // Even if the type hasn't changed, ensure it's highlighted
      console.log('DEBUG - MBTI type unchanged, just highlighting');
      highlightUserTypeInChart();
    }
  });
  
  // Skip button click
  skipButton.addEventListener('click', () => {
    // Store previous type before updating
    previousMBTIType = localStorage.getItem('userMBTIType') || '';
    
    // Set as unknown
    localStorage.setItem('userMBTIType', 'unknown');
    console.log('DEBUG - Set MBTI type to "unknown"');
    
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
      console.log('DEBUG - MBTI type changed to unknown, refreshing visualization');
      refreshVisualization();
    }
  });
}

/**
 * Refresh the visualization when MBTI type changes
 */
function refreshVisualization() {
  console.log("Refreshing visualization due to MBTI type change");
  
  // Clear the chart container
  const chartContainer = document.getElementById('type-distribution-chart');
  if (chartContainer) {
    chartContainer.innerHTML = '';
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
      <div class="spinner"></div>
      <p>Refreshing visualization...</p>
    `;
    chartContainer.appendChild(loadingIndicator);
    
    // Reinitialize the visualization with a slight delay to allow for DOM updates
    setTimeout(async () => {
      // Remove loading indicator
      chartContainer.innerHTML = '';
      
      // Reinitialize the visualization
      console.log("Loading MBTI data and creating chart...");
      initAllVisualizations();
    }, 500);
  }
}

// Make functions available globally
window.initMBTISelection = initMBTISelection;
window.refreshVisualization = refreshVisualization; 