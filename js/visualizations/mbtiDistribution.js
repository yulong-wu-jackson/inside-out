// mbtiDistribution.js - Visualization for MBTI type distribution

/**
 * Load MBTI distribution data from JSON file
 * @returns {Promise} Promise that resolves to the MBTI data
 */
async function loadMBTIData() {
  // try {
  //   const response = await fetch('/data/mbti_distribution.json');
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }
  //   const data = await response.json();
  //   return data;
  // } catch (error) {
  //   console.error('Error loading MBTI data:', error);
  //   return null;
  // }
  try {
    const data = await d3.json('/data/mbti_distribution.json');
    return data;
  } catch (error) {
    console.error('Error loading MBTI data:', error);
    return null;
  }
}

/**
 * Create a bar chart visualization for MBTI type distribution
 * @param {Object} data - The MBTI distribution data
 */
function createTypeDistributionChart(data) {
  if (!data || !data.types) {
    console.error('Invalid data format for MBTI distribution');
    return;
  }

  // Clear any existing content
  const container = d3.select('#type-distribution-chart');
  container.html(''); // Clear everything including any previous SVG
  
  // Set dimensions and margins
  const margin = { top: 80, right: 30, bottom: 90, left: 60 };
  
  // Get container width for responsive sizing
  const containerWidth = container.node().getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;
  
  // Adjust height based on container width for better aspect ratio on mobile
  let height = 500 - margin.top - margin.bottom;
  if (containerWidth < 500) {
    height = 400 - margin.top - margin.bottom;
  } else if (containerWidth < 768) {
    height = 450 - margin.top - margin.bottom;
  }
  
  // Create SVG with a clipping path for animations
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Add a clipping path
  svg.append('defs')
    .append('clipPath')
    .attr('id', 'chart-area')
    .append('rect')
    .attr('width', width)
    .attr('height', height);
  
  // Add background grid
  svg.append('g')
    .attr('class', 'grid-lines')
    .selectAll('line')
    .data(d3.range(0, 101, 5)) // Grid lines every 5%
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => height - (d / 100) * height)
    .attr('y2', d => height - (d / 100) * height)
    .attr('stroke', '#e5e7eb')
    .attr('stroke-width', d => d % 10 === 0 ? 1 : 0.5)
    .attr('stroke-dasharray', d => d % 10 === 0 ? 'none' : '3,3');
  
  // Group data by MBTI categories - standard groupings according to MBTI framework
  const mbtiCategories = {
    'Analysts': ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
    'Diplomats': ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
    'Sentinels': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
    'Explorers': ['ISTP', 'ISFP', 'ESTP', 'ESFP']
  };
  
  // Categorize and sort data
  const categorizedData = [];
  Object.entries(mbtiCategories).forEach(([category, types]) => {
    console.log(`Category: ${category}, Types:`, types);
    types.forEach(type => {
      const typeData = data.types.find(d => d.type === type);
      if (typeData) {
        categorizedData.push({
          ...typeData,
          category
        });
      }
    });
  });
  
  // Sort data by category and then by percentage within category
  const sortedData = categorizedData.sort((a, b) => {
    // First sort by category
    const categoryOrder = ['Analysts', 'Diplomats', 'Sentinels', 'Explorers'];
    const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    
    if (categoryDiff !== 0) return categoryDiff;
    
    // Then sort by percentage within category (descending)
    return b.percentage - a.percentage;
  });
  
  // X and Y scales
  const x = d3.scaleBand()
    .domain(sortedData.map(d => d.type))
    .range([0, width])
    .padding(0.3);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.percentage) * 1.1]) // Add 10% padding at the top
    .range([height, 0]);
  
  // Add X axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', containerWidth < 500 ? '8px' : containerWidth < 768 ? '10px' : '12px')
    .style('font-family', "'Poppins', sans-serif");
  
  // Style the axis
  svg.selectAll('.domain')
    .style('stroke', '#cbd5e1');
  
  svg.selectAll('.tick line')
    .style('stroke', '#cbd5e1');
  
  // Add Y axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + '%'))
    .style('font-size', containerWidth < 500 ? '8px' : containerWidth < 768 ? '10px' : '12px')
    .style('font-family', "'Poppins', sans-serif");
  
  // Add Y axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + (containerWidth < 500 ? 10 : 20))
    .attr('x', -height / 2)
    .attr('text-anchor', 'middle')
    .text('Percentage of Population')
    .style('font-size', containerWidth < 500 ? '10px' : containerWidth < 768 ? '12px' : '14px')
    .style('font-family', "'Montserrat', sans-serif")
    .style('fill', 'var(--text-muted)');
  
  // Define color scale based on MBTI categories
  const categoryColors = {
    'Analysts': 'var(--analysts-color)',
    'Diplomats': 'var(--diplomats-color)',
    'Sentinels': 'var(--sentinels-color)',
    'Explorers': 'var(--explorers-color)'
  };
  
  console.log('Category Colors:', categoryColors);
  
  // Add category labels
  const categories = Object.keys(mbtiCategories);
  const categoryWidth = width / categories.length;
  
  categories.forEach((category, i) => {
    const x = i * categoryWidth + categoryWidth / 2;
    
    // Add category label
    svg.append('text')
      .attr('class', 'category-label')
      .attr('x', x)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', containerWidth < 500 ? '10px' : '14px')
      .style('font-weight', '600')
      .style('font-family', "'Montserrat', sans-serif")
      .style('fill', categoryColors[category])
      .text(category);
    
    // Add subtle divider line
    if (i > 0) {
      svg.append('line')
        .attr('x1', i * categoryWidth)
        .attr('x2', i * categoryWidth)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3');
    }
  });
  
  // Create a group for the bars with clip path
  const barsGroup = svg.append('g')
    .attr('clip-path', 'url(#chart-area)');
  
  // Create bars with gradient fill
  barsGroup.selectAll('.bar')
    .data(sortedData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.type))
    .attr('width', x.bandwidth())
    .attr('y', height) // Start at the bottom for animation
    .attr('height', 0) // Start with height 0 for animation
    .attr('rx', 4) // Rounded corners
    .attr('ry', 4)
    .style('fill', d => {
      // Create unique gradient ID for each bar
      const gradientId = `gradient-${d.type}`;
      
      // Define gradient
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      
      // Get base color from category
      const baseColor = categoryColors[d.category];
      console.log(`MBTI Type: ${d.type}, Category: ${d.category}, Color: ${baseColor}`);
      
      // Add gradient stops
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 0.9);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', baseColor)
        .attr('stop-opacity', 0.7);
      
      return `url(#${gradientId})`;
    })
    .style('filter', 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))');
  
  // Add animation
  barsGroup.selectAll('.bar')
    .transition()
    .duration(500)
    .delay((d, i) => i * 50)
    .attr('y', d => y(d.percentage))
    .attr('height', d => Math.max(1, height - y(d.percentage))); // Ensure minimum height of 1px
  
  // Add labels on top of bars
  barsGroup.selectAll('.label')
    .data(sortedData)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.type) + x.bandwidth() / 2)
    .attr('y', d => y(d.percentage) - 5)
    .attr('text-anchor', 'middle')
    .text(d => {
      // On small screens, only show percentage for larger values to avoid clutter
      if (containerWidth < 500) {
        return d.percentage >= 5 ? d.percentage + '%' : '';
      }
      return d.percentage + '%';
    })
    .style('font-size', containerWidth < 500 ? '8px' : containerWidth < 768 ? '10px' : '12px')
    .style('font-weight', 'bold')
    .style('font-family', "'Poppins', sans-serif")
    .style('opacity', 0) // Start invisible for animation
    .transition()
    .duration(500)
    .delay((d, i) => i * 50 + 400)
    .style('opacity', 1); // Fade in
  
  // Add title with responsive positioning
  const titleYPosition = containerWidth < 500 ? -margin.top + 20 : 
                         containerWidth < 768 ? -margin.top + 25 : 
                         -margin.top + 30;
  
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', titleYPosition)
    .attr('text-anchor', 'middle')
    .style('font-size', containerWidth < 500 ? '14px' : containerWidth < 768 ? '16px' : '18px')
    .style('font-weight', 'bold')
    .style('font-family', "'Montserrat', sans-serif")
    .text('MBTI Type Distribution in Population');
  
  // Add interactive hover effects
  barsGroup.selectAll('.bar')
    .on('mouseover', function(event, d) {
      // Highlight the bar with shadow only, no scaling
      d3.select(this)
        .transition()
        .duration(200)
        .style('filter', 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))');
      
      // Show tooltip
      const tooltip = container.append('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255, 255, 255, 0.95)')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('box-shadow', '0 4px 15px rgba(0, 0, 0, 0.1)')
        .style('pointer-events', 'none')
        .style('z-index', '100')
        .style('font-family', "'Poppins', sans-serif")
        .style('font-size', '12px')
        .style('opacity', 0);
      
      // Position tooltip
      const tooltipWidth = 150;
      const tooltipHeight = 80;
      const xPosition = event.pageX - tooltipWidth / 2;
      const yPosition = event.pageY - tooltipHeight - 10;
      
      tooltip
        .style('left', `${xPosition}px`)
        .style('top', `${yPosition}px`)
        .style('width', `${tooltipWidth}px`)
        .html(`
          <div style="font-weight: bold; color: ${categoryColors[d.category]}; margin-bottom: 5px;">${d.type}</div>
          <div style="font-size: 14px; font-weight: bold;">${d.percentage}% of population</div>
          <div style="color: #6b7280; margin-top: 5px;">Category: ${d.category}</div>
        `)
        .transition()
        .duration(200)
        .style('opacity', 1);
    })
    .on('mouseout', function() {
      // Reset bar style
      d3.select(this)
        .transition()
        .duration(200)
        .style('filter', 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.1))');
      
      // Remove tooltip
      container.selectAll('.chart-tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
    });
}

