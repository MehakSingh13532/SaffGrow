// Dashboard JavaScript Functions - SaffGrow Integration

// Profile dropdown toggle
document.addEventListener('DOMContentLoaded', function() {
    const profileToggle = document.getElementById('profileToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (profileToggle && dropdownMenu) {
        // Toggle dropdown on click
        profileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileToggle.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });

        // Update user initial from localStorage or default
        const userEmail = localStorage.getItem('currentUserEmail') || '';
        const userName = localStorage.getItem('currentUserName') || 'User';
        const userInitial = document.getElementById('userInitial');
        
        if (userInitial) {
            if (userName && userName !== 'User') {
                userInitial.textContent = userName.charAt(0).toUpperCase();
            } else if (userEmail) {
                userInitial.textContent = userEmail.charAt(0).toUpperCase();
            } else {
                userInitial.textContent = 'U';
            }
        }
    }

    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // Initialize charts if Chart.js is loaded
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    // --- NEW: START REAL-TIME DATA FETCHING ---
    // This starts the connection to your Python Controller
    setInterval(fetchRealData, 2000); // Check for updates every 2 seconds
    fetchRealData(); // Run once immediately on load
});

// --- NEW: REAL-TIME CONNECTIVITY FUNCTIONS ---

async function fetchRealData() {
    try {
        // Connect to the Python Server we built
        const response = await fetch('http://localhost:5000/status');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 1. Update Environmental Cards
        // We use specific selectors based on your card order
        updateCardValue(1, data.env_data.temp + '°C');      // Temperature
        updateCardValue(2, data.env_data.humidity + '%');   // Humidity
        updateCardValue(3, data.env_data.soil_ec + ' mS');  // Soil Moisture/EC (Using EC for precision)
        updateCardValue(4, data.env_data.light + ' µmol');  // Light Intensity
        
        // 2. Update System Logs with Real Messages from AI
        // Only add log if the status changes or it's a warning
        if (data.system_msg.includes("OPTIMIZING")) {
            addRealTimeLog(data.system_msg, 'warning');
        }

        // 3. Sync Actuator Status (Visual Feedback)
        // If Python says Chiller is ON, make the dashboard reflect it
        const fanStatus = document.querySelector('.control-card:nth-child(3) .status-indicator');
        if (fanStatus) {
            if (data.actuators.Fan === "HIGH") {
                fanStatus.textContent = "HIGH";
                fanStatus.classList.add('on');
                fanStatus.classList.remove('off');
            } else {
                fanStatus.textContent = "LOW";
                fanStatus.classList.remove('on');
            }
        }

    } catch (error) {
        console.warn("SaffGrow Connection Lost. Is controller.py running?", error);
        // Optional: Show a disconnected icon
    }
}

// Helper to safely update card values
function updateCardValue(cardNumber, value) {
    const card = document.querySelector(`.env-card:nth-child(${cardNumber}) .env-value`);
    if (card) {
        card.textContent = value;
    }
}

function addRealTimeLog(message, type = 'info') {
    const logsList = document.getElementById('logs-list');
    if (!logsList) return;

    // Don't duplicate the last message repeatedly
    const lastLog = logsList.firstChild;
    if (lastLog && lastLog.querySelector('.log-message').textContent === message) {
        return; 
    }

    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    // Get simple time string
    const timeStr = new Date().toLocaleTimeString();
    
    logEntry.innerHTML = `
        <span class="log-time">${timeStr}</span>
        <span class="log-message ${type}">${message}</span>
    `;
    
    // Insert at top
    logsList.insertBefore(logEntry, logsList.firstChild);
    
    // Keep list clean (max 10 items)
    if (logsList.children.length > 10) {
        logsList.removeChild(logsList.lastChild);
    }
}

// --- END NEW CONNECTIVITY FUNCTIONS ---

// Update current time display
function updateCurrentTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeElement.textContent = timeString;
    }
}

// Logout functionality
function handleLogout() {
    // Clear all localStorage items related to authentication
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('paid_') || 
            key === 'hasPaidSaffGrow' || 
            key === 'isAdmin' || 
            key === 'currentUserEmail' || 
            key === 'currentUserName') {
            localStorage.removeItem(key);
        }
    });

    // Clear session storage
    sessionStorage.clear();
    
    // Set flag to indicate logout from dashboard (for Clerk signout on landing page)
    localStorage.setItem('dashboardLogout', 'true');

    // Redirect to home page
    window.location.href = '/';
}

// Control functions
function toggleLighting() {
    const statusIndicator = document.querySelector('.control-card:nth-child(1) .status-indicator');
    if (statusIndicator) {
        if (statusIndicator.textContent === 'ON') {
            statusIndicator.textContent = 'OFF';
            statusIndicator.classList.remove('on');
            statusIndicator.classList.add('off');
            alert('LED Lighting turned OFF');
        } else {
            statusIndicator.textContent = 'ON';
            statusIndicator.classList.remove('off');
            statusIndicator.classList.add('on');
            alert('LED Lighting turned ON');
        }
    }
}

function triggerWatering() {
    alert('Watering triggered! The irrigation system is now active.');
    // In a real application, this would send a request to the backend
}

function toggleVentilation() {
    const statusIndicator = document.querySelector('.control-card:nth-child(3) .status-indicator');
    if (statusIndicator) {
        if (statusIndicator.textContent === 'AUTO') {
            statusIndicator.textContent = 'MANUAL';
            alert('Ventilation switched to MANUAL mode');
        } else {
            statusIndicator.textContent = 'AUTO';
            alert('Ventilation switched to AUTO mode');
        }
    }
}

function adjustClimate() {
    alert('Climate control adjustment panel would open here.');
    // In a real application, this would open a modal or send control commands
}

// Original refreshLogs modified to just clear list initially
function refreshLogs() {
    const logsList = document.getElementById('logs-list');
    if (logsList) {
        logsList.innerHTML = '';
        // We now wait for real data to populate this!
        addRealTimeLog("System connected to SaffGrow Brain", "success");
    }
}

// Initialize charts
function initializeCharts() {
    // Performance Chart
    const performanceCtx = document.getElementById('performance-chart');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                datasets: [{
                    label: 'Flowers Harvested',
                    data: [12, 19, 15, 23, 20, 23],
                    borderColor: '#facc15',
                    backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Setup Costs Chart
    const setupCostsCtx = document.getElementById('setup-costs-chart');
    if (setupCostsCtx) {
        new Chart(setupCostsCtx, {
            type: 'doughnut',
            data: {
                labels: ['LED Lights', 'Sensors', 'Irrigation', 'Climate Control', 'Others'],
                datasets: [{
                    data: [3000, 2500, 2000, 1500, 700],
                    backgroundColor: [
                        '#facc15',
                        '#8e44ad',
                        '#3498db',
                        '#2ecc71',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Light intensity slider
document.addEventListener('DOMContentLoaded', function() {
    const lightSlider = document.getElementById('light-intensity');
    const lightValue = document.getElementById('light-intensity-value');
    
    if (lightSlider && lightValue) {
        lightSlider.addEventListener('input', function() {
            lightValue.textContent = this.value + '%';
        });
    }

    // Fan speed slider
    const fanSlider = document.getElementById('fan-speed');
    const fanValue = document.getElementById('fan-speed-value');
    
    if (fanSlider && fanValue) {
        fanSlider.addEventListener('input', function() {
            fanValue.textContent = this.value + '%';
        });
    }
});