// Word Cloud Visualization for MBTI Types using WordCloud2.js
function initWordCloudVisualization() {
  console.log("Initializing Word Cloud Visualization");
  
  // Create a reference to store the current dropdown for later use
  let mbtiDropdown = null;
  let wordCloudData = null;
  let currentCanvas = null;
  let globalMaxWordCount = 0; // For consistent scaling across types
  
  // Container references
  const container = d3.select("#word-cloud-analysis");
  
  // Clear any existing content and show loading indicator
  container.html('<div class="loading"><div class="loading-spinner"></div><div class="loading-text">Loading word cloud...</div></div>');
  
  // Load the MBTI word cloud data
  d3.json('data/processedJson/mbti_word_cloud_new.json')
    .then(data => {
      // Store data for later updates
      wordCloudData = data;
      
      // Find the global maximum word count across all MBTI types
      globalMaxWordCount = d3.max(data, mbtiType => 
        d3.max(mbtiType.word_counts, d => d.count)
      );
      
      console.log("Global maximum word count:", globalMaxWordCount);
      
      // Clear loading indicator
      container.html('');
      
      // Create title and dropdown container
      const header = container.append('div')
        .attr('class', 'word-cloud-header');
      
      header.append('h3')
        .text('Most Common Words by MBTI Type');
      
      // Add dropdown for selecting MBTI type
      const dropdownContainer = header.append('div')
        .attr('class', 'dropdown-container');
      
      dropdownContainer.append('label')
        .attr('for', 'mbti-select')
        .text('Select MBTI Type: ');
      
      const dropdown = dropdownContainer.append('select')
        .attr('id', 'mbti-select')
        .attr('class', 'mbti-select');
      
      // Store dropdown reference
      mbtiDropdown = dropdown;
      
      // Add options to dropdown
      data.forEach(type => {
        dropdown.append('option')
          .attr('value', type.mbti_type)
          .text(type.mbti_type);
      });
      
      // Create canvas container for the word cloud with adjusted positioning
      const cloudContainer = container.append('div')
        .attr('class', 'word-cloud-container')
        .style('height', '400px')
        .style('position', 'relative')
        .style('padding-left', '20%') // Add padding on the left to shift content right
        .style('padding-right', '5%');
      
      // Add title element for MBTI type first with adjusted positioning to the left
      cloudContainer.append('div')
        .attr('class', 'mbti-type-title')
        .style('text-align', 'left') // Change from center to left alignment
        .style('font-size', '20px') // Increase from 16px to 20px
        .style('font-weight', 'bold')
        .style('margin-top', '-20px') // Changed from 10px to -20px to move upward
        .style('position', 'absolute')
        .style('top', '0')
        .style('width', '100%')
        .style('padding-left', '20%') // Add some left padding
        .attr('id', 'word-cloud-title');
      
      // Create canvas for the word cloud
      const canvas = cloudContainer.append('canvas')
        .attr('id', 'word-cloud-canvas')
        .attr('width', cloudContainer.node().getBoundingClientRect().width)
        .attr('height', 400)
        .style('display', 'block')
        .node();
      
      // Store canvas reference
      currentCanvas = canvas;
      
      // Determine which MBTI type to show initially
      let initialType = 'ENFJ'; // Default
      
      console.log("Current userMBTIType:", userMBTIType, "userSkippedMBTI:", userSkippedMBTI);
      
      if (userMBTIType !== null && !userSkippedMBTI) {
        initialType = userMBTIType;
        console.log("Using user's MBTI type for word cloud:", initialType);
      } else {
        console.log("Using default ENFJ for word cloud");
      }
      
      // Set dropdown to match the selected type
      dropdown.property('value', initialType);
      
      // Create the initial word cloud with consistent scaling
      createWordCloud(data, initialType, canvas, globalMaxWordCount);
      
      // Add event listener to dropdown for changing the displayed MBTI type
      dropdown.on('change', function() {
        const selectedType = this.value;
        console.log("Dropdown changed to:", selectedType);
        createWordCloud(data, selectedType, canvas, globalMaxWordCount);
      });
      
      // Add a direct hook to the confirm MBTI button
      const confirmButton = document.getElementById('confirm-mbti');
      if (confirmButton) {
        console.log("Adding event listener to confirm-mbti button");
        confirmButton.addEventListener('click', function() {
          setTimeout(function() {
            // Use a timeout to ensure we get the updated value
            if (userMBTIType !== null && !userSkippedMBTI) {
              console.log("User confirmed MBTI type, updating word cloud to:", userMBTIType);
              dropdown.property('value', userMBTIType);
              createWordCloud(wordCloudData, userMBTIType, currentCanvas, globalMaxWordCount);
            }
          }, 100);
        });
      } else {
        console.log("Could not find confirm-mbti button");
      }
    })
    .catch(error => {
      console.error('Error loading word cloud data:', error);
      container.html('<div class="error">Error loading word cloud data</div>');
    });
}

