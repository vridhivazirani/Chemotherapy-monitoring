// --- Data Definitions ---
const BASE_URL = 'http://127.0.0.1:5000/api';
let currentUser = null;

let doctorData = {
    stats: [],
    alerts: [
        { title: 'Sepsis Risk: Patient ID-8821', desc: 'Temp spike (101.2°F) detected 2h ago. Check WBC.', type: 'danger' },
        { title: 'Lab Review: Patient ID-9012', desc: 'Hgb levels below threshold. Transfusion may be needed.', type: 'warning' }
    ],
    nav: [
        { label: 'Clinic Overview', icon: 'layout-dashboard', active: true },
        { label: 'Patient Cohorts', icon: 'users' },
        { label: 'Toxicity Tracker', icon: 'clipboard-list' },
        { label: 'Treatment Plans', icon: 'flask-conical' },
        { label: 'Research Data', icon: 'database' }
    ]
};

let patientData = {
    stats: [],
    alerts: [
        { title: 'Hydration Reminder', desc: 'Drink at least 500ml of water in the next hour.', type: 'primary' },
        { title: 'Medication Due', desc: 'Anti-emetic due in 15 minutes.', type: 'warning' }
    ],
    medications: [],
    nav: [
        { label: 'My Health', icon: 'layout-dashboard', active: true },
        { label: 'AI Assistant', icon: 'sparkles' },
        { label: 'Connect Device', icon: 'bluetooth' },
        { label: 'Medications', icon: 'pill' },
        { label: 'Daily Symptom Log', icon: 'edit-3' },
        { label: 'Doctor Chat', icon: 'message-square' }
    ]
};

// --- Page Templates ---

let connectedDevice = null;
let aiChatHistory = [
    { role: 'ai', text: 'Hello! I am your AI Health Assistant. How can I help you manage your symptoms or treatment today?' }
];

