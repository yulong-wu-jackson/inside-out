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
        border-bottom: 1px solid #ccc; /* optional "tab bar" look */
        padding: 10px 0;
      }
      /* Each tab has a fixed width so all 16 can fit in one row on typical displays */
      .mbti-tab {
        flex: 0 0 40px;   /* fixed width: 40px */
        cursor: pointer;
        background-color: #e3e3e3;
        padding: 4px 2px;
        border-radius: 4px 4px 0 0;
        border: 1px solid #ccc;
        border-bottom: none; /* so it looks like connected tabs */
        transition: background-color 0.2s;
        font-weight: bold;
        font-size: 0.75rem;
        text-align: center;
        white-space: nowrap; /* keep type on one line */
      }
      .mbti-tab:hover {
        background-color: #ddd;
      }
  
      /* --- Two-column layout for the main content --- */
      #music-energy-content {
        display: flex;
        flex-wrap: wrap; /* fallback if screen is narrow */
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
  
      /* --- MBTI title at the top of left column --- */
      .mbti-title {
        margin-bottom: 20px;
      }
      .mbti-letter {
        font-size: 48px;
        font-weight: bold;
        vertical-align: middle;
        margin-right: 4px;
      }
      .mbti-word {
        font-size: 18px;
        font-weight: normal;
        margin-right: 8px;
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
        width: 110px; /* label width */
        font-weight: bold;
        vertical-align: middle;
      }
      .bar-track {
        display: inline-block;
        position: relative;
        height: 24px;
        width: 300px; /* total bar width */
        background-color: #eee;
        vertical-align: middle;
        margin-left: 8px;
        border-radius: 4px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        background-color: #4287f5;
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
  
    // 3) Map for expanding each MBTI letter (e.g., 'I' => 'ntroversion')
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
  
    // 4) Fetch the MBTI data from data/raw/mbti_means.json
    fetch('data/raw/mbti_means.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load mbti_means.json: ' + response.statusText);
        }
        return response.json();
      })
      .then(mbtiData => {
        // Sort the MBTI keys if you like
        const mbtiTypes = Object.keys(mbtiData).sort();
  
        // Build a tab for each MBTI type
        mbtiTypes.forEach(type => {
          const tab = document.createElement('div');
          tab.className = 'mbti-tab';
          tab.textContent = type;
          tab.addEventListener('click', () => displayMBTI(type, mbtiData));
          tabsContainer.appendChild(tab);
        });
  
        // Show the first MBTI type by default
        if (mbtiTypes.length > 0) {
          displayMBTI(mbtiTypes[0], mbtiData);
        }
      })
      .catch(error => {
        console.error('Error loading MBTI data:', error);
      });
  
    // 5) Function that renders a chosen MBTI's data into the two columns
    function displayMBTI(type, mbtiData) {
      // Clear previous content
      leftColumn.innerHTML = '';
      rightColumn.innerHTML = '';
  
      // Build stylized MBTI title
      let titleHtml = '<div class="mbti-title">';
      for (let i = 0; i < type.length; i++) {
        const letter = type[i];
        const word = expansions[letter] || '';
        titleHtml += `
          <span class="mbti-letter">${letter}</span>
          <span class="mbti-word">${word}</span>
        `;
      }
      titleHtml += '</div>';
  
      // A placeholder for a playlist
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
  
      // Helper to clamp values to [0..100]
      function clampPercent(value) {
        return Math.min(Math.max(value, 0), 100);
      }
  
      // Build a single bar
      function makeBar(label, value, minVal, maxVal) {
        const widthPercent = clampPercent(((value - minVal) / (maxVal - minVal)) * 100);
        const displayVal = value.toFixed(2);
  
        return `
          <div class="bar-row">
            <span class="bar-label">${label}</span>
            <div class="bar-track">
              <div class="bar-fill" style="width:${widthPercent}%;">
                <span class="bar-value">${displayVal}</span>
              </div>
            </div>
          </div>
        `;
      }
  
      // Combine bars for the four stats
      let barChartHtml = '<div class="bar-chart">';
      barChartHtml += makeBar('Tempo', stats.tempo_mean, 0, tempoMax);
      barChartHtml += makeBar('Energy', stats.energy_mean, 0, energyMax);
      barChartHtml += makeBar('Loudness', stats.loudness_mean, loudnessMin, loudnessMax);
      barChartHtml += makeBar('Acoustic', stats.acousticness_mean, 0, acousticMax);
      barChartHtml += '</div>';
  
      // Insert the final HTML into the left column
      leftColumn.innerHTML = titleHtml + playlistHtml + barChartHtml;
  
      // Right column: placeholder image for the MBTI type
      const placeholderDiv = document.createElement('div');
      placeholderDiv.className = 'mbti-image-placeholder';
      placeholderDiv.textContent = `Image for ${type}`;
      rightColumn.appendChild(placeholderDiv);
    }
  })();
  