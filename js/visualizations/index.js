// index.js - Central file for all visualizations

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

// Export global visualization functions to window object
// This allows them to be called from other modules without explicit imports
function exposeVisualizationFunctions() {
  // MBTI Distribution functions
  window.refreshVisualization = refreshVisualization;
  window.highlightUserTypeInChart = highlightUserTypeInChart;
  
  // Future visualization functions will be exposed here
}

// Export functions for use in main.js
if (typeof module !== 'undefined') {
  module.exports = {
    initAllVisualizations,
    exposeVisualizationFunctions
  };
} 