// Function to create the word cloud for a specific MBTI type using WordCloud2.js
function createWordCloud(data, mbtiType, canvas, globalMaxWordCount) {
  console.log("Creating word cloud for:", mbtiType);
  
  // Find the data for the selected MBTI type
  const typeData = data.find(d => d.mbti_type === mbtiType);
  
  if (!typeData) {
    console.error('MBTI type not found:', mbtiType);
    return;
  }
  
  // Update the title - add null check
  const titleElement = document.getElementById('word-cloud-title');
  if (titleElement) {
    titleElement.textContent = `Words Frequently Used by ${mbtiType} Types`;
  } else {
    console.log('Title element not found, will be updated later');
  }
  
  // Get the top 100 words
  const topWords = typeData.word_counts.slice(0, 100);
  
  // Get the maximum count for this particular type
  const maxCountForType = d3.max(typeData.word_counts, d => d.count);
  console.log(`Max count for ${mbtiType}: ${maxCountForType}`);
  
  // Calculate scale factor based on desired max size
  const TARGET_MAX_SIZE = 99; // Pixels for the largest word
  const scaleFactor = TARGET_MAX_SIZE / maxCountForType;
  console.log(`Scale factor for ${mbtiType}: ${scaleFactor}`);
  
  // Convert the word data for the cloud with type-specific scaling
  const wordList = topWords.map(item => {
    // Calculate the scaled size
    const scaledSize = item.count * scaleFactor;
    
    // For debugging: log some sizes
    if (item.word === topWords[0].word || item.word === topWords[4].word) {
      console.log(`Word "${item.word}" has count ${item.count}, scaled size: ${scaledSize.toFixed(1)}`);
    }
    
    // Return the word and its count (original count, not scaled)
    return [item.word, item.count];
  });
  
  // Define color function for words based on their weight
  const colorScale = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateViridis);
  
  // Clear any existing wordcloud
  if (window.currentCloudInstance) {
    window.currentCloudInstance.stop();
  }
  
  // Options for WordCloud
  const options = {
    list: wordList,
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 'bold',
    gridSize: 4, // Smaller grid size for higher resolution
    weightFactor: function(count) {
      // Apply the type-specific scaling factor
      return count * scaleFactor;
    },
    origin: [canvas.width * 0.4, canvas.height / 2], // Shift the center point right
    color: (word, weight, fontSize, distance, theta) => {
      // Normalize weight for color scale (within this type)
      const normalizedWeight = weight / maxCountForType;
      return colorScale(normalizedWeight);
    },
    rotateRatio: 0, // Don't rotate words (keep horizontal)
    rotationSteps: 0,
    backgroundColor: 'transparent',
    drawOutOfBound: false,
    shrinkToFit: true,
    minSize: 8, // Minimum size for smallest words
    hover: function(item, dimension, event) {
      if (item) {
        // Calculate the scaled size for verification
        const count = item[1];
        const scaledSize = count * scaleFactor;
        
        const tooltip = document.getElementById('word-cloud-tooltip') || 
          createTooltip();
        
        // Include both original count and scaled size in the tooltip
        tooltip.innerHTML = `
          <strong>${item[0]}</strong>: ${parseInt(count).toLocaleString()} occurrences
         
        `;
        
        tooltip.style.opacity = '0.9';
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 28) + 'px';
      } else {
        const tooltip = document.getElementById('word-cloud-tooltip');
        if (tooltip) {
          tooltip.style.opacity = '0';
        }
      }
    }
  };
  
  // Create tooltip element if it doesn't exist
  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'word-cloud-tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '8px 12px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '14px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = '0';
    tooltip.style.zIndex = '1000';
    tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    tooltip.style.transition = 'opacity 0.2s';
    document.body.appendChild(tooltip);
    return tooltip;
  }
  
  // Run WordCloud
  window.currentCloudInstance = WordCloud(canvas, options);
}

// Add this function to window to make it globally accessible
window.initWordCloudVisualization = initWordCloudVisualization;

// Also add a function that can be called from outside to update the word cloud
window.updateWordCloudType = function(mbtiType) {
  console.log("External call to update word cloud to:", mbtiType);
  const dropdown = document.getElementById('mbti-select');
  if (dropdown) {
    dropdown.value = mbtiType;
    // Trigger the change event to update the visualization
    dropdown.dispatchEvent(new Event('change'));
  }
};

