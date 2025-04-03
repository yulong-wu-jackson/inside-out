// music_energy.js
// Visualization for music energy
(function() {
  console.log("music_energy.js script loaded");

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
      color: #ffffff;
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
      padding: 5px;
      box-sizing: border-box;
      text-align: center;
    }
    #music-energy-right-column {
      width: 40%;
      padding: 5px;
      box-sizing: border-box;
      text-align: center;
    }

    /* --- Title area: letters and expansions side by side --- */
    .mbti-title {
      margin-bottom: 20px;
      text-align: center;
    }
    .mbti-letter-block {
      display: inline-block;
      vertical-align: middle;
      margin-right: 30px;
    }

    /* --- Chart styles (horizontal bars) --- */
    .bar-chart {
      margin: 20px auto 0;
      width: fit-content;
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

    /* --- Container for the Spotify embed --- */
    .spotify-embed-container {
      margin: 10px auto 0;
      width: 100%;
      max-width: 650px;
      text-align: center;
    }
  `;
  console.log("Injecting styles...");
  const styleEl = document.createElement('style');
  styleEl.textContent = styleContent;
  document.head.appendChild(styleEl);
  console.log("Styles injected.");

  // 2) Create the necessary elements inside #music-energy-analysis
  const analysisContainer = document.getElementById('music-energy-analysis');
  if (!analysisContainer) {
    console.warn('Could not find #music-energy-analysis element. Aborting MBTI script.');
    return;
  }
  console.log("#music-energy-analysis element found.");

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

  // 4) Define MBTI groups and color palettes
  const groupNF = ["INFJ", "INFP", "ENFJ", "ENFP"];
  const groupSP = ["ISTP", "ISFP", "ESTP", "ESFP"];
  const groupNT = ["INTJ", "INTP", "ENTJ", "ENTP"];
  const groupSJ = ["ISTJ", "ISFJ", "ESTJ", "ESFJ"];

  // Darkest/high saturation (left) to lightest (right)
  const nfColors = ["#1e8449", "#229954", "#27ae60", "#2ecc71"];
  const spColors = ["#f39c12", "#f4d03f", "#f1c40f", "#f7dc6f"];
  const ntColors = ["#8e44ad", "#9b59b6", "#af7ac5", "#bb8fce"];
  const sjColors = ["#2980b9", "#3498db", "#5dade2", "#85c1e9"];

  // 5) Fetch the MBTI data and playlist data concurrently
  Promise.all([
    fetch('data/raw/mbti_means.json').then(response => response.json()),
    fetch('data/playlist.json').then(response => response.json())
  ])
  .then(([mbtiData, playlistData]) => {
    console.log("MBTI Data:", mbtiData);
    console.log("Playlist Data:", playlistData);

    // Build a mapping of MBTI type to color using group arrays
    const typeColors = {};
    groupNF.forEach((type, i) => { if (mbtiData[type]) typeColors[type] = nfColors[i]; });
    groupSP.forEach((type, i) => { if (mbtiData[type]) typeColors[type] = spColors[i]; });
    groupNT.forEach((type, i) => { if (mbtiData[type]) typeColors[type] = ntColors[i]; });
    groupSJ.forEach((type, i) => { if (mbtiData[type]) typeColors[type] = sjColors[i]; });

    // Order MBTI types in the desired groups
    const groupOrder = [...groupNF, ...groupSP, ...groupNT, ...groupSJ];
    const mbtiTypes = groupOrder.filter(type => mbtiData[type]);

    // Create a tab for each MBTI type
    mbtiTypes.forEach(type => {
      const tab = document.createElement('div');
      tab.className = 'mbti-tab';
      tab.textContent = type;
      tab.style.backgroundColor = typeColors[type] || '#999';

      tab.addEventListener('click', () => {
        contentContainer.style.borderTop = `4px solid ${typeColors[type]}`;
        displayMBTI(type, mbtiData, playlistData, typeColors[type]);
      });
      tabsContainer.appendChild(tab);
    });

    // Display the first MBTI type by default
    if (mbtiTypes.length > 0) {
      const defaultType = mbtiTypes[0];
      contentContainer.style.borderTop = `4px solid ${typeColors[defaultType]}`;
      displayMBTI(defaultType, mbtiData, playlistData, typeColors[defaultType]);
    }
  })
  .catch(error => console.error('Error loading data:', error));

  // 6) Renders a chosen MBTI's data into the two columns
  // The Spotify embed will be added under the bar chart in the left column.
  function displayMBTI(type, mbtiData, playlistData, color) {
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    // Build the MBTI title
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

    // Extract stats for the bar chart
    const stats = mbtiData[type];
    const tempoMax = 200;
    const energyMax = 1;
    const loudnessMin = -20;
    const loudnessMax = 0;
    const acousticMax = 1;

    function clampPercent(value) {
      return Math.min(Math.max(value, 0), 100);
    }

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

    // Build the bar chart HTML
    let barChartHtml = '<div class="bar-chart">';
    barChartHtml += makeBar('Tempo', stats.tempo_mean, 0, tempoMax);
    barChartHtml += makeBar('Energy', stats.energy_mean, 0, energyMax);
    barChartHtml += makeBar('Loudness', stats.loudness_mean, loudnessMin, loudnessMax);
    barChartHtml += makeBar('Acoustic', stats.acousticness_mean, 0, acousticMax);
    barChartHtml += '</div>';

    // Insert title and bar chart into the left column
    leftColumn.innerHTML = titleHtml + barChartHtml;

    // Append the Spotify embed below the bar chart in the left column.
    let spotifyUrl = playlistData[type] || "";
    if (spotifyUrl) {
      spotifyUrl = spotifyUrl.replace("playlist", "embed/playlist");
    }
    const embedContainer = document.createElement('div');
    embedContainer.className = 'spotify-embed-container';

    // Create the iframe for the Spotify embed
    const iframe = document.createElement('iframe');
    iframe.src = spotifyUrl;
    // Set the iframe width to 80% (shorter than the container's full width)
    iframe.style.width = '80%';
    iframe.style.height = '80px';
    iframe.style.border = 'none';
    iframe.allow = 'encrypted-media';
    iframe.allowTransparency = 'true';
    embedContainer.appendChild(iframe);
    leftColumn.appendChild(embedContainer);

    // Right column: create an image element for the MBTI type (unchanged)
    const imgEl = document.createElement('img');
    imgEl.src = `/assets/svgs/MBTI/${type}.png`;
    imgEl.alt = `Image for ${type}`;
    imgEl.style.width = '80%';
    imgEl.style.height = '250px';
    imgEl.style.objectFit = 'contain';
    imgEl.style.borderRadius = '8px';
    rightColumn.appendChild(imgEl);
  }
})();
