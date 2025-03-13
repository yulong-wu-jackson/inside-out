// Word Cloud Visualization for MBTI Types
function initWordCloudVisualization() {
  console.log("Initializing Word Cloud Visualization");
  
  // Create a reference to store the current dropdown for later use
  let mbtiDropdown = null;
  let wordCloudData = null;
  let wordCloudContainer = null;
  
  // Container references
  const container = d3.select("#word-cloud-analysis");
  
  // Clear any existing content and show loading indicator
  container.html('<div class="loading"><div class="loading-spinner"></div><div class="loading-text">Loading word cloud...</div></div>');
  
  // Load the MBTI word cloud data
  d3.json('data/processedJson/mbti_word_cloud_new.json')
    .then(data => {
      // Store data for later updates
      wordCloudData = data;
      
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
      
      // Create container for the word cloud
      const cloudContainer = container.append('div')
        .attr('class', 'word-cloud-container')
        .style('height', '400px')
        .style('position', 'relative');
      
      // Store container reference
      wordCloudContainer = cloudContainer;
      
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
      
      // Create the initial word cloud
      createWordCloud(data, initialType, cloudContainer);
      
      // Add event listener to dropdown for changing the displayed MBTI type
      dropdown.on('change', function() {
        const selectedType = this.value;
        console.log("Dropdown changed to:", selectedType);
        createWordCloud(data, selectedType, cloudContainer);
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
              createWordCloud(wordCloudData, userMBTIType, wordCloudContainer);
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

// Function to create the word cloud for a specific MBTI type
function createWordCloud(data, mbtiType, container) {
  console.log("Creating word cloud for:", mbtiType);
  
  // Find the data for the selected MBTI type
  const typeData = data.find(d => d.mbti_type === mbtiType);
  
  if (!typeData) {
    console.error('MBTI type not found:', mbtiType);
    return;
  }
  
  // Clear existing content with fade transition
  container.selectAll('*').transition()
    .duration(300)
    .style('opacity', 0)
    .remove();
  
  // Set up the dimensions
  const width = container.node().getBoundingClientRect().width;
  const height = 400;
  
  // Create tooltip div (more stylish than native HTML tooltips)
  const tooltip = d3.select("body").append("div")
    .attr("class", "word-cloud-tooltip")
    .style("position", "absolute")
    .style("background-color", "rgba(0, 0, 0, 0.8)")
    .style("color", "white")
    .style("padding", "8px 12px")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 1000)
    .style("box-shadow", "0 2px 10px rgba(0, 0, 0, 0.2)");
  
  // Create SVG
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('opacity', 0);
  
  // Create a group for the word cloud
  const group = svg.append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);
  
  // Scale for word size based on count
  const fontSizeScale = d3.scaleLinear()
    .domain([
      d3.min(typeData.word_counts, d => d.count),
      d3.max(typeData.word_counts, d => d.count)
    ])
    .range([12, 60]);
  
  // Scale for word color based on count
  const colorScale = d3.scaleSequential()
    .domain([0, typeData.word_counts.length - 1])
    .interpolator(d3.interpolateViridis);
  
  // Create the layout for the word cloud
  const layout = d3.layout.cloud()
    .size([width, height])
    .words(typeData.word_counts.map((d, i) => ({
      text: d.word,
      size: fontSizeScale(d.count),
      color: colorScale(i),
      count: d.count
    })))
    .padding(3)
    .rotate(() => 0) // No rotation for better readability
    .fontSize(d => d.size)
    .on('end', draw);
  
  // Start the layout
  layout.start();
  
  // Draw the word cloud
  function draw(words) {
    group.selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', d => `${d.size}px`)
      .style('fill', d => d.color)
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .text(d => d.text)
      // Add hover effect to make it clear the word is interactive
      .style('cursor', 'pointer')
      // Enhanced tooltip interactions
      .on('mouseover', function(event, d) {
        // Change text appearance on hover
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'brightness(1.2)')
          .style('text-shadow', '0 0 5px rgba(255, 255, 255, 0.5)');
        
        // Show tooltip with formatted count
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`<strong>${d.text}</strong>: ${d.count.toLocaleString()} occurrences`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        // Reset text appearance
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'brightness(1)')
          .style('text-shadow', 'none');
        
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      .on('mousemove', function(event) {
        // Move tooltip with mouse
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      });
    
    // Add a title with the MBTI type
    svg.append('text')
      .attr('class', 'mbti-type-title')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Words Frequently Used by ${mbtiType} Types`);
    
    // Fade in the word cloud
    svg.transition()
      .duration(500)
      .style('opacity', 1);
  }
  
  // Clean up tooltip when visualization changes
  return () => {
    tooltip.remove();
  };
}

// Add this function to window to make it globally accessible
window.initWordCloudVisualization = initWordCloudVisualization;
// Also add a function that can be called from outside to update the word cloud
// This can be called from other JavaScript files when the MBTI type changes
window.updateWordCloudType = function(mbtiType) {
  console.log("External call to update word cloud to:", mbtiType);
  const dropdown = document.getElementById('mbti-select');
  if (dropdown) {
    dropdown.value = mbtiType;
    // Trigger the change event to update the visualization
    dropdown.dispatchEvent(new Event('change'));
  }
};

