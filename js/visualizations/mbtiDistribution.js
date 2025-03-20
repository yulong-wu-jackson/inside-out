// mbtiDistribution.js - Visualization for MBTI type distribution

/**
 * Load MBTI type distribution data
 * @returns {Promise<Object>} Object containing MBTI type data
 */
async function loadMBTIData() {
  try {
    console.log('Loading MBTI data...');
    
    // Try to load data from the server
    try {
      const response = await fetch('./data/mbti_distribution.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Successfully loaded MBTI data from server:', data);
      return data;
    } catch (error) {
      console.warn('Error loading from server, using fallback data:', error);
      
      // Use fallback data if server data can't be loaded
      return {
        // types: [
        //   { type: "ISTJ", percentage: 11.6, category: "Sentinels" },
        //   { type: "ISFJ", percentage: 13.8, category: "Sentinels" },
        //   { type: "INFJ", percentage: 1.5, category: "Diplomats" },
        //   { type: "INTJ", percentage: 2.1, category: "Analysts" },
        //   { type: "ISTP", percentage: 5.4, category: "Explorers" },
        //   { type: "ISFP", percentage: 8.8, category: "Explorers" },
        //   { type: "INFP", percentage: 4.4, category: "Diplomats" },
        //   { type: "INTP", percentage: 3.3, category: "Analysts" },
        //   { type: "ESTP", percentage: 4.3, category: "Explorers" },
        //   { type: "ESFP", percentage: 8.5, category: "Explorers" },
        //   { type: "ENFP", percentage: 8.1, category: "Diplomats" },
        //   { type: "ENTP", percentage: 3.2, category: "Analysts" },
        //   { type: "ESTJ", percentage: 8.7, category: "Sentinels" },
        //   { type: "ESFJ", percentage: 12.3, category: "Sentinels" },
        //   { type: "ENFJ", percentage: 2.5, category: "Diplomats" },
        //   { type: "ENTJ", percentage: 1.8, category: "Analysts" }
        // ]
      };
    }
  } catch (error) {
    console.error('Error in loadMBTIData:', error);
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

  console.log('DEBUG - Creating chart with data:', data);

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
  
  console.log('DEBUG - Sorted data for chart:', sortedData);
  
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
  
  // Create bars with gradient fill and proper data binding
  const bars = barsGroup.selectAll('.bar')
    .data(sortedData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.type))
    .attr('width', x.bandwidth())
    .attr('y', height) // Start at the bottom for animation
    .attr('height', 0) // Start with height 0 for animation
    .attr('rx', 4) // Rounded corners
    .attr('ry', 4);
    
  // Log data binding for debugging
  bars.each(function(d) {
    console.log(`DEBUG - Bar created for ${d.type}, category: ${d.category}, percentage: ${d.percentage}`);
  });
    
  // Apply fill style after data binding is confirmed
  bars.style('fill', d => {
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
  bars.transition()
    .duration(500)
    .delay((d, i) => i * 50)
    .attr('y', d => y(d.percentage))
    .attr('height', d => Math.max(1, height - y(d.percentage)))
    .on('end', function() {
      // Only highlight after all bars have finished animating
      if (this === bars.nodes()[bars.nodes().length - 1]) {
        highlightUserTypeInChart();
      }
    });
  
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
 * Highlight the user's MBTI type in the chart with a simple dotted line
 */
function highlightUserTypeInChart() {
  const svg = d3.select('#type-distribution-chart svg');
  if (!svg.node()) {
    console.log('SVG container not found for highlighting');
    return;
  }
  
  const userType = localStorage.getItem('userMBTIType');
  if (!userType || userType === 'unknown') {
    console.log('No user MBTI type to highlight');
    return;
  }
  
  console.log('Highlighting user MBTI type:', userType);
  
  // First, remove ALL previous highlights
  d3.selectAll('.user-type-highlight').remove();
  d3.selectAll('.user-type-label').remove();
  
  // Find the bar for the user's type
  let foundMatch = false;
  
  // Get the SVG's g element (the main chart group)
  const g = svg.select('g');
  if (!g.node()) {
    console.log('SVG g element not found');
    return;
  }
  
  // Find bar with matching type
  g.selectAll('.bar').each(function() {
    const bar = d3.select(this);
    const barData = bar.datum();
    
    if (barData && barData.type === userType) {
      foundMatch = true;
      console.log('Found matching bar for user type:', userType);
      
      // Get bar dimensions and position
      const barRect = this.getBBox();
      const offsetX = parseFloat(bar.attr('x')) || 0;
      const offsetY = parseFloat(bar.attr('y')) || 0;
      
      // Create highlight rectangle (dotted outline)
      g.append('rect')
        .attr('class', 'user-type-highlight')
        .attr('x', offsetX - 3)
        .attr('y', offsetY - 3)
        .attr('width', barRect.width + 6)
        .attr('height', barRect.height + 6)
        .attr('fill', 'none')
        .attr('stroke', '#FF5733')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3')
        .attr('rx', 3)
        .attr('ry', 3);
      
      // Add "You are here" label
      g.append('text')
        .attr('class', 'user-type-label')
        .attr('x', offsetX + barRect.width/2)
        .attr('y', offsetY - 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', '#FF5733')
        .text('You are here');
    }
  });
  
  if (!foundMatch) {
    console.log('No matching bar found for user type:', userType);
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