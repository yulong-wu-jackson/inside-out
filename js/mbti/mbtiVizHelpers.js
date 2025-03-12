// mbtiVizHelpers.js - Helper functions for MBTI visualizations

/**
 * Function to highlight user's MBTI type in the chart
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
    console.log("SVG container not found, retrying in 1800ms");
    setTimeout(highlightUserTypeInChart, 1800);
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
          .attr("y", barY - 30)
          .attr("text-anchor", "middle")
          .attr("fill", "#FF5722")
          .attr("font-weight", "bold")
          .attr("font-size", "12px")
          .attr("font-family", "'Poppins', sans-serif")
          .text("You are here")
          .attr("pointer-events", "none")
          .style("opacity", 0) // Start invisible
          .transition() // Add transition
          .duration(600) // 600ms fade in
          .delay(400) // Slightly longer delay than rectangle for staggered effect
          .style("opacity", 1); // Fade to fully visible
      }
    });
  
  if (!foundMatch && userMBTIType !== "unknown") {
    console.log(`No matching bar found for ${userMBTIType}, retrying in 1800ms`);
    setTimeout(highlightUserTypeInChart, 1800);
  }
}

// Make function available globally
window.highlightUserTypeInChart = highlightUserTypeInChart; 