// index.js - Central file to manage all visualizations

// No more imports - we're using global functions now

/**
 * Main function to initialize all visualizations
 * This will be expanded as more visualizations are added
 */
async function initAllVisualizations() {
  console.log('Initializing all visualizations...');
  
  // Initialize MBTI distribution visualization
  if (document.getElementById('type-distribution-chart')) {
    await initMBTIDistributionViz();
  }
  
  // Future visualizations will be initialized here
  // Example:
  // if (document.getElementById('new-visualization-container')) {
  //   await initNewVisualization();
  // }
}

/**
 * Expose visualization functions to the global scope
 * This allows them to be called from event handlers in other files
 */
function exposeVisualizationFunctions() {
  // All functions are already in global scope now
  // Just ensure initAllVisualizations is exposed
  window.initAllVisualizations = initAllVisualizations;
}

// Run when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Expose functions to global scope
  exposeVisualizationFunctions();
});

// Make functions available globally
window.initAllVisualizations = initAllVisualizations;
window.exposeVisualizationFunctions = exposeVisualizationFunctions; 