const pageTemplates = {
    // ... existing doctor pages ...
    'Patient Cohorts': () => `
        <div class="glass-table-container">
            <h3>Active Patient Cohort</h3>
            <table class="glass-table">
                <thead>
                    <tr>
                        <th>Patient ID</th>
                        <th>Name</th>
                        <th>Diagnosis</th>
                        <th>Cycle</th>
                        <th>Toxicity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>ID-8821</td><td>John Doe</td><td>Stage III NSCLC</td><td>3 / 6</td><td><span class="status-badge" style="background: rgba(255, 184, 0, 0.1); color: var(--warning)">G2</span></td><td><button class="take-btn" onclick="openReviewModal(2, 'John Doe')">Review</button></td></tr>
                    <tr><td>ID-9012</td><td>Jane Smith</td><td>Stage II Breast</td><td>1 / 4</td><td><span class="status-badge status-active">G1</span></td><td><button class="take-btn" onclick="alert('Demo patient. Only John Doe is connected to DB.')">Review</button></td></tr>
                    <tr><td>ID-8543</td><td>Robert Brown</td><td>Stage IV Colon</td><td>5 / 8</td><td><span class="status-badge" style="background: rgba(255, 77, 77, 0.1); color: var(--danger)">G3</span></td><td><button class="take-btn" onclick="alert('Demo patient. Only John Doe is connected to DB.')">Review</button></td></tr>
                </tbody>
            </table>
        </div>
    `,
    'Toxicity Tracker': () => `
        <div class="charts-grid">
            <div class="glass-table-container" style="grid-column: span 2">
                <h3>Global Toxicity Distribution</h3>
                <div style="height: 300px; margin: 2rem 0">
                    <canvas id="toxicityDistChart"></canvas>
                </div>
            </div>
        </div>
    `,
    'Treatment Plans': () => `
        <div class="stats-grid">
            <div class="stat-card"><h4>AC-T Protocol</h4><p>Dexamethasone + Ondansetron</p></div>
            <div class="stat-card"><h4>FOLFOX</h4><p>5-FU + Oxaliplatin</p></div>
            <div class="stat-card"><h4>Pembrolizumab</h4><p>Immunotherapy Checkpoint</p></div>
        </div>
    `,
    'Research Data': () => `
        <div class="glass-table-container">
            <h3>Clinical Correlation Graphs</h3>
            <p style="color: var(--text-muted); margin-bottom: 2rem">Aggregate survival curves and toxicity correlations (Mock Data)</p>
            <div style="height: 300px; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: 20px; display: flex; align-items: center; justify-content: center">
                <i data-lucide="bar-chart-3" style="width: 48px; height: 48px; opacity: 0.2"></i>
            </div>
        </div>
    `,

    // Patient Pages
    'My Health': null,
    'Clinic Overview': null,

    'AI Assistant': () => `
        <div class="chat-wrapper" style="border-color: var(--primary-glow)">
            <div class="chat-header-ai" style="padding: 1rem 1.5rem; background: rgba(0, 217, 255, 0.05); border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; gap: 12px">
                <div class="ai-avatar-glow"><i data-lucide="bot"></i></div>
                <div>
                    <h4 style="color: var(--primary)">OncoAI Assistant</h4>
                    <p style="font-size: 0.75rem; color: var(--text-muted)">Secure AI Healthcare Support</p>
                </div>
            </div>
            <div class="chat-messages" id="aiMessages">
                ${aiChatHistory.map(msg => `
                    <div class="chat-bubble ${msg.role === 'ai' ? 'doctor ai-bubble' : 'patient'}">
                        ${msg.text}
                    </div>
                `).join('')}
                <div id="aiTyping" class="chat-bubble doctor ai-bubble hidden" style="width: 60px">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="aiInput" class="chat-input" placeholder="Ask about symptoms, side effects..." onkeypress="if(event.key === 'Enter') handleAISend()">
                <button class="take-btn" onclick="handleAISend()">
                    <i data-lucide="send" style="width: 16px; height: 16px"></i>
                </button>
            </div>
        </div>
    `,
    'Connect Device': () => `
        <div class="device-container">
            <div class="radar-wrapper">
                <div class="radar-scanner"></div>
                <div class="radar-center">
                    <i data-lucide="bluetooth" class="pulse"></i>
                </div>
            </div>
            
            <div class="device-list">
                <h3>Discovered Devices</h3>
                <div class="device-card ${connectedDevice === 'Apple Watch' ? 'status-connected' : ''}" onclick="connectDevice('Apple Watch')">
                    <div class="device-icon-wrapper"><i data-lucide="watch"></i></div>
                    <div>
                        <h4>Apple Watch Ultra</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted)">HealthKit Sync Available</p>
                    </div>
                    <div class="device-status">${connectedDevice === 'Apple Watch' ? 'Connected' : 'Tap to Pair'}</div>
                </div>
                <div class="device-card ${connectedDevice === 'Oura Ring' ? 'status-connected' : ''}" onclick="connectDevice('Oura Ring')">
                    <div class="device-icon-wrapper"><i data-lucide="fingerprint"></i></div>
                    <div>
                        <h4>Oura Ring Gen3</h4>
                        <p style="font-size: 0.8rem; color: var(--text-muted)">Vitals Monitoring Active</p>
                    </div>
                    <div class="device-status">${connectedDevice === 'Oura Ring' ? 'Connected' : 'Tap to Pair'}</div>
                </div>
            </div>
        </div>
    `,

    'Medications': () => `
        <div class="med-list">
            <h3>Daily Medications</h3>
            ${patientData.medications.map(med => `
                <div class="med-item" style="${med.taken ? 'opacity: 0.6; border-color: var(--secondary)' : ''}">
                    <div class="med-info">
                        <h4 style="display: flex; align-items: center; gap: 8px">
                            ${med.name} 
                            ${med.taken ? '<i data-lucide="check-circle-2" style="width: 16px; height: 16px; color: var(--secondary)"></i>' : ''}
                        </h4>
                        <p>${med.dose} - ${med.timing}</p>
                    </div>
                    <button class="take-btn" 
                        onclick="markMedicationTaken('${med.name}')" 
                        ${med.taken ? 'disabled style="border-color: var(--secondary); color: var(--secondary)"' : ''}>
                        ${med.taken ? 'Taken' : 'Mark Taken'}
                    </button>
                </div>
            `).join('')}
        </div>
    `,
    'Daily Symptom Log': () => `
        <div class="glass-table-container">
            <h3>Log Symptoms</h3>
            <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem">
                <div><label>Nausea (0-10)</label><input type="range" class="chat-input" style="width: 100%"></div>
                <div><label>Fatigue (0-10)</label><input type="range" class="chat-input" style="width: 100%"></div>
                <button class="take-btn" style="padding: 1rem">Save Daily Log</button>
            </div>
        </div>
    `,
    'Doctor Chat': () => `
        <div class="chat-wrapper">
            <div class="chat-messages">
                <div class="chat-bubble doctor">Hello John, I've reviewed your latest vitals. How are you feeling today?</div>
                <div class="chat-bubble patient">Feeling a bit tired today, but the nausea is much better than yesterday.</div>
                <div class="chat-bubble doctor">That's good to hear. Make sure to keep up with your hydration.</div>
            </div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" placeholder="Type your message...">
                <button class="take-btn">Send</button>
            </div>
        </div>
    `
};

