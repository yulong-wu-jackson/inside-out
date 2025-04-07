// Famous People by MBTI Visualization
// This visualization displays famous people by their MBTI type
// Author: Claude for Inside Out: Exploring MBTI

// Global variables
let famousPeopleData = [];
let selectedMbtiType = null;
let userMbtiType = null; // Will be set if user selected their type
let svg = null;
let width = 0;
let height = 0;
let simulation = null;
let mbtiNodes = [];
let personNodes = [];
let links = [];
const mbtiTypes = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

// MBTI Category Colors
const mbtiColors = {
  'ISTJ': '#3F9E4D', 'ISFJ': '#3F9E4D', 'ESTJ': '#3F9E4D', 'ESFJ': '#3F9E4D', // Sentinels
  'ISTP': '#E6A117', 'ISFP': '#E6A117', 'ESTP': '#E6A117', 'ESFP': '#E6A117', // Explorers
  'INFJ': '#9C56DC', 'INFP': '#9C56DC', 'ENFJ': '#9C56DC', 'ENFP': '#9C56DC', // Diplomats
  'INTJ': '#4A6BDC', 'INTP': '#4A6BDC', 'ENTJ': '#4A6BDC', 'ENTP': '#4A6BDC'  // Analysts
};

// Initialize the visualization
function initFamousPeopleVisualization() {
  console.log("Initializing Famous People Visualization");
  
  // Check if user has selected their MBTI type
  if (localStorage.getItem('userMbtiType')) {
    // Fix: Ensure proper capitalization of MBTI type
    userMbtiType = localStorage.getItem('userMbtiType').toUpperCase();
    console.log("User MBTI type loaded from localStorage:", userMbtiType);
    
    // Validate that it's a proper MBTI type
    if (!mbtiTypes.includes(userMbtiType)) {
      console.warn(`User MBTI type ${userMbtiType} is not valid. Available types:`, mbtiTypes);
      userMbtiType = null;
    } else {
      console.log("Valid user MBTI type detected:", userMbtiType);
    }
  } else {
    console.log("No user MBTI type found in localStorage");
  }
  
  // Load the data
  loadFamousPeopleData();
}

// Load the famous people data
function loadFamousPeopleData() {
  d3.json('data/rawJson/famous/famousMbti.json')
    .then(data => {
      console.log("Famous people data loaded:", data.length, "entries");
      famousPeopleData = data;
      
      // Log a sample of the data to check the format
      if (data.length > 0) {
        console.log("Sample data entry:", data[0]);
        console.log("Personality field format:", data[0].personality);
      }
      
      // Process data
      processFamousPeopleData();
      
      // Create the visualization
      createMbtiBubblesView();
    })
    .catch(error => {
      console.error("Error loading famous people data:", error);
      document.querySelector('#famous-people-graph .loading').innerHTML = 
        `<div class="error-message">Error loading data. Please try refreshing the page.</div>`;
    });
}

// Process the famous people data
function processFamousPeopleData() {
  // Group data by MBTI personality type
  const groupedByMbti = {};
  let processedCount = 0;
  let skippedCount = 0;
  
  famousPeopleData.forEach(person => {
    // Skip entries without personality data
    if (!person.personality) {
      skippedCount++;
      return;
    }
    
    // Normalize and validate the MBTI type
    let mbtiType = person.personality.toUpperCase().trim();
    
    // Handle various formats (like 'istj' or 'ISTJ' or 'ISTJ-A')
    if (mbtiType.length > 4) {
      mbtiType = mbtiType.substring(0, 4); // Take only the first 4 characters
    }
    
    // Validate that it's one of the 16 valid MBTI types
    if (!mbtiTypes.includes(mbtiType)) {
      console.warn(`Skipping entry with invalid MBTI type: ${mbtiType}`, person);
      skippedCount++;
      return;
    }
    
    // Ensure array exists for this type
    if (!groupedByMbti[mbtiType]) {
      groupedByMbti[mbtiType] = [];
    }
    
    // Add to the appropriate group
    groupedByMbti[mbtiType].push(person);
    processedCount++;
  });
  
  // Sort each group by total votes (popularity)
  for (const mbtiType in groupedByMbti) {
    groupedByMbti[mbtiType].sort((a, b) => b["total votes"] - a["total votes"]);
  }
  
  console.log(`Processed ${processedCount} entries, skipped ${skippedCount} entries`);
  console.log("Grouped data has entries for these types:", Object.keys(groupedByMbti));
  
  // Make sure all 16 MBTI types have at least an empty array
  mbtiTypes.forEach(type => {
    if (!groupedByMbti[type]) {
      groupedByMbti[type] = [];
      console.warn(`No data found for MBTI type: ${type}`);
    }
  });
  
  // Store the processed data
  window.groupedFamousPeople = groupedByMbti;
  
  // Log available MBTI types for debugging
  console.log("Available MBTI types in data:", Object.keys(groupedByMbti));
}

