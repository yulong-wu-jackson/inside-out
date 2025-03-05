// main.js - Core functionality for the website

// Global variable to store user's MBTI type - only kept here for compatibility
let userMBTIType = null;
let userSkippedMBTI = false;
let previousMBTIType = null; // Track previous selection for comparison

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);
  
  // Initialize all functionalities
  initAnimations();
  initParticles();
  initNavigation();
  initMBTISelection();
  
  // Initialize visualizations after exposing functions 
  // to make them available globally
  exposeVisualizationFunctions();
  
  // Initialize MBTI visualizations with a short delay to ensure DOM is ready
  setTimeout(() => {
    console.log('Initializing all visualizations from main.js...');
    initAllVisualizations();
  }, 500);
  
  // Add window resize handler for responsive visualizations
  window.addEventListener('resize', debounce(function() {
    // Get current viewport width
    const viewportWidth = window.innerWidth;
    
    // Clear existing visualizations
    const chartContainer = document.getElementById('type-distribution-chart');
    if (chartContainer) {
      chartContainer.innerHTML = '<div class="loading">Resizing visualization...</div>';
    }
    
    // Reinitialize visualizations after a short delay
    setTimeout(() => {
      initAllVisualizations();
    }, 100);
    
  }, 250));
});

// Initialize animations using GSAP
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

// Initialize particles for landing page background
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
  
  // Scroll indicator on landing page
  // const scrollIndicator = document.querySelector('.scroll-indicator');
  // if (scrollIndicator && steps.length > 1) {
  //   scrollIndicator.addEventListener('click', () => {
  //     steps[1].scrollIntoView({ behavior: 'smooth' });
  //   });
  // }
  
  // Update active dot on scroll
  window.addEventListener('scroll', debounce(updateActiveDot, 100));
}

/**
 * Update the active dot based on scroll position
 */
function updateActiveDot() {

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

// Initialize MBTI selection functionality
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
      refreshVisualization();
    } else {
      // Even if the type hasn't changed, ensure it's highlighted
      highlightUserTypeInChart();
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
      const mbtiData = await loadMBTIData();
      if (mbtiData) {
        createTypeDistributionChart(mbtiData);
        
        // Add a small delay before highlighting to ensure the chart is fully rendered
        // This is essential for the highlight to find the correct bars
        setTimeout(() => {
          console.log("Chart created, now highlighting user type...");
          highlightUserTypeInChart();
        }, 1800); // Increased delay to ensure chart is fully rendered
      }
    }, 2000);
  }
}

// Function to highlight user's MBTI type in the chart
function highlightUserTypeInChart() {
  console.log("Attempting to highlight user MBTI type");
  
  // Get the user's MBTI type from localStorage
  const userMBTIType = localStorage.getItem('userMBTIType');
  if (!userMBTIType || userMBTIType === "unknown") {
    console.log("No user MBTI type found in localStorage or type is unknown");
    return;
  }
  
  console.log(`Highlighting user MBTI type: ${userMBTIType}`);
  
  // Check if the SVG container exists - use the correct selector from mbti_data.js
  const svgContainer = d3.select("#type-distribution-chart svg");
  if (svgContainer.empty()) {
    console.log("SVG container not found, retrying in 1200ms");
    setTimeout(highlightUserTypeInChart, 1800);
    return;
  }
  
  // Remove existing highlights first
  d3.selectAll(".highlight-overlay").remove();
  d3.selectAll(".user-position-label").remove();
  
  // Find the bar corresponding to the user's MBTI type
  let foundMatch = false;
  d3.selectAll(".bar")
    .each(function(d) {
      if (d && d.type === userMBTIType) {
        foundMatch = true;
        console.log(`Found matching bar for ${userMBTIType}`);
        
        // Get the bar and its positioning attributes directly from D3 data
        const bar = d3.select(this);
        const barX = parseFloat(bar.attr('x'));
        const barY = parseFloat(bar.attr('y'));
        const barWidth = parseFloat(bar.attr('width'));
        const barHeight = parseFloat(bar.attr('height'));
        
        // Get the SVG's g element (the main chart group)
        const svg = d3.select('#type-distribution-chart svg g');
        
        // Add dotted rectangle around the bar with animation
        svg.append("rect")
          .attr("class", "highlight-overlay")
          .attr("x", barX - 2)
          .attr("y", barY - 2)
          .attr("width", barWidth + 4)
          .attr("height", barHeight + 4)
          .attr("fill", "none")
          .attr("stroke", "#FF5722")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("pointer-events", "none")
          .style("opacity", 0) // Start invisible
          .transition() // Add transition
          .duration(600) // 600ms fade in
          .delay(200) // Small delay before starting
          .style("opacity", 1); // Fade to fully visible
        
        // Add "You are here" text above the bar with animation
        svg.append("text")
          .attr("class", "user-position-label")
          .attr("x", barX + barWidth / 2)
          .attr("y", barY - 30)
          .attr("text-anchor", "middle")
          .attr("fill", "#FF5722")
          .attr("font-weight", "bold")
          .attr("font-size", "12px")
          .attr("font-family", "'Poppins', sans-serif")
          .text("You are here")
          .attr("pointer-events", "none")
          .style("opacity", 0) // Start invisible
          .transition() // Add transition
          .duration(600) // 600ms fade in
          .delay(400) // Slightly longer delay than rectangle for staggered effect
          .style("opacity", 1); // Fade to fully visible
      }
    });
  
  if (!foundMatch && userMBTIType !== "unknown") {
    console.log(`No matching bar found for ${userMBTIType}, retrying in 1200ms`);
    setTimeout(highlightUserTypeInChart, 1800);
  }
}

/**
 * Call this to initialize all MBTI visualizations
 */
async function initMBTIVisualizations() {
  console.log("Starting MBTI visualization initialization...");
  
  const mbtiData = await loadMBTIData();
  if (mbtiData) {
    console.log("MBTI data loaded successfully");
    createTypeDistributionChart(mbtiData);
    
    // Add a delay before highlighting to ensure chart is fully rendered
    setTimeout(() => {
      console.log('Chart created, now highlighting user MBTI type...');
      highlightUserTypeInChart();
    }, 1800);
  } else {
    console.error("Failed to load MBTI data for visualization");
  }
}


 