let currentRoleState = null;

async function setRole(role) {
    currentRoleState = role;
    document.getElementById('authWrapper').classList.add('hidden');
    document.getElementById('dashboardWrapper').classList.remove('hidden');

    const doctorView = document.getElementById('doctorView');
    const patientView = document.getElementById('patientView');
    const overviewContent = document.getElementById('overviewContent');
    const subPageContent = document.getElementById('subPageContent');
    const greetingTitle = document.getElementById('greetingTitle');
    const subGreeting = document.getElementById('subGreeting');
    const navLinks = document.getElementById('navLinks');
    const profileSection = document.getElementById('profileSection');

    // Fetch dynamic stats
    try {
        const statsUrl = role === 'doctor' ? `${BASE_URL}/doctor/stats` : `${BASE_URL}/patient/stats/${currentUser.id}`;
        const response = await fetch(statsUrl);
        const statsData = await response.json();
        if (role === 'doctor') doctorData.stats = statsData;
        else patientData.stats = statsData;
    } catch (e) { console.error("Stats fetch failed", e); }

    // Fetch Clinical Review for Patient
    if (role === 'patient') {
        const clinicalReviewContainer = document.getElementById('clinicalReviewContainer');
        const clinicalReviewText = document.getElementById('clinicalReviewText');
        const reviewTimestamp = document.getElementById('reviewTimestamp');

        try {
            const response = await fetch(`${BASE_URL}/patient/review/${currentUser.id}`);
            const reviewData = await response.json();
            if (reviewData.review) {
                clinicalReviewContainer.classList.remove('hidden');
                clinicalReviewText.innerText = reviewData.review;
                reviewTimestamp.innerText = `Refreshed: ${new Date().toLocaleTimeString()}`;
            } else {
                clinicalReviewContainer.classList.add('hidden');
            }
        } catch (e) {
            console.error("Clinical review fetch failed", e);
            clinicalReviewContainer.classList.add('hidden');
        }
    }

    const data = role === 'doctor' ? doctorData : patientData;

    // Reset views
    overviewContent.classList.remove('hidden');
    subPageContent.classList.add('hidden');
    doctorView.classList.add('hidden');
    patientView.classList.add('hidden');

    if (role === 'doctor') {
        doctorView.classList.remove('hidden');
        greetingTitle.innerText = "Clinic Overview";
        subGreeting.innerText = "Dr. Sarah Mitchell | Oncology Dept";
        profileSection.innerHTML = `
            <div class="status-badge status-active">On Duty</div>
            <strong>Clinic Unit A</strong>
            <i data-lucide="user-plus"></i>
        `;
        initChart('doctorChart', 'doctor');
    } else {
        patientView.classList.remove('hidden');
        greetingTitle.innerText = "Personal Wellness";
        subGreeting.innerText = "Patient: John Doe (ID-8821)";
        profileSection.innerHTML = `
            <div class="status-badge status-active">Day 12: Cycle 3</div>
            <strong>Active Treatment</strong>
            <i data-lucide="user-circle"></i>
        `;
        if (connectedDevice) {
            profileSection.innerHTML += `<div class="status-badge" style="background: rgba(0, 245, 160, 0.1); color: var(--secondary); border: 1px solid var(--secondary-glow); margin-left: 8px"><i data-lucide="link" style="width: 12px; height: 12px; margin-right: 4px"></i> ${connectedDevice} Synced</div>`;
        }
        initChart('symptomChart', 'patient');
    }

    // Inject Navigation
    navLinks.innerHTML = data.nav.map(item => `
        <li id="nav-${item.label.replace(/\s+/g, '')}" class="nav-item ${item.active ? 'active' : ''}" onclick="switchPage('${item.label}')">
            <i data-lucide="${item.icon}"></i> ${item.label}
        </li>
    `).join('');

    // Re-inject stats for overview
    const statsGrid = role === 'doctor' ? document.getElementById('doctorStats') : document.getElementById('patientStats');
    statsGrid.innerHTML = data.stats.map(stat => `
        <div class="stat-card">
            <div class="stat-header">
                <span>${stat.label}</span>
                <i data-lucide="${stat.icon}" style="color: ${stat.color}"></i>
            </div>
            <div class="stat-value">${stat.value} <small>${stat.unit || ''}</small></div>
            <div style="color: ${stat.color === 'var(--danger)' ? 'var(--danger)' : 'var(--secondary)'}; font-size: 0.75rem; margin-top: 0.5rem">
                ${stat.detail}
            </div>
        </div>
    `).join('');

    // Re-inject alerts for overview
    const alertsContainer = role === 'doctor' ? document.getElementById('doctorAlerts') : document.getElementById('patientAlerts');
    const alertHtml = data.alerts.map(alert => `
        <div class="alert-item" style="border-left-color: var(--${alert.type})">
            <div style="font-weight: 600; color: var(--${alert.type})">${alert.title}</div>
            <p style="font-size: 0.85rem; margin-top: 5px">${alert.desc}</p>
        </div>
    `).join('');

    if (role === 'doctor') {
        const header = '<h3><i data-lucide="shield-alert"></i> Critical Patient Alerts</h3>';
        alertsContainer.innerHTML = header + alertHtml;
    } else {
        alertsContainer.innerHTML = alertHtml;
    }

    lucide.createIcons();
    setupNavListeners();
}