// Create the MBTI bubbles view
function createMbtiBubblesView() {
  // Clear the container
  const container = document.getElementById('famous-people-graph');
  container.innerHTML = '';
  
  // Set dimensions
  width = container.clientWidth;
  height = container.clientHeight || 600;
  
  // Create SVG
  svg = d3.select('#famous-people-graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'mbti-bubbles-svg');
  
  // Create a container for all elements with zoom functionality
  const g = svg.append('g')
    .attr('class', 'everything');
  
  // Add a background rect to handle click events for zooming out
  g.append('rect')
    .attr('class', 'background')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent')
    .on('click', () => {
      if (selectedMbtiType) {
        // If we're in detailed view, go back to bubble view
        selectedMbtiType = null;
        createMbtiBubblesView();
      }
    });
  
  // Create MBTI bubble nodes
  mbtiNodes = mbtiTypes.map(type => ({
    id: type,
    type: 'mbti',
    radius: 40,
    color: mbtiColors[type]
  }));
  
  // Create force simulation for the bubbles
  simulation = d3.forceSimulation(mbtiNodes)
    .force('charge', d3.forceManyBody().strength(30))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.radius + 10).strength(0.7))
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .alphaDecay(0.02) // Slower decay for smoother animation
    .velocityDecay(0.3) // Add damping to reduce shakiness
    .on('tick', ticked);
  
  // Initial positioning - place nodes in a circle pattern to reduce initial chaos
  const radius = Math.min(width, height) / 3;
  const angleStep = (2 * Math.PI) / mbtiNodes.length;
  
  mbtiNodes.forEach((node, i) => {
    // Position nodes in a circle around the center
    const angle = i * angleStep;
    node.x = width / 2 + radius * Math.cos(angle);
    node.y = height / 2 + radius * Math.sin(angle);
    // Add small initial velocities for smoother start
    node.vx = 0;
    node.vy = 0;
  });
  
  // Create circles for MBTI types
  const bubbles = g.selectAll('.mbti-bubble')
    .data(mbtiNodes)
    .enter()
    .append('g')
    .attr('class', d => `mbti-bubble ${d.id === userMbtiType ? 'user-mbti' : ''}`)
    .call(drag(simulation));
  
  // Add circle elements
  bubbles.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('class', d => (d.id === userMbtiType) ? 'user-mbti-bubble' : '')
    .attr('stroke', d => (d.id === userMbtiType) ? '#000' : '#fff')
    .attr('stroke-width', d => (d.id === userMbtiType) ? 3 : 1)
    .style('cursor', 'pointer')
    .on('click', handleMbtiBubbleClick);
  
  // Add text labels
  bubbles.append('text')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('fill', '#fff')
    .attr('font-size', '12px')
    .attr('font-weight', d => (d.id === userMbtiType) ? 'bold' : 'normal')
    .style('pointer-events', 'none');
  
  // Add special animation for user's MBTI type
  if (userMbtiType) {
    bubbles.filter(d => d.id === userMbtiType)
      .select('circle')
      .each(function() {
        d3.select(this)
          .transition()
          .duration(1500)
          .attr('r', 45)
          .transition()
          .duration(1500)
          .attr('r', 40)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(1500)
              .attr('r', 45)
              .transition()
              .duration(1500)
              .attr('r', 40)
              .on('end', repeat);
          });
      });
  }
  
  // Tick function for the simulation
  function ticked() {
    // Apply boundary constraints to prevent nodes from going off-screen
    mbtiNodes.forEach(node => {
      // Add padding to prevent bubbles from being cropped
      const padding = node.radius + 10;
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    });
    
    bubbles.attr('transform', d => `translate(${d.x}, ${d.y})`);
  }
  
  // Show instructions overlay
  showInstructions();
}

// Show instructions overlay
function showInstructions() {
  const container = document.getElementById('famous-people-graph');
  
  const instructions = document.createElement('div');
  instructions.className = 'famous-people-instructions';
  instructions.innerHTML = `
    <div class="instructions-content">
      <span class="close-instructions">&times;</span>
      <h3>Famous People by MBTI Type</h3>
      <p>Click on any MBTI bubble to see famous people of that type.</p>
      ${userMbtiType ? `<p>Your MBTI type (${userMbtiType}) is highlighted and pulsing.</p>` : ''}
    </div>
  `;
  
  container.appendChild(instructions);
  
  // Add event listener to close button
  const closeButton = instructions.querySelector('.close-instructions');
  closeButton.addEventListener('click', () => {
    if (instructions.parentNode) {
      instructions.parentNode.removeChild(instructions);
    }
  });
  
  // Fade out instructions after a delay (they can still be closed manually)
  setTimeout(() => {
    instructions.style.opacity = '0';
    setTimeout(() => {
      if (instructions.parentNode) {
        instructions.parentNode.removeChild(instructions);
      }
    }, 1000); // Remove after fade out
  }, 3000); // Show for 3 seconds before fading
}

