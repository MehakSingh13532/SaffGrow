/**
 * SaffGrow - Smart Saffron Farming Dashboard
 * Integrated Frontend Logic
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Profile Dropdown
    initProfile();

    // 2. Initialize Real-Time Clock
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);

    // 3. Initialize Control Sliders
    initSliders();

    // 4. Start Live Data Sync (ML & Sensors)
    // Runs immediately on load, then every 5 seconds
    syncDashboard();
    setInterval(syncDashboard, 5000);

    // 5. Initialize Charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
});

/**
 * CORE: Sync Dashboard with Backend API
 * Fetches JSON data from Node.js server (updated by ML Bridge)
 */
async function syncDashboard() {
    try {
        const response = await fetch('http://localhost:5000/api/chamber-data');
        if (!response.ok) throw new Error('Backend Offline');
        const data = await response.json();

        // Update Environment Metrics
        updateMetricDisplay('Temperature', data.environmental_data.temperature);
        updateMetricDisplay('Humidity', data.environmental_data.humidity);
        updateMetricDisplay('Soil Moisture', data.environmental_data.soil_moisture);
        updateMetricDisplay('CO2 Level', data.environmental_data.co2_level);

        // Update ML-Generated Yield Projection
        const yieldDiv = document.querySelector('.yield-estimate');
        if (yieldDiv) yieldDiv.textContent = data.plant_growth_data.estimated_yield;

        // Update System Logs from API
        const logsList = document.getElementById('logs-list');
        if (logsList && data.system_logs) {
            logsList.innerHTML = data.system_logs.map(log => `
                <div class="log-entry">
                    <span class="log-message info">${log}</span>
                </div>
            `).join('');
        }

        // Update Live Alerts
        const alertsContainer = document.getElementById('alerts-container');
        if (alertsContainer && data.alerts_notifications) {
            alertsContainer.innerHTML = data.alerts_notifications.map(alert => `
                <div class="alert-item ${alert.type}" style="border-left: 4px solid ${alert.type === 'warning' ? '#e74c3c' : '#2ecc71'};">
                    <strong>${alert.type.toUpperCase()}:</strong> ${alert.message}
                </div>
            `).join('');
        }

    } catch (err) {
        console.warn("Dashboard sync failed. Running on existing UI data.", err);
    }
}

/**
 * Update individual environment cards
 */
function updateMetricDisplay(titleText, meta) {
    const cards = document.querySelectorAll('.env-card');
    cards.forEach(card => {
        const title = card.querySelector('h3');
        if (title && title.textContent.includes(titleText)) {
            // Update value and unit
            card.querySelector('.env-value').textContent = `${meta.current}${meta.unit}`;
            
            // Update status badge
            const badge = card.querySelector('.status-badge');
            if (badge) {
                badge.textContent = meta.status;
                badge.className = `status-badge ${meta.status.toLowerCase().replace(' ', '-')}`;
            }

            // Update Progress Bar
            const bar = card.querySelector('.progress-fill');
            if (bar) {
                const percentage = (meta.current / meta.max) * 100;
                bar.style.width = `${Math.min(percentage, 100)}%`;
            }
        }
    });
}

/**
 * Profile Dropdown Logic
 */
function initProfile() {
    const profileToggle = document.getElementById('profileToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (profileToggle && dropdownMenu) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });

        const userEmail = localStorage.getItem('currentUserEmail') || '';
        const userName = localStorage.getItem('currentUserName') || 'User';
        const userInitial = document.getElementById('userInitial');
        
        if (userInitial) {
            userInitial.textContent = (userName !== 'User' ? userName : userEmail).charAt(0).toUpperCase() || 'U';
        }
    }
}

/**
 * Real-time clock for Indian Standard Time
 */
function updateCurrentTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = new Date().toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}

/**
 * Hardware Control Logic
 */
function initSliders() {
    const lightSlider = document.getElementById('light-intensity');
    const lightValue = document.getElementById('light-intensity-value');
    if (lightSlider) {
        lightSlider.addEventListener('input', () => lightValue.textContent = lightSlider.value + '%');
    }

    const fanSlider = document.getElementById('fan-speed');
    const fanValue = document.getElementById('fan-speed-value');
    if (fanSlider) {
        fanSlider.addEventListener('input', () => fanValue.textContent = fanSlider.value + '%');
    }
}

function handleLogout() {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('dashboardLogout', 'true');
    window.location.href = '/';
}

/**
 * Dashboard Action Buttons
 */
function toggleLighting() { alert('Toggling LED Hardware spectrum...'); }
function triggerWatering() { alert('Irrigation system activated via backend signal.'); }
function toggleVentilation() { alert('Ventilation mode toggled.'); }
function adjustClimate() { alert('Climate adjustment panel opening...'); }

/**
 * Chart.js Initialization
 */
function initializeCharts() {
    // Performance Chart
    const perfCtx = document.getElementById('performance-chart');
    if (perfCtx) {
        new Chart(perfCtx, {
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
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Cost Breakdown Chart
    const costCtx = document.getElementById('setup-costs-chart');
    if (costCtx) {
        new Chart(costCtx, {
            type: 'doughnut',
            data: {
                labels: ['Chamber', 'Lights', 'Sensors', 'Automation', 'Medium'],
                datasets: [{
                    data: [4500, 2200, 1200, 1000, 800],
                    backgroundColor: ['#facc15', '#8e44ad', '#3498db', '#2ecc71', '#e74c3c']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}