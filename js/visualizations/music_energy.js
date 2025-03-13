// music_energy.js
// Visualization for music energy
//
(function() {
    // 1) Inject styles via JavaScript (no separate CSS)
    const styleContent = `
      /* --- Container for MBTI tabs (single row, no scroll) --- */
      #music-energy-tabs {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 6px;
        margin-bottom: 0;
        border-bottom: 1px solid #ccc;
        padding: 10px 0;
      }
      .mbti-tab {
        flex: 0 0 40px;
        cursor: pointer;
        padding: 4px 2px;
        border-radius: 4px 4px 0 0;
        border: 1px solid #ccc;
        border-bottom: none;
        transition: background-color 0.2s;
        font-weight: bold;
        font-size: 0.75rem;
        text-align: center;
        white-space: nowrap;
        color: #ffffff; /* Use white text since tabs are colored */
      }
      .mbti-tab:hover {
        filter: brightness(1.1);
      }
  
      /* --- Two-column layout for the main content --- */
      #music-energy-content {
        display: flex;
        flex-wrap: wrap;
        margin-top: 20px;
      }
      #music-energy-left-column {
        width: 60%;
        padding: 10px;
        box-sizing: border-box;
      }
      #music-energy-right-column {
        width: 40%;
        padding: 10px;
        box-sizing: border-box;
        text-align: center;
      }
  
      /* --- Title area: letters and expansions side by side --- */
      .mbti-title {
        margin-bottom: 20px;
      }
      .mbti-letter-block {
        display: inline-block;
        vertical-align: middle;
        margin-right: 30px; /* spacing between letter blocks */
      }
  
      /* --- Chart styles (horizontal bars) --- */
      .bar-chart {
        margin-top: 20px;
      }
      .bar-row {
        margin-bottom: 12px;
      }
      .bar-label {
        display: inline-block;
        width: 110px;
        font-weight: bold;
        vertical-align: middle;
      }
      .bar-track {
        display: inline-block;
        position: relative;
        height: 24px;
        width: 300px;
        background-color: #eee;
        vertical-align: middle;
        margin-left: 8px;
        border-radius: 4px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        text-align: right;
        transition: width 0.3s;
      }
      .bar-value {
        position: absolute;
        right: 5px;
        top: 0;
        line-height: 24px;
        color: #fff;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
      }
  
      /* --- Placeholder for the right-column image --- */
      .mbti-image-placeholder {
        width: 80%;
        height: 250px;
        background-color: #ddd;
        border: 2px dashed #bbb;
        display: inline-block;
        line-height: 250px;
        text-align: center;
        color: #999;
        font-size: 20px;
        border-radius: 8px;
      }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = styleContent;
    document.head.appendChild(styleEl);
  
    // 2) Create the necessary elements inside #music-energy-analysis
    const analysisContainer = document.getElementById('music-energy-analysis');
    if (!analysisContainer) {
      console.warn('Could not find #music-energy-analysis element. Aborting MBTI script.');
      return;
    }
  
    // Tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.id = 'music-energy-tabs';
    analysisContainer.appendChild(tabsContainer);
  
    // Main content container (for two columns)
    const contentContainer = document.createElement('div');
    contentContainer.id = 'music-energy-content';
    analysisContainer.appendChild(contentContainer);
  
    // Left column
    const leftColumn = document.createElement('div');
    leftColumn.id = 'music-energy-left-column';
    contentContainer.appendChild(leftColumn);
  
    // Right column
    const rightColumn = document.createElement('div');
    rightColumn.id = 'music-energy-right-column';
    contentContainer.appendChild(rightColumn);
  
    // 3) Map for expanding each MBTI letter
    const expansions = {
      I: 'ntroversion',
      E: 'xtraversion',
      S: 'ensing',
      N: 'intuition',
      T: 'hinking',
      F: 'eeling',
      J: 'udging',
      P: 'erceiving'
    };
  
    // 4) Color palette for each MBTI type
    const typeColors = {
      ISTJ: '#4C7DA5',
      ISFJ: '#4C9CA5',
      INFJ: '#746EAA',
      INTJ: '#9D67A5',
      ISTP: '#A9715F',
      ISFP: '#A68E5F',
      INFP: '#7AC7C4',
      INTP: '#8ECDC9',
      ESTP: '#AA7442',
      ESFP: '#D0B140',
      ENFP: '#FFC107',
      ENTP: '#FFB14C',
      ESTJ: '#5F9EA0',
      ESFJ: '#7FC8A9',
      ENFJ: '#B39DDB',
      ENTJ: '#CE93D8'
    };
  
    // 5) Fetch the MBTI data from data/raw/mbti_means.json
    fetch('data/raw/mbti_means.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load mbti_means.json: ' + response.statusText);
        }
        return response.json();
      })
      .then(mbtiData => {
        const mbtiTypes = Object.keys(mbtiData).sort();
  
        // Build a tab for each MBTI type
        mbtiTypes.forEach(type => {
          const tab = document.createElement('div');
          tab.className = 'mbti-tab';
          tab.textContent = type;
  
          // Apply background color for the tab
          tab.style.backgroundColor = typeColors[type] || '#999';
  
          tab.addEventListener('click', () => displayMBTI(type, mbtiData));
          tabsContainer.appendChild(tab);
        });
  
        // Display the first MBTI type by default
        if (mbtiTypes.length > 0) {
          displayMBTI(mbtiTypes[0], mbtiData);
        }
      })
      .catch(error => {
        console.error('Error loading MBTI data:', error);
      });
  
    // 6) Renders a chosen MBTI's data into the two columns
    function displayMBTI(type, mbtiData) {
      // Clear previous content
      leftColumn.innerHTML = '';
      rightColumn.innerHTML = '';
  
      // Determine color for the current type
      const color = typeColors[type] || '#999';
  
      // Build the MBTI title with each letter and expansion in one line
      let titleHtml = '<div class="mbti-title">';
      for (let i = 0; i < type.length; i++) {
        const letter = type[i];
        const word = expansions[letter] || '';
  
        titleHtml += `
          <span class="mbti-letter-block">
            <span style="font-size:30px;font-weight:bold;color:${color};">
              ${letter}
            </span>
            <span style="
              font-size:14px;
              color:${color};
              margin-left:5px;
              border-bottom:2px solid ${color};
            ">
              ${word}
            </span>
          </span>
        `;
      }
      titleHtml += '</div>';
  
      // A placeholder playlist
      const playlistHtml = `
        <div>
          <strong>Playlist for ${type}:</strong>
          <a href="#" target="_blank">[placeholder link]</a>
        </div>
      `;
  
      // Extract stats
      const stats = mbtiData[type];
  
      // Basic min/max for each stat to convert to bar widths
      const tempoMax = 200;
      const energyMax = 1;
      const loudnessMin = -20;
      const loudnessMax = 0;
      const acousticMax = 1;
  
      // Helper to clamp to [0..100]
      function clampPercent(value) {
        return Math.min(Math.max(value, 0), 100);
      }
  
      // Build one horizontal bar
      function makeBar(label, value, minVal, maxVal) {
        const widthPercent = clampPercent(((value - minVal) / (maxVal - minVal)) * 100);
        const displayVal = value.toFixed(2);
  
        return `
          <div class="bar-row">
            <span class="bar-label">${label}</span>
            <div class="bar-track">
              <div 
                class="bar-fill" 
                style="width:${widthPercent}%;background-color:${color};"
              >
                <span class="bar-value">${displayVal}</span>
              </div>
            </div>
          </div>
        `;
      }
  
      // Gather all four bars
      let barChartHtml = '<div class="bar-chart">';
      barChartHtml += makeBar('Tempo', stats.tempo_mean, 0, tempoMax);
      barChartHtml += makeBar('Energy', stats.energy_mean, 0, energyMax);
      barChartHtml += makeBar('Loudness', stats.loudness_mean, loudnessMin, loudnessMax);
      barChartHtml += makeBar('Acoustic', stats.acousticness_mean, 0, acousticMax);
      barChartHtml += '</div>';
  
      // Insert into the left column
      leftColumn.innerHTML = titleHtml + playlistHtml + barChartHtml;
  
      // Right column placeholder image
      const placeholderDiv = document.createElement('div');
      placeholderDiv.className = 'mbti-image-placeholder';
      placeholderDiv.textContent = `Image for ${type}`;
      rightColumn.appendChild(placeholderDiv);
    }
  })();
  