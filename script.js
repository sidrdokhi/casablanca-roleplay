// ===== GLOBAL VARIABLES & UTILITIES =====

// Admin credentials (in a real application, this would be handled server-side)
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "CasaBlancaAdmin2023"
};

// Whitelist applications storage
let whitelistApplications = JSON.parse(localStorage.getItem('whitelistApplications')) || [];

// Current admin session
let adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

// ===== DOM READY FUNCTION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Initialize character counters on whitelist page
    initCharacterCounters();
    
    // Initialize admin panel if on admin page
    if (document.querySelector('.admin-panel-page')) {
        // Check if admin is logged in
        if (!adminLoggedIn) {
            window.location.href = 'admin-login.html';
            return;
        }
        
        initAdminPanel();
    }
    
    // Initialize admin login page
    if (document.querySelector('.admin-login-page')) {
        initAdminLogin();
    }
    
    // Initialize whitelist form
    if (document.getElementById('whitelistForm')) {
        initWhitelistForm();
    }
});

// ===== UTILITY FUNCTIONS =====

// Toggle mobile menu
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Show modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Copy server IP to clipboard
function copyIP() {
    const ip = 'mtasa://play.casablancarp.com';
    navigator.clipboard.writeText(ip).then(() => {
        // Show success message
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#27ae60';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }
    });
}

// Show serial help modal
function showSerialHelp() {
    showModal('serialHelpModal');
}

// Generate a unique ID for applications
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save applications to localStorage
function saveApplications() {
    localStorage.setItem('whitelistApplications', JSON.stringify(whitelistApplications));
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===== WHITELIST FORM FUNCTIONS =====

// Initialize character counters
function initCharacterCounters() {
    const bgTextarea = document.getElementById('rpBackground');
    const rpTextarea = document.getElementById('whatIsRP');
    const hrpTextarea = document.getElementById('whatIsHRP');
    
    if (bgTextarea) {
        const bgCharCount = document.getElementById('bgCharCount');
        bgTextarea.addEventListener('input', function() {
            bgCharCount.textContent = this.value.length;
            
            // Update color based on length
            if (this.value.length < 150) {
                bgCharCount.style.color = '#e74c3c';
            } else {
                bgCharCount.style.color = '#2ecc71';
            }
        });
        
        // Trigger initial count
        bgTextarea.dispatchEvent(new Event('input'));
    }
    
    if (rpTextarea) {
        const rpCharCount = document.getElementById('rpCharCount');
        rpTextarea.addEventListener('input', function() {
            rpCharCount.textContent = this.value.length;
            
            // Update color based on length
            if (this.value.length < 50) {
                rpCharCount.style.color = '#e74c3c';
            } else {
                rpCharCount.style.color = '#2ecc71';
            }
        });
        
        // Trigger initial count
        rpTextarea.dispatchEvent(new Event('input'));
    }
    
    if (hrpTextarea) {
        const hrpCharCount = document.getElementById('hrpCharCount');
        hrpTextarea.addEventListener('input', function() {
            hrpCharCount.textContent = this.value.length;
            
            // Update color based on length
            if (this.value.length < 50) {
                hrpCharCount.style.color = '#e74c3c';
            } else {
                hrpCharCount.style.color = '#2ecc71';
            }
        });
        
        // Trigger initial count
        hrpTextarea.dispatchEvent(new Event('input'));
    }
}

// Initialize whitelist form
function initWhitelistForm() {
    const form = document.getElementById('whitelistForm');
    const statusDiv = document.getElementById('applicationStatus');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateWhitelistForm()) {
            return;
        }
        
        // Get form values
        const application = {
            id: generateId(),
            rpFirstName: document.getElementById('rpFirstName').value.trim(),
            rpLastName: document.getElementById('rpLastName').value.trim(),
            rpAge: document.getElementById('rpAge').value,
            hrpAge: document.getElementById('hrpAge').value,
            rpBackground: document.getElementById('rpBackground').value.trim(),
            whatIsRP: document.getElementById('whatIsRP').value.trim(),
            whatIsHRP: document.getElementById('whatIsHRP').value.trim(),
            mtaSerial: document.getElementById('mtaSerial').value.trim(),
            discordUsername: document.getElementById('discordUsername').value.trim(),
            agreeRules: document.getElementById('agreeRules').checked,
            agreePrivacy: document.getElementById('agreePrivacy').checked,
            status: 'pending', // pending, accepted, rejected
            submittedAt: new Date().toISOString()
        };
        
        // Add to applications
        whitelistApplications.unshift(application); // Add to beginning
        saveApplications();
        
        // Show success message
        showStatusMessage('success', 'Your application has been submitted successfully! It will be reviewed by our admin team within 24-48 hours.');
        
        // Reset form
        form.reset();
        
        // Reset character counters
        initCharacterCounters();
        
        // Scroll to status message
        statusDiv.scrollIntoView({ behavior: 'smooth' });
    });
}