function handleAISend() {
    const input = document.getElementById('aiInput');
    const text = input.value.trim().toLowerCase();
    if (!text) return;

    // Add user message
    aiChatHistory.push({ role: 'user', text: input.value });
    input.value = '';
    renderAIChat();

    // Show typing
    const typing = document.getElementById('aiTyping');
    typing.classList.remove('hidden');

    // Simulated AI Response
    setTimeout(() => {
        typing.classList.add('hidden');
        let response = "I'm sorry, I'm not quite sure how to help with that. Could you please provide more details about how you're feeling? For urgent medical concerns, please contact your care team directly.";

        const keywords = {
            nausea: ["nausea", "sick", "vomit", "queasy", "stomach"],
            fatigue: ["fatigue", "tired", "weak", "exhausted", "fatique", "sleepy"],
            medication: ["medication", "pill", "medicine", "dose", "tablet", "scheduled"],
            hello: ["hello", "hi", "hey", "help", "assistant"],
            negative: ["no", "don't", "stop", "never", "not"]
        };

        if (keywords.nausea.some(kw => text.includes(kw))) {
            response = "For mild nausea, try small frequent meals and ginger tea. Your record shows you have Ondansetron prescribed—have you taken it today?";
        } else if (keywords.fatigue.some(kw => text.includes(kw))) {
            response = "Fatigue is common during Cycle 3. Ensure you're staying hydrated and getting plenty of rest. Would you like me to log your fatigue level in your symptom tracker?";
        } else if (keywords.medication.some(kw => text.includes(kw))) {
            response = "It's important to stick to your schedule. You have a few medications due today. Would you like to see your checklist?";
        } else if (keywords.hello.some(kw => text.includes(kw))) {
            response = "Hello! I'm here to help you manage your treatment. You can ask me about medication, symptoms like fatigue or nausea, or your daily schedule.";
        } else if (keywords.negative.some(kw => text.includes(kw))) {
            response = "Understood. I'll be here if you have any questions or when you're ready to update your health log.";
        }

        aiChatHistory.push({ role: 'ai', text: response });
        renderAIChat();
    }, 1500);
}

