// who_coomments_most.js - Visualization for who MBTI comments // who_comments_most.js - Visualization for which MBTI types comment most

/**
 * Initialize the "Who Comments Most" visualization
 */
function initWhoCommentsMostChart() {
    console.log("Initializing Who Comments Most visualization...");
    
    // Get the container element
    const container = document.getElementById('comment-analysis');
    if (!container) {
      console.error("Comment analysis container not found");
      return;
    }
    
    // Show loading indicator
    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading comment analysis...</div>
      </div>
    `;
    
    // Check if processed data exists
    checkProcessedDataExists()
      .then(exists => {
        if (exists) {
          // Use processed data
          return fetch('data/processedJson/postCount.json')
            .then(response => response.json());
        } else {
          // Process raw data
          return processRawData();
        }
      })
      .then(data => {
        // Create visualization
        createCommentCountVisualization(data, container);
      })
      .catch(error => {
        console.error("Error loading comment data:", error);
        container.innerHTML = `
          <div class="error-message">
            <p>Error loading comment data. Please try again later.</p>
          </div>
        `;
      });
  }
  
  /**
   * Check if processed data file exists
   * @returns {Promise<boolean>} Promise resolving to true if file exists, false otherwise
   */
  function checkProcessedDataExists() {
    return fetch('data/processedJson/postCount.json', { method: 'HEAD' })
      .then(response => response.ok)
      .catch(() => false);
  }
  
  /**
   * Process raw MBTI post data to count comments by type
   * @returns {Promise<Array>} Promise resolving to array of MBTI types and counts
   */
  function processRawData() {
    return fetch('data/rawJson/post/mbtiPost.json')
      .then(response => response.json())
      .then(data => {
        // Count posts by MBTI type
        const typeCounts = {};
        
        // Process each entry
        data.forEach(entry => {
          const type = entry.type;
          if (type) {
            // Initialize counter if not exists
            if (!typeCounts[type]) {
              typeCounts[type] = 0;
            }
            
            // Count the number of posts (assuming each entry has one post)
            typeCounts[type]++;
          }
        });
        
        // Convert to array format for visualization
        return Object.keys(typeCounts).map(type => ({
          type: type,
          count: typeCounts[type]
        }));
      });
  }
  
  /**
   * Create the bar chart visualization for comment counts
   * @param {Array} data Array of objects with type and count properties
   * @param {HTMLElement} container Container element for the visualization
   */
  function createCommentCountVisualization(data, container) {
    // Clear loading indicator
    container.innerHTML = '';
    
    // Sort data by count (descending)
    data.sort((a, b) => b.count - a.count);
    
    // Set up dimensions and margins
    const margin = { top: 40, right: 30, bottom: 90, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.type))
      .range([0, width])
      .padding(0.2);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) * 1.1]) // Add 10% padding at top
      .range([height, 0]);
    
    // Add x-axis
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');
    
    // Add y-axis
    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y).ticks(10))
      .selectAll('text')
      .style('font-size', '12px');
    
    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Number of Comments');
    
    // Add chart title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text('Comment Frequency by MBTI Type');
    
    // Create tooltip
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('z-index', '100');
    
    // Function to determine bar color based on MBTI type categories
    function getBarColor(type) {
      // Group by MBTI categories
      const mbtiCategories = {
        'Analysts': ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
        'Diplomats': ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
        'Sentinels': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
        'Explorers': ['ISTP', 'ISFP', 'ESTP', 'ESFP']
      };
      
      // Colors for each category
      const categoryColors = {
        'Analysts': '#4A6BDC',  // Blue
        'Diplomats': '#9C56DC', // Purple
        'Sentinels': '#3F9E4D', // Green
        'Explorers': '#E6A117'  // Orange/Yellow
      };
      
      // Find which category this type belongs to
      for (const [category, types] of Object.entries(mbtiCategories)) {
        if (types.includes(type)) {
          return categoryColors[category];
        }
      }
      
      // Default color if type not found
      return '#9C27B0';
    }
    
    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.type))
      .attr('width', x.bandwidth())
      .attr('y', height) // Start at bottom for animation
      .attr('height', 0) // Start with height 0 for animation
      .attr('fill', d => getBarColor(d.type))
      .attr('rx', 2) // Rounded corners
      .attr('ry', 2) // Rounded corners
      // Add hover effects
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
        
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${d.type}</strong><br>
          Comments: ${d.count}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
        
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      })
      // Animate bars on load
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr('y', d => y(d.count))
      .attr('height', d => height - y(d.count));
    
    // Add value labels on top of bars
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.type) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('opacity', 0) // Start invisible for animation
      .text(d => d.count)
      // Animate labels
      .transition()
      .duration(800)
      .delay((d, i) => i * 50 + 400)
      .style('opacity', 1);
    
    // Add legend
    const legendData = [
      { label: 'Analysts (NT)', color: '#4A6BDC' },
      { label: 'Diplomats (NF)', color: '#9C56DC' },
      { label: 'Sentinels (SJ)', color: '#3F9E4D' },
      { label: 'Explorers (SP)', color: '#E6A117' }
    ];
    
    // Position the legend at the top-right of the chart area
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 150}, 0)`);
    
    legendData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', item.color);
      
      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .text(item.label);
    });
    
    // Add responsive behavior
    function resizeChart() {
      const newWidth = container.clientWidth - margin.left - margin.right;
      
      // Update SVG dimensions
      d3.select(container).select('svg')
        .attr('width', newWidth + margin.left + margin.right);
      
      // Update x scale
      x.range([0, newWidth]);
      
      // Update x axis
      svg.select('.x-axis')
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');
      
      // Update bars
      svg.selectAll('.bar')
        .attr('x', d => x(d.type))
        .attr('width', x.bandwidth());
      
      // Update labels
      svg.selectAll('.label')
        .attr('x', d => x(d.type) + x.bandwidth() / 2);
      
      // Update title
      svg.select('.chart-title')
        .attr('x', newWidth / 2);
      
      // Update legend position
      svg.select('.legend')
        .attr('transform', `translate(${newWidth - 150}, 0)`);
    }
    
    // Add window resize listener
    window.addEventListener('resize', debounce(resizeChart, 250));
  }
  
  // Debounce function to limit resize events
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Export the initialization function
  window.initWhoCommentsMostChart = initWhoCommentsMostChart;