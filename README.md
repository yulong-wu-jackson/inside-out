# on-the-clock
# Scroll-Linked SVG Animation Template

This document explains how the scrollytelling template works and provides step-by-step instructions for customizing it with your own data and charts. The template uses D3 for creating and animating SVG elements and Scrollama to link the animations to scroll progress.

---

## Table of Contents

1. [Overview](#overview)
2. [How Does the Code Work?](#how-does-the-code-work)
   - [HTML Structure](#html-structure)
   - [CSS Layout](#css-layout)
   - [JavaScript (D3 & Scrollama)](#javascript-d3--scrollama)
3. [How to Use This Template](#how-to-use-this-template)
   - [Setting Up the Template](#setting-up-the-template)
   - [Customizing the Narrative](#customizing-the-narrative)
   - [Adding Your Own Data and Chart](#adding-your-own-data-and-chart)
     - [Example: Replacing the Bar Chart with a Line Chart](#example-replacing-the-bar-chart-with-a-line-chart)
4. [General Tips](#general-tips)
5. [Conclusion](#conclusion)

---

## Overview

This template creates a scrollytelling webpage with two main parts:

- **Landing Page:** A full-screen welcome page that covers the fixed graphic panel.
- **Scrollytelling Section:** Once the landing page is scrolled away, a two-column layout is revealed:
  - **Left Panel:** A fixed graphic panel (occupying 50% of the viewport width) that displays an SVG element. This SVG is updated continuously as the user scrolls.
  - **Right Panel:** A scrollable narrative containing multiple `.step` sections. Each step is linked to a specific animation or state update in the SVG.

In the provided template, the left visualization starts as a circle (vis1) that smoothly transitions between states as you scroll. At one point, a transition step causes the circle to "fly away" and reveal a second visualization (vis2)—a bar chart. All animations are progress-linked so that fast scrolling or scrolling backward automatically reverses the animations.

---

## How Does the Code Work?

### HTML Structure

- **`<head>` Section:**
  - Loads required libraries: D3 (v7) and Scrollama from CDNs.
  - Contains CSS styling for the layout and animations.

- **`<body>` Section:**
  1. **Landing Page (`.landing`):**
     - A full viewport height section displaying a welcome message.
     - Uses a high z-index so that it covers the fixed graphic panel until scrolled away.
  2. **Scrollytelling Section (`.scrollytelling`):**
     - **Left Fixed Graphic Panel (`.graphic-container`):**
       - Contains an `<svg>` element (set to 500×500 pixels) with two groups:
         - **`#vis1`:** Holds the first visualization (the circle).
         - **`#vis2`:** Holds the second visualization (the bar chart). It starts hidden (opacity set to 0).
     - **Right Scrollable Text (`.text-container`):**
       - Contains multiple `.step` divs.  
       - Each `.step` has custom data attributes:
         - `data-vis`: Indicates which visualization (or transition) the step controls (e.g., `vis1`, `transition`, or `vis2`).
         - `data-step`: Specifies the step number within that visualization.

### CSS Layout

- **Landing Page:**
  - Fills the viewport (`height: 100vh`) and uses a higher z-index to cover the fixed graphic panel until scrolling.
- **Fixed Graphic Panel (`.graphic-container`):**
  - Positioned fixed on the left side (50vw wide) so it remains visible as the narrative scrolls.
- **Text Container (`.text-container`):**
  - Positioned relative with a left margin of 50vw to appear on the right half of the screen.
  - Contains the narrative steps with ample vertical spacing for smooth scrolling.

### JavaScript (D3 & Scrollama)

- **SVG and Visualization Setup:**
  - The SVG is selected, and two groups are created (`#vis1` and `#vis2`).
  - **vis1 (Circle):**
    - A circle is appended with initial attributes (radius, position, fill color).
    - Three states are defined:
      - **State1:** `{ r: 50, cx: 250, fill: "steelblue" }`
      - **State2:** `{ r: 70, cx: 200, fill: "orange" }`
      - **State3:** `{ r: 40, cx: 300, fill: "green" }`
  - **vis2 (Bar Chart):**
    - Two data arrays are defined: one for the initial bar heights (`data1`) and one for the target heights (`data2`).

- **Scrollama Setup:**
  - The Scrollama instance is configured with `progress: true` so that each step returns a progress value (between 0 and 1).
  - In the progress callback (`onStepProgress`), the code checks the `data-vis` attribute:
    - **For `vis1`:** Depending on the `data-step` (1, 2, or 3), D3 interpolates between the predefined states based on the scroll progress.
    - **For `transition`:** The callback moves the `vis1` group off-screen (with a translation and opacity change) while fading in the `vis2` group.
    - **For `vis2`:** The bar chart is created (if it doesn't exist) and then updated. For example, the bars fade in, then their heights and colors are interpolated.
- **Progress-Linked Animations:**
  - Using the scroll progress value (`p`), animations directly mirror the extent of scrolling. This approach ensures that fast scrolling or scrolling back automatically reverses the animations.

---

## How to Use This Template

### Setting Up the Template

1. **Copy the Code:**
   - Save the provided HTML template into a file (e.g., `index.html`).

2. **Open in a Browser:**
   - Open `index.html` in your web browser. You should first see a full-page landing screen. As you scroll down, the landing page moves away to reveal the two-column layout with a fixed graphic on the left and narrative text on the right.

### Customizing the Narrative

- **Edit Text Content:**
  - In the HTML file, locate the `<div class="text-container">` section. Modify the `<h2>` and `<p>` content inside each `.step` element to suit your narrative.
  
- **Add New Steps:**
  - To add a new narrative step, copy one of the existing `.step` divs and adjust its `data-vis` and `data-step` attributes. For example:
    ```html
    <div class="step" data-vis="vis1" data-step="4">
      <h2>Step 4: Additional Information</h2>
      <p>More details about the visualization as the scroll progresses.</p>
    </div>
    ```
  - **Note:** If you add new steps, update the JavaScript functions (e.g., the interpolation logic in `onStepProgress`) to define how the SVG should update for that new step.

### Adding Your Own Data and Chart

You can replace or extend the existing visualizations with your own data and charts. The following example demonstrates how to replace the bar chart in `vis2` with a simple line chart.

#### Example: Replacing the Bar Chart with a Line Chart

1. **Update the HTML (if necessary):**
   - The `<svg>` element already contains a `<g id="vis2">` group. You can use this group to insert your new chart.

2. **Update the JavaScript:**

   - **Remove or Comment Out the Bar Chart Code:**
     - In the Scrollama callback section for `data-vis="vis2"`, remove or comment out the bar chart code.

   - **Insert the Line Chart Code:**
     - Below is a complete example snippet to create a line chart in `vis2`. You can include this code in your JavaScript file where the `data-vis === "vis2"` block is handled.

   ```js
   // Sample data for a line chart
   const lineData = d3.range(0, 11).map(d => ({ x: d, y: Math.sin(d / 2) }));

   // Define scales for the line chart
   const xScale = d3.scaleLinear().domain([0, 10]).range([50, 450]);
   const yScale = d3.scaleLinear().domain([-1, 1]).range([450, 50]);

   // Create a line generator
   const lineGenerator = d3.line()
                           .x(d => xScale(d.x))
                           .y(d => yScale(d.y));

   // Append a path for the line chart to vis2 (if not already created)
   let linePath = vis2.selectAll("path.line").data([lineData]);
   linePath = linePath.enter()
                      .append("path")
                      .attr("class", "line")
                      .merge(linePath)
                      .attr("d", lineGenerator)
                      .attr("stroke", "blue")
                      .attr("stroke-width", 2)
                      .attr("fill", "none")
                      // Initially hide the line using stroke-dash properties
                      .attr("stroke-dasharray", function() { return this.getTotalLength(); })
                      .attr("stroke-dashoffset", function() { return this.getTotalLength(); });

   // In the Scrollama callback for vis2, replace the previous bar chart animation with a line-drawing effect.
   // For example, during a specific step for vis2 (you can tie this to a particular data-step value):
   if (visType === "vis2" && step === 1) {
     // As progress (p) increases, draw the line gradually:
     const totalLength = linePath.node().getTotalLength();
     linePath.attr("stroke-dashoffset", totalLength * (1 - p));
   }
