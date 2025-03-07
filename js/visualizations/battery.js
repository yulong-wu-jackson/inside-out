document.addEventListener("DOMContentLoaded", function() {
    // Select the container for the battery visualization.
    const container = d3.select("#battery-visualization");
    
    // Append an SVG to the container.
    const svgWidth = 400, svgHeight = 400;
    const svg = container.append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
  
    // Battery body dimensions (shorter battery).
    const batteryX = 50, batteryY = 50, batteryWidth = 100, batteryHeight = 200;
    // Battery tip dimensions.
    const tipWidth = 30, tipHeight = 20;
    const tipX = batteryX + (batteryWidth - tipWidth) / 2;
    const tipY = batteryY - tipHeight; // Positioned above the battery body.
  
    // Draw battery body outline.
    svg.append("rect")
      .attr("x", batteryX)
      .attr("y", batteryY)
      .attr("width", batteryWidth)
      .attr("height", batteryHeight)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  
    // Draw battery tip.
    svg.append("rect")
      .attr("x", tipX)
      .attr("y", tipY)
      .attr("width", tipWidth)
      .attr("height", tipHeight)
      .attr("fill", "black");
  
    // Create a group for the inner battery levels.
    const levelsGroup = svg.append("g")
      .attr("class", "battery-levels");
  
    // Define 16 levels within the battery body.
    const numLevels = 16;
    const levelHeight = batteryHeight / numLevels;
    // Create levels (index 0 at the bottom).
    const levels = d3.range(numLevels).map(i => ({
      index: i,
      x: batteryX,
      y: batteryY + batteryHeight - (i + 1) * levelHeight,
      width: batteryWidth,
      height: levelHeight
    }));
  
    // Color scale: bottom (index 0) red, top (index 15) green.
    const colorScale = d3.scaleLinear()
      .domain([0, numLevels - 1])
      .range(["red", "green"]);
  
    // Append the level rectangles with no fill initially.
    const levelRects = levelsGroup.selectAll("rect")
      .data(levels)
      .enter()
      .append("rect")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("width", d => d.width)
      .attr("height", d => d.height)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
    // Create a right tooltip group on the SVG for MBTI and energy display.
    const rightTooltip = svg.append("g")
      .attr("class", "right-tooltip")
      .style("opacity", 0);
  
    // Append a rectangle for the tooltip box (enlarged).
    rightTooltip.append("rect")
      .attr("x", batteryX + batteryWidth + 10)  // Positioned to the right of the battery.
      .attr("width", 120)   // Increased width.
      .attr("height", 40)   // Increased height.
      .attr("fill", "#ccc")
      .attr("stroke", "black")
      .attr("rx", 4)
      .attr("ry", 4);
  
    // Append a text element inside the tooltip (larger font size).
    const tooltipText = rightTooltip.append("text")
      .attr("x", batteryX + batteryWidth + 10 + 60)  // Centered in the new rectangle.
      .attr("y", 0)
      .attr("dy", "2em")      // Adjust vertical centering.
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "14px");
  
    // Load the JSON file containing MBTI energy means from the data/raw folder.
    d3.json("data/raw/mbti_energy_mean.json").then(data => {
      // Convert JSON object into an array of {mbti, energy}.
      const mbtiArray = Object.entries(data).map(([mbti, energy]) => ({ mbti, energy }));
      // Sort the array by energy in ascending order (lowest energy first).
      mbtiArray.sort((a, b) => a.energy - b.energy);
  
      // Assign each level an MBTI type based on its sorted order.
      // (Level 0, at the bottom, gets the lowest energy MBTI.)
      levels.forEach((d, i) => {
        d.mbti = mbtiArray[i].mbti;
        d.energy = mbtiArray[i].energy;
      });
      // Rebind updated data to the level rectangles.
      levelRects.data(levels);
  
      // Add an invisible rectangle over the battery to capture all mouse movements.
      svg.append("rect")
        .attr("x", batteryX)
        .attr("y", batteryY)
        .attr("width", batteryWidth)
        .attr("height", batteryHeight)
        .attr("fill", "transparent")
        .on("mousemove", function(event) {
          const [mx, my] = d3.pointer(event);
          // Compute the hovered level based on mouseY.
          const levelHovered = Math.floor((batteryY + batteryHeight - my) / levelHeight);
          // Ensure levelHovered is within 0 and numLevels - 1.
          const idx = Math.max(0, Math.min(numLevels - 1, levelHovered));
          // Update the fill for levels: fill all levels with index <= idx.
          levelRects.attr("fill", d => d.index <= idx ? colorScale(d.index) : "none");
          // Retrieve the level data.
          const d = levels[idx];
          // Position the right tooltip vertically centered on the hovered level.
          rightTooltip
            .attr("transform", `translate(0, ${d.y + d.height / 2 - 20})`)
            .style("opacity", 1);
          // Display the MBTI type and energy value in the tooltip.
          tooltipText.text(`${d.mbti} |${d.energy.toFixed(3)}`);
        })
        .on("mouseout", function() {
          // Reset all levels to no fill.
          levelRects.attr("fill", "none");
          // Hide the right tooltip.
          rightTooltip.style("opacity", 0);
        });
    }).catch(error => {
      console.error("Error loading JSON:", error);
    });
  });
  