// Handle MBTI bubble click
function handleMbtiBubbleClick(event, d) {
  // Set the selected MBTI type
  selectedMbtiType = d.id;
  console.log("Selected MBTI type:", selectedMbtiType);
  
  // Show detailed view for this MBTI type
  createDetailedView(selectedMbtiType);
}

// Create detailed graph view for a specific MBTI type
function createDetailedView(mbtiType) {
  // Clear the container
  const container = document.getElementById('famous-people-graph');
  container.innerHTML = '';
  
  // Get the famous people for this MBTI type - FIX: use uppercase for key lookup
  const famousPeople = window.groupedFamousPeople[mbtiType.toUpperCase()];
  
  // Fail gracefully if no data or empty array
  if (!famousPeople) {
    console.error(`No data available for ${mbtiType.toUpperCase()}. Available types:`, 
      window.groupedFamousPeople ? Object.keys(window.groupedFamousPeople) : "No data loaded");
    
    showErrorMessage(container, mbtiType);
    return;
  }
  
  // Handle case where array exists but is empty
  if (famousPeople.length === 0) {
    console.warn(`Found array for ${mbtiType.toUpperCase()} but it contains no people`);
    
    // Show an empty state instead of error
    showEmptyStateMessage(container, mbtiType);
    return;
  }
  
  // Limit to top 20 famous people for this type to avoid clutter
  const topFamousPeople = famousPeople.slice(0, 20);
  
  // Find the maximum vote count for normalization
  const maxVotes = d3.max(topFamousPeople, person => person["total votes"]) || 1;
  console.log(`Max votes among famous ${mbtiType} people: ${maxVotes}`);
  
  // Set dimensions
  width = container.clientWidth;
  height = container.clientHeight || 600;
  
  // Create SVG
  svg = d3.select('#famous-people-graph')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'detailed-view-svg');
  
  // Create a container for all elements with zoom functionality
  const g = svg.append('g')
    .attr('class', 'everything');
  
  // Create nodes
  const mbtiNode = {
    id: mbtiType,
    type: 'mbti',
    radius: 70,
    color: mbtiColors[mbtiType]
  };
  
  // Calculate radius based on normalized vote count
  // Base radius = 25, max additional radius = 35
  const MIN_RADIUS = 25;
  const MAX_ADDITIONAL_RADIUS = 35;
  
  personNodes = topFamousPeople.map(person => {
    // Normalize votes to get a scale factor between 0 and 1
    const voteScaleFactor = (person["total votes"] || 0) / maxVotes;
    
    // Calculate radius: min radius + additional radius based on votes
    const radius = MIN_RADIUS + (voteScaleFactor * MAX_ADDITIONAL_RADIUS);
    
    return {
      id: person.name,
      type: 'person',
      mbtiType: mbtiType,
      radius: radius,
      votes: person["total votes"] || 0,
      color: d3.color(mbtiColors[mbtiType]).brighter(0.7),
      data: person
    };
  });
  
  // Create links
  links = personNodes.map(person => ({
    source: mbtiType,
    target: person.id,
    value: 1
  }));
  
  // Combine nodes
  const nodes = [mbtiNode, ...personNodes];
  
  // Create force simulation with boundary forces to keep nodes within visible area
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(180))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.radius + 10).strength(0.7))
    // Add boundary forces to keep nodes within visible area with padding
    .force('x', d3.forceX(width / 2).strength(0.1))
    .force('y', d3.forceY(height / 2).strength(0.1))
    .on('tick', ticked);
  
  // Create links
  const link = g.selectAll('.link')
    .data(links)
    .enter()
    .append('line')
    .attr('class', 'link')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2);
  
  // Create node groups
  const node = g.selectAll('.node')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class', d => `node ${d.type}-node`)
    .call(drag(simulation));
  
  // Add circles for nodes
  node.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 2);
  
  // Add text for MBTI node
  node.filter(d => d.type === 'mbti')
    .append('text')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('fill', '#fff')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .style('pointer-events', 'none');
  
  // Add text for person nodes
  node.filter(d => d.type === 'person')
    .append('text')
    .text(d => truncateName(d.id, d.radius))
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('fill', '#fff')
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .style('pointer-events', 'none');
  
  // Remove old tooltip if exists
  d3.select('#famous-people-tooltip').remove();
  
  // Create a new tooltip div
  const tooltip = d3.select('body')
    .append('div')
    .attr('id', 'famous-people-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(255, 255, 255, 0.95)')
    .style('color', '#333')
    .style('padding', '10px')
    .style('border-radius', '5px')
    .style('border', '1px solid #ddd')
    .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.2)')
    .style('font-family', 'Poppins, sans-serif')
    .style('font-size', '14px')
    .style('z-index', '9999')
    .style('pointer-events', 'none')
    .style('max-width', '250px');
  
  // Add hover events for person nodes
  node.filter(d => d.type === 'person')
    .on('mouseover', function(event, d) {
      // Highlight the node
      d3.select(this).select('circle')
        .transition()
        .duration(300)
        .attr('r', d.radius + 5)
        .attr('stroke', '#333')
        .attr('stroke-width', 3);
      
      // Build tooltip content
      const content = `
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${d.id}</div>
        <div style="font-weight: bold; color: ${mbtiColors[d.mbtiType]}; margin-bottom: 8px;">${d.mbtiType}</div>
        <div style="margin-bottom: 5px;"><b>Total Votes:</b> ${d.votes.toLocaleString()}</div>
      `;
      
      // Show and position tooltip
      tooltip
        .html(content)
        .style('visibility', 'visible')
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 30) + 'px');
      
      console.log('Mouseover triggered for:', d.id);
    })
    .on('mousemove', function(event) {
      // Update tooltip position as mouse moves
      tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 30) + 'px');
    })
    .on('mouseout', function(event, d) {
      // Revert highlighting
      d3.select(this).select('circle')
        .transition()
        .duration(300)
        .attr('r', d.radius)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      // Hide tooltip
      tooltip.style('visibility', 'hidden');
      
      console.log('Mouseout triggered for:', d.id);
    })
    .style('cursor', 'pointer');
  
  // Add back button
  const backButton = document.createElement('button');
  backButton.className = 'famous-people-back-button';
  backButton.innerHTML = '← Back to All Types';
  backButton.addEventListener('click', () => {
    selectedMbtiType = null;
    createMbtiBubblesView();
  });
  container.appendChild(backButton);
  
  // Add a title
  const title = document.createElement('div');
  title.className = 'famous-people-title';
  title.innerHTML = `<h3>Famous ${mbtiType} Personalities</h3>`;
  container.appendChild(title);
  
  // Tick function for the simulation with boundary constraints
  function ticked() {
    // Apply boundary constraints to prevent nodes from going off-screen
    nodes.forEach(node => {
      // Add padding (node.radius + 10px) to prevent cropping
      const padding = node.radius + 10;
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    });
    
    // Update link positions
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    
    // Update node positions
    node.attr('transform', d => `translate(${d.x}, ${d.y})`);
  }
}