// Validate whitelist form
function validateWhitelistForm() {
    let isValid = true;
    const form = document.getElementById('whitelistForm');
    const statusDiv = document.getElementById('applicationStatus');
    
    // Clear previous status
    statusDiv.className = 'application-status';
    statusDiv.style.display = 'none';
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    for (const field of requiredFields) {
        if (!field.value.trim()) {
            showStatusMessage('error', `Please fill in all required fields. ${field.previousElementSibling?.textContent || ''} is required.`);
            isValid = false;
            field.focus();
            break;
        }
    }
    
    // Check RP background length
    const rpBackground = document.getElementById('rpBackground');
    if (rpBackground && rpBackground.value.trim().length < 150) {
        showStatusMessage('error', 'RP Background must be at least 150 characters long.');
        isValid = false;
        rpBackground.focus();
    }
    
    // Check RP explanation length
    const whatIsRP = document.getElementById('whatIsRP');
    if (whatIsRP && whatIsRP.value.trim().length < 50) {
        showStatusMessage('error', 'RP explanation must be at least 50 characters long.');
        isValid = false;
        whatIsRP.focus();
    }
    
    // Check HRP explanation length
    const whatIsHRP = document.getElementById('whatIsHRP');
    if (whatIsHRP && whatIsHRP.value.trim().length < 50) {
        showStatusMessage('error', 'HRP explanation must be at least 50 characters long.');
        isValid = false;
        whatIsHRP.focus();
    }
    
    // Check RP age (18-80)
    const rpAge = document.getElementById('rpAge');
    if (rpAge) {
        const age = parseInt(rpAge.value);
        if (age < 18 || age > 80) {
            showStatusMessage('error', 'RP Age must be between 18 and 80.');
            isValid = false;
            rpAge.focus();
        }
    }
    
    // Check HRP age (13+)
    const hrpAge = document.getElementById('hrpAge');
    if (hrpAge) {
        const age = parseInt(hrpAge.value);
        if (age < 13) {
            showStatusMessage('error', 'You must be at least 13 years old to apply.');
            isValid = false;
            hrpAge.focus();
        }
    }
    
    // Check MTA serial format (basic validation)
    const mtaSerial = document.getElementById('mtaSerial');
    if (mtaSerial && mtaSerial.value.trim().length < 10) {
        showStatusMessage('error', 'Please enter a valid MTA Serial (at least 10 characters).');
        isValid = false;
        mtaSerial.focus();
    }
    
    // Check Discord username format
    const discordUsername = document.getElementById('discordUsername');
    if (discordUsername && !discordUsername.value.includes('#')) {
        showStatusMessage('error', 'Please enter your full Discord username including the discriminator (e.g., username#1234).');
        isValid = false;
        discordUsername.focus();
    }
    
    return isValid;
}

