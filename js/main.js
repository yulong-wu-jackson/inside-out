// main.js - Core functionality for the website

// No more imports - we're using global functions now

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
    initWhoCommentsMostChart();
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

// Make function available globally
window.initMBTIVisualizations = initMBTIVisualizations;

 