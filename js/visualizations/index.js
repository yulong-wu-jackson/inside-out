// index.js - Central file to manage all visualizations

// Import specific visualizations
// This file serves as a centralized location for importing and exporting all visualizations
// as new visualizations are added, they should be imported and exported here

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
  // Export functions from mbtiDistribution.js to global scope
  window.refreshVisualization = refreshVisualization;
  window.highlightUserTypeInChart = highlightUserTypeInChart;
  
  // Add any additional functions that need to be exposed
}

// Run when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Expose functions to global scope
  exposeVisualizationFunctions();
});

// Export for module systems
if (typeof module !== 'undefined') {
  module.exports = {
    initAllVisualizations
  };
} 