// who_coomments_most.js - Visualization for who MBTI comments // who_comments_most.js - Visualization for which MBTI types comment most

/**
 * Initialize the "Who Comments Most" visualization
 */
function initWhoCommentsMostChart() {
    console.log("Initializing Who Comments Most visualization...");
    
    // Get the section element and loading indicator
    const parentSection = document.getElementById('who-comments-most');
    if (!parentSection) {
      console.error("Who Comments Most section not found");
      return;
    }
    
    // Get the card element
    const parentCard = parentSection.querySelector('.mbti-card');
    if (!parentCard) {
      console.error("MBTI card not found");
      return;
    }
    
    // Loading indicator
    const loadingElement = parentSection.querySelector('.loading');
    if (loadingElement) {
      console.log("Found loading indicator");
    }
    
    console.log("Found section elements:", { parentSection, parentCard });
    
    // Check if processed data exists
    checkProcessedDataExists()
      .then(exists => {
        console.log("Data check result:", exists);
        if (exists) {
          // Use processed data
          return fetch('data/processedJson/postCount.json')
            .then(response => response.json());
        } else {
          // Process raw data
          console.log("No processed data found, processing raw data...");
          return processRawData();
        }
      })
      .then(data => {
        // Create visualization
        console.log("Data loaded successfully, creating visualization with", data.length, "items");
        createGroupChatVisualization(data, parentCard);
      })
      .catch(error => {
        console.error("Error loading comment data:", error);
        parentCard.innerHTML = `
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
  
  // Variables to store data for bar chart visualization when flipping
  let barChartData = [];
  let isFlipped = false;
  
  /**
   * Create the Instagram-style group chat visualization
   * @param {Array} data Array of objects with type and count properties
   * @param {HTMLElement} parentCard Element for the visualization
   */
  function createGroupChatVisualization(data, parentCard) {
    console.log("Creating group chat visualization");
    
    // Store data for bar chart
    barChartData = [...data];
    
    // Remove loading and existing content
    parentCard.innerHTML = '';
    
    // Create flip container structure
    parentCard.className = 'flip-container';
    parentCard.innerHTML = `
      <div class="flipper">
        <div class="front mbti-chat-interface"></div>
        <div class="back bar-chart-container">
          <div class="bar-chart-header">
            <h3>Comment Distribution by MBTI Type</h3>
            <button class="flip-back-button"><i class="fas fa-arrow-left"></i> Back to Chat</button>
          </div>
          <div class="horizontal-bar-chart"></div>
        </div>
      </div>
    `;
    
    const chatInterface = parentCard.querySelector('.mbti-chat-interface');
    
    // Sort data by count (descending)
    data.sort((a, b) => b.count - a.count);
    
    // Avatar data for MBTI types 
    const mbtiAvatars = {
      'INTJ': '🧠', 'INTP': '🔬', 'ENTJ': '👑', 'ENTP': '💡',  // Analysts
      'INFJ': '🦋', 'INFP': '🌈', 'ENFJ': '🤝', 'ENFP': '✨',  // Diplomats
      'ISTJ': '📊', 'ISFJ': '🏠', 'ESTJ': '📝', 'ESFJ': '🎁',  // Sentinels
      'ISTP': '🔧', 'ISFP': '🎨', 'ESTP': '🏄', 'ESFP': '🎭'   // Explorers
    };
    
    // MBTI color scheme
    const mbtiColors = {
      'INTJ': '#4A6BDC', 'INTP': '#5A7BEC', 'ENTJ': '#3A5BCC', 'ENTP': '#6A8BFC',  // Analysts
      'INFJ': '#9C56DC', 'INFP': '#AC66EC', 'ENFJ': '#8C46CC', 'ENFP': '#BC76FC',  // Diplomats
      'ISTJ': '#3F9E4D', 'ISFJ': '#4FAE5D', 'ESTJ': '#2F8E3D', 'ESFJ': '#5FBE6D',  // Sentinels
      'ISTP': '#E6A117', 'ISFP': '#F6B127', 'ESTP': '#D69107', 'ESFP': '#FFB837'   // Explorers
    };
    
    console.log("Building chat structure...");
    // Create the chat container structure (Instagram-style)
    const chatStructure = `
      <div class="mbti-chat-header">
        <div class="mbti-chat-header-left">
          <div class="mbti-group-icon">
            <span>MBTI</span>
          </div>
          <div class="mbti-chat-info">
            <div class="mbti-chat-title">MBTI Group Chat</div>
            <div class="mbti-chat-subtitle">16 members • Active now</div>
          </div>
        </div>
        <div class="mbti-chat-header-right">
          <div class="mbti-chat-actions">
            <button class="flip-stats-button" title="View comment statistics">
              <i class="fas fa-chart-bar"></i> Statistics
            </button>
          </div>
        </div>
      </div>
      <div class="mbti-chat-messages"></div>
      <div class="mbti-chat-footer">
        <div class="mbti-chat-input-wrapper">
          <div class="mbti-chat-input-icon">
            <i class="far fa-smile"></i>
          </div>
          <div class="mbti-chat-input">Message...</div>
        </div>
      </div>
    `;
    
    // Add the structure to the card
    chatInterface.innerHTML = chatStructure;
    
    // Get messages container
    const chatMessages = chatInterface.querySelector('.mbti-chat-messages');
    console.log("Chat messages container:", chatMessages);
    
    // Get the parent section for ScrollTrigger
    const parentSection = document.getElementById('who-comments-most');
    
    // Create a simplified conversation scenario about final exam study
    // Only one scenario with messages focused on key MBTI traits
    const conversationScenario = [
      {
        type: 'ENTJ',
        message: "I've created a study schedule for our final exam next week. Everyone should follow it to maximize efficiency.",
        replies: []
      },
      {
        type: 'INTP',
        message: "That's an interesting approach, but I've been researching alternative study methods. The traditional approach isn't optimal for conceptual understanding.",
        replies: []
      },
      {
        type: 'INTJ',
        message: "I've already developed a strategic study plan based on predicted exam questions. Focus on high-value topics to maximize results with minimal effort.",
        replies: []
      },
      {
        type: 'ENFP',
        message: "Guys, I was thinking we could form study groups! It'll be fun AND productive! Who's in? 🎉",
        replies: []
      },
      {
        type: 'ISTJ',
        message: "I prefer studying alone. Group sessions tend to get off-topic. I've already color-coded all my notes and created a structured review plan.",
        replies: []
      },
      {
        type: 'ISFJ',
        message: "I've prepared study snacks for everyone. Let me know if you need any help with your notes - I've organized mine by lecture date and can share them.",
        replies: []
      },
      {
        type: 'INFP',
        message: "I'm feeling so anxious about this exam. Does anyone else feel like this is going to determine our entire future?",
        replies: []
      },
      {
        type: 'ENFJ',
        message: "I understand how you feel, INFP. Let's support each other through this! I can help you with the topics you're struggling with.",
        replies: []
      },
      {
        type: 'ENTP',
        message: "Why are we even stressing about this exam? I could debate the professor into giving us all A's. But I did come up with 17 creative ways to remember the formulas.",
        replies: []
      },
      {
        type: 'ESFJ',
        message: "I've organized a pre-exam breakfast for everyone! We need to support each other and make sure everyone's feeling good before the test.",
        replies: []
      },
      {
        type: 'ESTP',
        message: "Just finished a 3-hour bike ride. Now I'll cram everything tonight. Works every time!",
        replies: []
      },
      {
        type: 'ISTP',
        message: "I've taken apart and rebuilt my desk lamp three times today. Guess I should start studying soon.",
        replies: []
      },
      {
        type: 'ISFP',
        message: "I made a beautiful mind map of all the course concepts. It might not cover everything, but it feels right to me and helps me connect the ideas.",
        replies: []
      },
      {
        type: 'INFJ',
        message: "I sense a lot of stress in the group. Remember that one exam doesn't define you. Your worth isn't measured by your grades.",
        replies: []
      },
      {
        type: 'ESFP',
        message: "Anyone want to take a study break and grab coffee? We could do flash cards at the café. Learning should be fun!",
        replies: []
      },
      {
        type: 'ESTJ',
        message: "Everyone should be following the study plan I sent last month. It's irresponsible to wait until the last minute.",
        replies: []
      }
    ];
    
    // Find the max count to scale message frequency
    const maxCount = Math.max(...data.map(d => d.count));
    
    // Function to generate message text length based on comment count
    function generateMessageByCount(type, baseMessage) {
      const typeData = data.find(d => d.type === type);
      if (!typeData) return baseMessage;
      
      // Scale factor based on count
      const factor = typeData.count / maxCount;
      
      // Adjust message length based on count
      if (factor < 0.2) {
        // Very short message for low counts
        return baseMessage.split('.')[0] + '.';
      } else if (factor >= 0.8) {
        // Very long message for high counts - repeat portions and add details
        const extraDetails = [
          "I've been thinking about this a lot.",
          "This is really important for all of us to consider.",
          "Let me elaborate on this point further.",
          "I've spent considerable time analyzing this."
        ];
        
        // Add 1-3 extra sentences based on count
        const extraCount = Math.floor(factor * 3);
        let extendedMessage = baseMessage;
        
        for (let i = 0; i < extraCount; i++) {
          extendedMessage += " " + extraDetails[i % extraDetails.length];
        }
        return extendedMessage;
      } else if (factor >= 0.5) {
        // Medium length message - add some detail
        const mediumDetails = [
          "I think this is the best approach.",
          "Let me know what you think about this."
        ];
        return baseMessage + " " + mediumDetails[Math.floor(Math.random() * mediumDetails.length)];
      }
      
      // Default - return original message
      return baseMessage;
    }
    
    // Clean and prepare all messages with adjusted text length
    let allMessages = [];
    conversationScenario.forEach(convo => {
      // Adjust message text length based on comment count
      const adjustedMessage = generateMessageByCount(convo.type, convo.message);
      
      // Add main message
      allMessages.push({
        type: convo.type,
        message: adjustedMessage,
        isReply: false
      });
    });
    
    // Create a function to generate time stamps
    function generateTimeStamp(index) {
      const hour = 10 + Math.floor(index / 4);
      const minute = (index * 7) % 60;
      return `${hour}:${minute < 10 ? '0' + minute : minute}`;
    }
    
    // Create a function to render a chat message with GSAP animation
    function renderMessage(message, index) {
      const messageElement = document.createElement('div');
      messageElement.className = `mbti-message ${message.isReply ? 'mbti-message-reply' : ''}`;
      
      // Calculate message scaling based on count
      const typeData = data.find(d => d.type === message.type);
      const count = typeData ? typeData.count : 0;
      
      // Create message HTML
      messageElement.innerHTML = `
        <div class="mbti-message-avatar" style="background-color: ${mbtiColors[message.type]}">
          <span>${mbtiAvatars[message.type]}</span>
        </div>
        <div class="mbti-message-content">
          <div class="mbti-message-name">${message.type}</div>
          <div class="mbti-message-bubble" style="border-left: 3px solid ${mbtiColors[message.type]}">
            ${message.message}
            <div class="mbti-message-info">
              <span class="mbti-message-time">${generateTimeStamp(index)}</span>
              ${typeData ? `<span class="mbti-message-count">${typeData.count} posts</span>` : ''}
            </div>
          </div>
        </div>
      `;
      
      // Set initial state for animation
      messageElement.style.opacity = 0;
      messageElement.style.transform = 'translateY(20px)';
      
      // Add to chat container
      chatMessages.appendChild(messageElement);
      
      return messageElement;
    }
    
    // Initialize the horizontal bar chart
    function initBarChart() {
      const chartContainer = parentCard.querySelector('.horizontal-bar-chart');
      if (!chartContainer) return;
      
      // Sort data by count (descending)
      const sortedData = [...barChartData].sort((a, b) => b.count - a.count);
    
    // Create SVG element
      const margin = { top: 20, right: 30, bottom: 40, left: 80 };
      const width = chartContainer.clientWidth - margin.left - margin.right;
      const height = chartContainer.clientHeight - margin.top - margin.bottom;
      
      // Clear previous chart if any
      chartContainer.innerHTML = '';
      
      const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
      const x = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.count) * 1.1])
        .range([0, width]);
      
      const y = d3.scaleBand()
        .domain(sortedData.map(d => d.type))
        .range([0, height])
        .padding(0.3);
      
      // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px');
    
      // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(y))
      .selectAll('text')
        .style('font-size', '12px')
        .style('font-weight', 'bold');
    
      // Add X axis label
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
        .attr('y', height + margin.bottom - 5)
        .text('Number of Comments')
        .style('font-size', '14px');
      
      // Function to determine bar color based on MBTI type
      function getBarColor(type) {
        return mbtiColors[type] || '#ccc';
      }
      
      // Add bars with animation
    svg.selectAll('.bar')
        .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
        .attr('y', d => y(d.type))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
      .attr('fill', d => getBarColor(d.type))
        .attr('rx', 4)
        .attr('ry', 4)
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
        .attr('width', d => x(d.count));
    
      // Add labels on bars
    svg.selectAll('.label')
        .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'label')
        .attr('y', d => y(d.type) + y.bandwidth() / 2 + 5)
        .attr('x', d => x(d.count) + 5)
        .text(d => d.count)
      .style('font-size', '12px')
        .style('opacity', 0)
      .transition()
      .duration(800)
        .delay((d, i) => i * 50 + 300)
      .style('opacity', 1);
    }
    
    // Set up flip functionality
    function setupFlipFunctionality() {
      const infoButton = chatInterface.querySelector('.flip-stats-button');
      const flipBackButton = parentCard.querySelector('.flip-back-button');
      
      if (infoButton) {
        infoButton.addEventListener('click', function() {
          parentCard.classList.add('flipped');
          isFlipped = true;
          
          // Initialize bar chart when flipping to back
          setTimeout(() => {
            initBarChart();
          }, 400); // Wait for flip animation to complete
        });
      }
      
      if (flipBackButton) {
        flipBackButton.addEventListener('click', function() {
          parentCard.classList.remove('flipped');
          isFlipped = false;
        });
      }
    }
    
    // Add scroll-triggered animation for messages
    function animateMessagesOnScroll() {
      // Create IntersectionObserver to detect when section is in view
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          // Section is in view, start animation sequence
          console.log("Chat section in view, starting animation");
          
          // Start with a "group created" message
          const groupCreatedElement = document.createElement('div');
          groupCreatedElement.className = 'mbti-system-message';
          groupCreatedElement.innerHTML = `
            <div class="mbti-system-bubble">
              <span class="mbti-system-text">MBTI Group created by ENTJ</span>
              <span class="mbti-system-time">Today</span>
            </div>
          `;
          groupCreatedElement.style.opacity = 0;
          chatMessages.appendChild(groupCreatedElement);
          
          // Fade in the group created message
          setTimeout(() => {
            groupCreatedElement.style.transition = 'opacity 0.5s ease';
            groupCreatedElement.style.opacity = 1;
          }, 500);
          
          // Start the message sequence
          setTimeout(() => {
            // Process messages one by one
            let currentIndex = 0;
            
            function animateNextMessage() {
              if (currentIndex < allMessages.length) {
                const message = allMessages[currentIndex];
                
                // Calculate delays based on index (speed up after a few messages)
                const isEarlyMessage = currentIndex < 4;
                const typingDelay = isEarlyMessage ? 1200 : 600;
                const nextMessageDelay = isEarlyMessage ? 800 : 400;
                
                // Show typing indicator for the current message sender
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'mbti-typing-indicator';
                typingIndicator.innerHTML = `
                  <div class="mbti-message-avatar" style="background-color: ${mbtiColors[message.type]}">
                    <span>${mbtiAvatars[message.type]}</span>
                  </div>
                  <div class="mbti-typing-bubble">
                    <div class="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                `;
                typingIndicator.style.opacity = 0;
                chatMessages.appendChild(typingIndicator);
                
                // Fade in typing indicator
                setTimeout(() => {
                  typingIndicator.style.transition = 'opacity 0.3s ease';
                  typingIndicator.style.opacity = 1;
                  chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 100);
                
                // After typing delay, hide indicator and show message
                setTimeout(() => {
                  // Fade out typing indicator
                  typingIndicator.style.opacity = 0;
                  
                  setTimeout(() => {
                    // Remove typing indicator
                    if (typingIndicator.parentNode) {
                      chatMessages.removeChild(typingIndicator);
                    }
                    
                    // Create and render message
                    const element = renderMessage(message, currentIndex);
                    
                    // Animate message appearance
                    setTimeout(() => {
                      element.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                      element.style.opacity = 1;
                      element.style.transform = 'translateY(0)';
                      
                      // Scroll to show new message
                      chatMessages.scrollTop = chatMessages.scrollHeight;
                      
                      // Move to next message
                      currentIndex++;
                      setTimeout(animateNextMessage, nextMessageDelay);
                    }, 50);
                  }, 300);
                }, typingDelay);
              }
              // Remove the final typing indicator - we don't add one at the end anymore
            }
            
            // Start the message animation sequence
            animateNextMessage();
          }, 1500);
          
          // Stop observing once animation has started
          observer.disconnect();
        }
      }, {
        threshold: 0.5 // Trigger when 50% of element is visible
      });
      
      // Start observing
      observer.observe(parentSection);
    }
    
    // Setup flip functionality
    setupFlipFunctionality();
    
    // Start message animation
    animateMessagesOnScroll();
    
    // Handle window resize events
    window.addEventListener('resize', debounce(() => {
      if (isFlipped) {
        initBarChart();
      }
    }, 250));
  }
  
  /**
   * Debounce function to limit frequency of function calls
   * @param {Function} func The function to debounce
   * @param {number} wait Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
  
  // Export the initialization function
  window.initWhoCommentsMostChart = initWhoCommentsMostChart;
  
  // Initialize immediately when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhoCommentsMostChart);
  } else {
    // DOM already loaded, initialize now
    initWhoCommentsMostChart();
  }