function renderAIChat() {
    const container = document.getElementById('aiMessages');
    if (!container) return;

    container.innerHTML = aiChatHistory.map(msg => `
        <div class="chat-bubble ${msg.role === 'ai' ? 'doctor ai-bubble' : 'patient'}">
            ${msg.text}
        </div>
    `).join('') + `
        <div id="aiTyping" class="chat-bubble doctor ai-bubble hidden" style="width: 60px">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    container.scrollTop = container.scrollHeight;
    lucide.createIcons();
}

async function markMedicationTaken(name) {
    try {
        await fetch(`${BASE_URL}/patient/meds/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser.id, name: name })
        });
        // Success: reload meds and re-render
        const response = await fetch(`${BASE_URL}/patient/meds/${currentUser.id}`);
        patientData.medications = await response.json();
        switchPage('Medications');
    } catch (e) {
        console.error("Mark med failed", e);
    }
}

function connectDevice(name) {
    connectedDevice = name;
    switchPage('Connect Device');

    // Auto-update overview when returning
    setTimeout(() => {
        const profile = document.getElementById('profileSection');
        if (connectedDevice && currentRoleState === 'patient') {
            // Check if badge already exists
            if (!profile.innerHTML.includes('Synced')) {
                profile.innerHTML += `<div class="status-badge" style="background: rgba(0, 245, 160, 0.1); color: var(--secondary); border: 1px solid var(--secondary-glow); margin-left: 8px"><i data-lucide="link" style="width: 12px; height: 12px; margin-right: 4px"></i> ${name} Synced</div>`;
                lucide.createIcons();
            }
        }
    }, 100);
}


async function switchPage(pageLabel) {
    const overviewContent = document.getElementById('overviewContent');
    const subPageContent = document.getElementById('subPageContent');

    // Fetch data if needed
    if (pageLabel === 'Medications' && currentUser) {
        try {
            const response = await fetch(`${BASE_URL}/patient/meds/${currentUser.id}`);
            patientData.medications = await response.json();
        } catch (e) { console.error("Meds fetch failed", e); }
    }

    const template = pageTemplates[pageLabel];

    // Highlight nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.innerText.trim() === pageLabel);
    });

    if (!template) {
        // Return to overview
        overviewContent.classList.remove('hidden');
        subPageContent.classList.add('hidden');
        // Re-init charts
        if (currentRoleState === 'doctor') initChart('doctorChart', 'doctor');
        else initChart('symptomChart', 'patient');
    } else {
        overviewContent.classList.add('hidden');
        subPageContent.classList.remove('hidden');
        subPageContent.innerHTML = template();

        // Handle specialized sub-page charts
        if (pageLabel === 'Toxicity Tracker') {
            initToxicityChart('toxicityDistChart');
        }
    }
    lucide.createIcons();
}

function initToxicityChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['G0 (None)', 'G1 (Mild)', 'G2 (Mod)', 'G3 (Sev)', 'G4 (Crit)'],
            datasets: [{
                label: 'Patients',
                data: [15, 20, 12, 5, 2],
                backgroundColor: 'rgba(0, 217, 255, 0.4)',
                borderColor: '#00d9ff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                x: { ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// --- Auth Logic ---

let selectedAuthRole = 'doctor';
let currentAuthMode = 'login'; // 'login' or 'register'

function setAuthRole(role) {
    selectedAuthRole = role;
    document.getElementById('doctorToggle').classList.toggle('active', role === 'doctor');
    document.getElementById('patientToggle').classList.toggle('active', role === 'patient');

    // Show/Hide Role Specific Fields
    if (currentAuthMode === 'register') {
        document.getElementById('doctorFields').classList.toggle('hidden', role !== 'doctor');
        document.getElementById('patientFields').classList.toggle('hidden', role !== 'patient');
    }

    // Update Placeholder text
    const loginEmail = document.getElementById('loginEmail');
    if (role === 'doctor') {
        loginEmail.placeholder = "name@hospital.com";
    } else {
        loginEmail.placeholder = "patient-id@onco.com";
    }
}

function toggleAuthMode() {
    currentAuthMode = currentAuthMode === 'login' ? 'register' : 'login';
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const toggleText = document.getElementById('toggleAuthText');

    if (currentAuthMode === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authTitle.innerText = "Create Account";
        authSubtitle.innerText = "Join the future of oncology care";
        toggleText.innerHTML = `Already have an account? <a href="#" onclick="toggleAuthMode()">Login</a>`;

        // Ensure role fields match selection
        document.getElementById('doctorFields').classList.toggle('hidden', selectedAuthRole !== 'doctor');
        document.getElementById('patientFields').classList.toggle('hidden', selectedAuthRole !== 'patient');
    } else {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authTitle.innerText = "Welcome Back";
        authSubtitle.innerText = "Please enter your details to login";
        toggleText.innerHTML = `Don't have an account? <a href="#" onclick="toggleAuthMode()">Register</a>`;
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPass').value;

    if (email && pass) {
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await response.json();
            if (data.success) {
                currentUser = data.user;
                setRole(currentUser.role);
            } else {
                alert(data.message || "Login failed");
            }
        } catch (e) {
            console.error("Login Error:", e);
            alert("Could not connect to server");
        }
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPass').value;
    const extra_info = selectedAuthRole === 'doctor' ?
        document.getElementById('regLicense').value :
        document.getElementById('regPatientId').value;

    if (name && email && pass) {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, email, password: pass,
                    role: selectedAuthRole,
                    extra_info
                })
            });
            const data = await response.json();
            if (data.success) {
                currentUser = data.user;
                setRole(currentUser.role);
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (e) {
            console.error("Registration Error:", e);
            alert("Could not connect to server");
        }
    }
}