// Show status message
function showStatusMessage(type, message) {
    const statusDiv = document.getElementById('applicationStatus');
    if (!statusDiv) return;
    
    statusDiv.className = `application-status ${type}`;
    statusDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <h4>${type === 'success' ? 'Success!' : 'Error!'}</h4>
        <p>${message}</p>
    `;
    statusDiv.style.display = 'block';
}

// ===== ADMIN LOGIN FUNCTIONS =====

// Initialize admin login
function initAdminLogin() {
    const loginForm = document.getElementById('adminLoginForm');
    const showPasswordBtn = document.getElementById('showPasswordBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                // Successful login
                adminLoggedIn = true;
                localStorage.setItem('adminLoggedIn', 'true');
                
                // Show success message
                const loginStatus = document.getElementById('loginStatus');
                loginStatus.className = 'login-status success';
                loginStatus.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <p>Login successful! Redirecting to admin panel...</p>
                `;
                loginStatus.style.display = 'block';
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = 'admin-panel.html';
                }, 1500);
            } else {
                // Failed login
                const loginStatus = document.getElementById('loginStatus');
                loginStatus.className = 'login-status error';
                loginStatus.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Invalid username or password. Please try again.</p>
                `;
                loginStatus.style.display = 'block';
                
                // Clear password field
                document.getElementById('adminPassword').value = '';
            }
        });
    }
    
    // Toggle password visibility
    if (showPasswordBtn) {
        showPasswordBtn.addEventListener('click', function() {
            const passwordInput = document.getElementById('adminPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
}

// ===== ADMIN PANEL FUNCTIONS =====

// Initialize admin panel
function initAdminPanel() {
    // Load applications
    loadApplications();
    
    // Setup event listeners
    setupAdminEventListeners();
    
    // Update stats
    updateAdminStats();
}

// Load applications into the panel
function loadApplications(filter = 'all') {
    const applicationsList = document.getElementById('applicationsList');
    const emptyState = document.getElementById('emptyState');
    
    if (!applicationsList) return;
    
    // Clear current list
    applicationsList.innerHTML = '';
    
    // Filter applications
    let filteredApps = whitelistApplications;
    if (filter === 'pending') {
        filteredApps = whitelistApplications.filter(app => app.status === 'pending');
    } else if (filter === 'accepted') {
        filteredApps = whitelistApplications.filter(app => app.status === 'accepted');
    } else if (filter === 'rejected') {
        filteredApps = whitelistApplications.filter(app => app.status === 'rejected');
    }
    
    // Show empty state if no applications
    if (filteredApps.length === 0) {
        emptyState.style.display = 'block';
        applicationsList.appendChild(emptyState);
        return;
    } else {
        emptyState.style.display = 'none';
    }
    
    // Add applications to list
    filteredApps.forEach(application => {
        const appCard = createApplicationCard(application);
        applicationsList.appendChild(appCard);
    });
    
    // Setup search functionality
    const searchInput = document.getElementById('searchApplications');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const allCards = applicationsList.querySelectorAll('.application-card');
            
            allCards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Create an application card element
function createApplicationCard(application) {
    const card = document.createElement('div');
    card.className = `application-card ${application.status}`;
    card.dataset.id = application.id;
    
    // Status badge
    let statusBadge = '';
    if (application.status === 'pending') {
        statusBadge = '<span class="app-status status-pending">Pending</span>';
    } else if (application.status === 'accepted') {
        statusBadge = '<span class="app-status status-accepted">Accepted</span>';
    } else if (application.status === 'rejected') {
        statusBadge = '<span class="app-status status-rejected">Rejected</span>';
    }
    
    // Truncate long text
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    
    card.innerHTML = `
        <div class="app-header">
            <div class="app-name">${application.rpFirstName} ${application.rpLastName}</div>
            <div>${statusBadge}</div>
        </div>
        <div class="app-details">
            <div class="app-detail">
                <span class="detail-label">RP Age / HRP Age</span>
                <span class="detail-value">${application.rpAge} / ${application.hrpAge}</span>
            </div>
            <div class="app-detail">
                <span class="detail-label">MTA Serial</span>
                <span class="detail-value">${truncateText(application.mtaSerial, 15)}</span>
            </div>
            <div class="app-detail">
                <span class="detail-label">Discord</span>
                <span class="detail-value">${application.discordUsername}</span>
            </div>
            <div class="app-detail">
                <span class="detail-label">Submitted</span>
                <span class="detail-value">${formatDate(application.submittedAt)}</span>
            </div>
        </div>
        <div class="app-actions">
            <button class="view-details-btn" onclick="viewApplicationDetails('${application.id}')">
                <i class="fas fa-eye"></i> View Details
            </button>
            ${application.status === 'pending' ? `
                <button class="btn-success btn-small" onclick="acceptApplication('${application.id}')">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="btn-danger btn-small" onclick="rejectApplication('${application.id}')">
                    <i class="fas fa-times"></i> Reject
                </button>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Setup admin panel event listeners
function setupAdminEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadApplications();
            updateAdminStats();
        });
    }
    
    // Filter buttons
    const filterPending = document.getElementById('filterPending');
    if (filterPending) {
        filterPending.addEventListener('click', function() {
            loadApplications('pending');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            adminLoggedIn = false;
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'admin-login.html';
        });
    }
    
    // Accept/Reject buttons in modal
    const modalAcceptBtn = document.getElementById('modalAcceptBtn');
    const modalRejectBtn = document.getElementById('modalRejectBtn');
    
    if (modalAcceptBtn) {
        modalAcceptBtn.addEventListener('click', function() {
            const appId = this.dataset.id;
            acceptApplication(appId);
            closeModal('applicationModal');
        });
    }
    
    if (modalRejectBtn) {
        modalRejectBtn.addEventListener('click', function() {
            const appId = this.dataset.id;
            rejectApplication(appId);
            closeModal('applicationModal');
        });
    }
}

// Update admin statistics
function updateAdminStats() {
    const pendingCount = whitelistApplications.filter(app => app.status === 'pending').length;
    const acceptedCount = whitelistApplications.filter(app => app.status === 'accepted').length;
    const rejectedCount = whitelistApplications.filter(app => app.status === 'rejected').length;
    const totalCount = whitelistApplications.length;
    
    const pendingEl = document.getElementById('pendingCount');
    const acceptedEl = document.getElementById('acceptedCount');
    const rejectedEl = document.getElementById('rejectedCount');
    const totalEl = document.getElementById('totalCount');
    
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (acceptedEl) acceptedEl.textContent = acceptedCount;
    if (rejectedEl) rejectedEl.textContent = rejectedCount;
    if (totalEl) totalEl.textContent = totalCount;
}

// View application details
function viewApplicationDetails(appId) {
    const application = whitelistApplications.find(app => app.id === appId);
    if (!application) return;
    
    const modalDetails = document.getElementById('applicationDetails');
    if (!modalDetails) return;
    
    // Format date
    const submittedDate = formatDate(application.submittedAt);
    
    // Status display
    let statusDisplay = '';
    if (application.status === 'pending') {
        statusDisplay = '<span class="status-pending">Pending Review</span>';
    } else if (application.status === 'accepted') {
        statusDisplay = '<span class="status-accepted">Accepted</span>';
    } else if (application.status === 'rejected') {
        statusDisplay = '<span class="status-rejected">Rejected</span>';
    }
    
    modalDetails.innerHTML = `
        <div class="detail-view">
            <div class="detail-header">
                <h4>Application Details</h4>
                <div>${statusDisplay}</div>
            </div>
            
            <div class="detail-section">
                <h5><i class="fas fa-user"></i> Character Information</h5>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Full Name:</strong> ${application.rpFirstName} ${application.rpLastName}
                    </div>
                    <div class="detail-item">
                        <strong>RP Age / HRP Age:</strong> ${application.rpAge} / ${application.hrpAge}
                    </div>
                </div>
                
                <h6>RP Background / Story</h6>
                <div class="detail-content">${application.rpBackground.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="detail-section">
                <h5><i class="fas fa-question-circle"></i> RolePlay Knowledge</h5>
                
                <h6>What is RolePlay (RP)?</h6>
                <div class="detail-content">${application.whatIsRP.replace(/\n/g, '<br>')}</div>
                
                <h6>What is Heavy RolePlay (HRP)?</h6>
                <div class="detail-content">${application.whatIsHRP.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div class="detail-section">
                <h5><i class="fas fa-id-card"></i> Account Information</h5>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>MTA Serial:</strong> ${application.mtaSerial}
                    </div>
                    <div class="detail-item">
                        <strong>Discord Username:</strong> ${application.discordUsername}
                    </div>
                    <div class="detail-item">
                        <strong>Submitted:</strong> ${submittedDate}
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h5><i class="fas fa-scroll"></i> Agreements</h5>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Accepted Server Rules:</strong> ${application.agreeRules ? 'Yes' : 'No'}
                    </div>
                    <div class="detail-item">
                        <strong>Accepted Privacy Policy:</strong> ${application.agreePrivacy ? 'Yes' : 'No'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set button data attributes
    const modalAcceptBtn = document.getElementById('modalAcceptBtn');
    const modalRejectBtn = document.getElementById('modalRejectBtn');
    
    if (modalAcceptBtn) modalAcceptBtn.dataset.id = appId;
    if (modalRejectBtn) modalRejectBtn.dataset.id = appId;
    
    // Show modal
    showModal('applicationModal');
}

// Accept an application
function acceptApplication(appId) {
    const application = whitelistApplications.find(app => app.id === appId);
    if (!application) return;
    
    application.status = 'accepted';
    saveApplications();
    
    // Reload applications and update stats
    loadApplications();
    updateAdminStats();
}

// Reject an application
function rejectApplication(appId) {
    const application = whitelistApplications.find(app => app.id === appId);
    if (!application) return;
    
    application.status = 'rejected';
    saveApplications();
    
    // Reload applications and update stats
    loadApplications();
    updateAdminStats();

}// Check Discord username format - REMOVED VALIDATION
// Accept any format since Discord changed their username system
const discordUsername = document.getElementById('discordUsername');
if (discordUsername && discordUsername.value.trim().length < 2) {
    showStatusMessage('error', 'Please enter your Discord username.');
    isValid = false;
    discordUsername.focus();
}
// Validate whitelist form
function validateWhitelistForm() {
    let isValid = true;
    const form = document.getElementById('whitelistForm');
    const statusDiv = document.getElementById('applicationStatus');
    
    // Clear previous status
    statusDiv.className = 'application-status';
    statusDiv.style.display = 'none';
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    for (const field of requiredFields) {
        if (!field.value.trim()) {
            showStatusMessage('error', `Please fill in all required fields. ${field.previousElementSibling?.textContent || ''} is required.`);
            isValid = false;
            field.focus();
            break;
        }
    }
    
    // Check RP background length
    const rpBackground = document.getElementById('rpBackground');
    if (rpBackground && rpBackground.value.trim().length < 150) {
        showStatusMessage('error', 'RP Background must be at least 150 characters long.');
        isValid = false;
        rpBackground.focus();
    }
    
    // Check RP explanation length
    const whatIsRP = document.getElementById('whatIsRP');
    if (whatIsRP && whatIsRP.value.trim().length < 50) {
        showStatusMessage('error', 'RP explanation must be at least 50 characters long.');
        isValid = false;
        whatIsRP.focus();
    }
    
    // Check HRP explanation length
    const whatIsHRP = document.getElementById('whatIsHRP');
    if (whatIsHRP && whatIsHRP.value.trim().length < 50) {
        showStatusMessage('error', 'HRP explanation must be at least 50 characters long.');
        isValid = false;
        whatIsHRP.focus();
    }
    
    // Check RP age (18-80)
    const rpAge = document.getElementById('rpAge');
    if (rpAge) {
        const age = parseInt(rpAge.value);
        if (age < 18 || age > 80) {
            showStatusMessage('error', 'RP Age must be between 18 and 80.');
            isValid = false;
            rpAge.focus();
        }
    }
    
    // Check HRP age (13+)
    const hrpAge = document.getElementById('hrpAge');
    if (hrpAge) {
        const age = parseInt(hrpAge.value);
        if (age < 13) {
            showStatusMessage('error', 'You must be at least 13 years old to apply.');
            isValid = false;
            hrpAge.focus();
        }
    }
    
    // Check MTA serial format (basic validation)
    const mtaSerial = document.getElementById('mtaSerial');
    if (mtaSerial && mtaSerial.value.trim().length < 10) {
        showStatusMessage('error', 'Please enter a valid MTA Serial (at least 10 characters).');
        isValid = false;
        mtaSerial.focus();
    }
    
    // Check Discord username (updated - no discriminator required)
    const discordUsername = document.getElementById('discordUsername');
    if (discordUsername) {
        const discordValue = discordUsername.value.trim();
        
        // Simple validation for Discord username (without discriminator)
        if (discordValue.length < 2) {
            showStatusMessage('error', 'Discord username must be at least 2 characters long.');
            isValid = false;
            discordUsername.focus();
        }
        // Optional: Add more specific validation if needed
        // else if (!/^[a-zA-Z0-9_.]+$/.test(discordValue)) {
        //     showStatusMessage('error', 'Discord username can only contain letters, numbers, underscores, and periods.');
        //     isValid = false;
        //     discordUsername.focus();
        // }
    }
    
    return isValid;
}