/**
 * Highlight user's MBTI type in the chart with animated effects
 */
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
    console.log("SVG container not found, retrying in 1000ms");
    setTimeout(highlightUserTypeInChart, 1000);
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
          .attr("y", barY - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "#FF5722")
          .attr("font-weight", "bold")
          .attr("font-size", "12px")
          .attr("font-family", "'Poppins', sans-serif")
          .text("You are here")
          .attr("pointer-events", "none")
          .style("opacity", 0) // Start invisible
          .transition() // Add transition
          .duration(400) // 600ms fade in
          .delay(400) // Slightly longer delay than rectangle for staggered effect
          .style("opacity", 1); // Fade to fully visible
      }
    });
  
  if (!foundMatch && userMBTIType !== "unknown") {
    console.log(`No matching bar found for ${userMBTIType}, retrying in 1000ms`);
    setTimeout(highlightUserTypeInChart, 1000);
  }
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
        }, 500); // Increased delay to ensure chart is fully rendered
      }
    }, 800);
  }
}

/**
 * Get color palette for MBTI types
 * Colors are grouped by categories (Analysts, Diplomats, Sentinels, Explorers)
 * @returns {Object} Object mapping MBTI types to color hex codes
 */
function getMBTIColors() {
  return {
    // Analysts (NT)
    'INTJ': '#4A6BDC', // Blue
    'INTP': '#5D7FE0',
    'ENTJ': '#7093E4',
    'ENTP': '#83A7E8',
    
    // Diplomats (NF)
    'INFJ': '#9C56DC', // Purple
    'INFP': '#AF6AE0',
    'ENFJ': '#C27EE4',
    'ENFP': '#D592E8',
    
    // Sentinels (SJ)
    'ISTJ': '#3F9E4D', // Green
    'ISFJ': '#52B260',
    'ESTJ': '#65C673',
    'ESFJ': '#78DA86',
    
    // Explorers (SP)
    'ISTP': '#E6A117', // Orange
    'ISFP': '#E9AF3A',
    'ESTP': '#ECBD5D',
    'ESFP': '#EFCB80'
  };
}

/**
 * Initialize MBTI distribution visualization
 */
async function initMBTIDistributionViz() {
  console.log("Starting MBTI visualization initialization...");
  
  const mbtiData = await loadMBTIData();
  if (mbtiData) {
    console.log("MBTI data loaded successfully");
    createTypeDistributionChart(mbtiData);
    
    // Add a delay before highlighting to ensure chart is fully rendered
    setTimeout(() => {
      console.log('Chart created, now highlighting user MBTI type...');
      highlightUserTypeInChart();
    }, 1300);
  } else {
    console.error("Failed to load MBTI data for visualization");
  }
}

// Export functions to be used by main.js
if (typeof module !== 'undefined') {
  module.exports = {
    initMBTIDistributionViz,
    refreshVisualization,
    highlightUserTypeInChart
  };
} 