function logout() {
    document.getElementById('dashboardWrapper').classList.add('hidden');
    document.getElementById('authWrapper').classList.remove('hidden');
    // Reset to login by default
    currentAuthMode = 'register'; // force toggle back to login
    toggleAuthMode();
}

function setupNavListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// --- Chart Configurations ---

let activeCharts = {};

function initChart(canvasId, type) {
    const el = document.getElementById(canvasId);
    if (!el) return;
    const ctx = el.getContext('2d');

    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
    }

    const blueGradient = ctx.createLinearGradient(0, 0, 0, 400);
    blueGradient.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
    blueGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');

    const emeraldGradient = ctx.createLinearGradient(0, 0, 0, 400);
    emeraldGradient.addColorStop(0, 'rgba(0, 245, 160, 0.4)');
    emeraldGradient.addColorStop(1, 'rgba(0, 245, 160, 0)');

    const datasets = type === 'patient' ? [
        { label: 'Nausea', data: [1, 2, 4, 3, 2, 4, 2], borderColor: '#00d9ff', backgroundColor: blueGradient, tension: 0.3, fill: true, pointRadius: 2 },
        { label: 'Fatigue', data: [2, 3, 5, 5, 4, 6, 5], borderColor: '#00f5a0', backgroundColor: emeraldGradient, tension: 0.3, fill: true, pointRadius: 2 }
    ] : [
        { label: 'Avg Toxicity', data: [1.1, 1.2, 1.4, 1.3, 1.2, 1.2, 1.1], borderColor: '#00d9ff', backgroundColor: blueGradient, tension: 0.3, fill: true, pointRadius: 2 },
        { label: 'Hospital Admissions', data: [4, 6, 3, 5, 2, 4, 3], borderColor: '#00f5a0', backgroundColor: emeraldGradient, tension: 0.3, fill: true, pointRadius: 2 }
    ];

    activeCharts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, usePointStyle: true } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// --- Modal Logic ---
let currentlyReviewingId = null;

async function openReviewModal(patientId, patientName) {
    currentlyReviewingId = patientId;
    document.getElementById('modalPatientInfo').innerText = `Patient: ${patientName} (ID-${patientId})`;
    document.getElementById('reviewTextArea').value = 'Loading...';
    document.getElementById('reviewModal').classList.remove('hidden');

    try {
        const response = await fetch(`${BASE_URL}/patient/review/${patientId}`);
        const data = await response.json();
        document.getElementById('reviewTextArea').value = data.review || '';
    } catch (e) {
        console.error("Fetch review failed", e);
        document.getElementById('reviewTextArea').value = '';
    }
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
    currentlyReviewingId = null;
}

async function saveClinicalReview() {
    const reviewText = document.getElementById('reviewTextArea').value;
    if (!currentlyReviewingId) return;

    try {
        const response = await fetch(`${BASE_URL}/patient/review/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentlyReviewingId,
                review: reviewText
            })
        });
        const data = await response.json();
        if (data.success) {
            alert("Clinical review updated successfully!");
            closeReviewModal();
        } else {
            alert("Failed to update review.");
        }
    } catch (e) {
        console.error("Save review failed", e);
        alert("Error connecting to server.");
    }
}