// Drag functions for interactive nodes
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we need to initialize immediately or wait for scrollytelling
  const famousPeopleSection = document.getElementById('famous-people-mbti');
  
  if (famousPeopleSection) {
    // If we're using scrollytelling, add initialization to the scrollytelling events
    // This is likely handled by the existing scrollytelling code
    console.log("Famous People section exists, waiting for scrollytelling events");
  } else {
    // If there's no scrollytelling, initialize immediately
    console.log("No scrollytelling detected, initializing Famous People visualization");
    initFamousPeopleVisualization();
  }
});

// Add this function to the global scope to allow other scripts to initialize it
window.initFamousPeopleVisualization = initFamousPeopleVisualization;

// Helper function to show error message
function showErrorMessage(container, mbtiType) {
  // Show informative error message
  container.innerHTML = `
    <div class="error-message">
      <h3>No Data Available</h3>
      <p>We couldn't find any famous people data for MBTI type: ${mbtiType}</p>
      <p>This might be due to how the data is formatted in the source files.</p>
    </div>`;
  
  addBackButton(container);
}

// Helper function to show empty state
function showEmptyStateMessage(container, mbtiType) {
  container.innerHTML = `
    <div class="empty-state-message">
      <h3>No Famous People Found</h3>
      <p>We don't have any famous people with MBTI type ${mbtiType} in our database.</p>
      <p>Try selecting a different MBTI type to explore.</p>
    </div>`;
  
  addBackButton(container);
}

// Helper function to add back button
function addBackButton(container) {
  const backButton = document.createElement('button');
  backButton.className = 'famous-people-back-button';
  backButton.innerHTML = '← Back to All Types';
  backButton.addEventListener('click', () => {
    selectedMbtiType = null;
    createMbtiBubblesView();
  });
  container.appendChild(backButton);
}

// Helper function to truncate names to fit in bubbles
function truncateName(name, radius) {
  // Calculate approximately how many characters can fit based on bubble radius
  // This formula is refined based on testing
  const maxChars = Math.max(Math.floor(radius / 3.5), 3);
  
  if (name.length <= maxChars) {
    return name;
  }
  
  // For very short bubbles, just return initials
  if (maxChars <= 5) {
    const words = name.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`;
    }
  }
  
  // Truncate with ellipsis
  return name.substring(0, maxChars - 2) + '...';
} 