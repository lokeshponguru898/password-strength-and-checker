// PASSWORD STRENGTH CHECKER WEB APPLICATION

// ===== USER AUTHENTICATION =====
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.autoLogoutTime = 30; // minutes
        this.inactivityTimeout = null;
        this._activityListenerAdded = false;
        this._boundActivityHandler = this._resetAutoLogoutTimer.bind(this);
        this.loadUser();
        this.updateNavigation();
    }

    normalizeEmail(email) {
        return String(email || '').trim().toLowerCase();
    }

    register(firstName, lastName, age, email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const cleanFirstName = String(firstName || '').trim();
        const cleanLastName = String(lastName || '').trim();
        const cleanAge = parseInt(age);
        
        if (!normalizedEmail) {
            return { success: false, error: 'Please enter a valid email' };
        }
        if (!cleanFirstName || !cleanLastName) {
            return { success: false, error: 'Please enter first name and last name' };
        }
        if (!cleanAge || cleanAge < 16) {
            return { success: false, error: 'Age must be 16 years or older' };
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('psc_users') || '{}');
        if (users[normalizedEmail]) {
            return { success: false, error: 'Email already registered' };
        }

        // Store new user
        users[normalizedEmail] = {
            email: normalizedEmail,
            firstName: cleanFirstName,
            lastName: cleanLastName,
            age: cleanAge,
            password: btoa(password), // Basic encoding (not secure - for demo only)
            createdAt: new Date().toISOString(),
            passwordHistory: [],
            settings: {
                autoLogoutMinutes: 30,
                historyLimit: 50,
                notificationsEnabled: true
            }
        };

        localStorage.setItem('psc_users', JSON.stringify(users));
        return { success: true };
    }

    login(email, password) {
        const normalizedEmail = this.normalizeEmail(email);
        const users = JSON.parse(localStorage.getItem('psc_users') || '{}');
        let user = users[normalizedEmail];
        let userEmailKey = normalizedEmail;

        // Backward compatibility with previously saved email keys
        if (!user) {
            user = users[email?.trim()];
            userEmailKey = email?.trim();
        }
        if (!user) {
            userEmailKey = Object.keys(users).find(key => key.toLowerCase() === normalizedEmail);
            user = userEmailKey ? users[userEmailKey] : null;
        }

        if (!user || user.password !== btoa(password)) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Set current user session
        this.currentUser = {
            ...user,
            email: this.normalizeEmail(userEmailKey || user.email),
            storageKey: userEmailKey || normalizedEmail
        };
        localStorage.setItem('psc_currentUser', JSON.stringify(this.currentUser));
        this.setupAutoLogout();
        this.updateNavigation();
        return { success: true };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('psc_currentUser');
        clearTimeout(this.inactivityTimeout);
        this.updateNavigation();
    }

    setupAutoLogout() {
        clearTimeout(this.inactivityTimeout);
        if (!this.currentUser) return;

        const autoLogoutMs = (this.currentUser.settings?.autoLogoutMinutes || 30) * 60 * 1000;

        this.inactivityTimeout = setTimeout(() => {
            alert('You have been logged out due to inactivity');
            this.logout();
            window.location.href = 'index.html';
        }, autoLogoutMs);

        // Register activity listeners once to avoid exponential listener growth
        if (!this._activityListenerAdded) {
            document.addEventListener('click', this._boundActivityHandler);
            document.addEventListener('keypress', this._boundActivityHandler);
            this._activityListenerAdded = true;
        }
    }

    _resetAutoLogoutTimer() {
        if (!this.currentUser) return;
        this.setupAutoLogout();
    }

    loadUser() {
        const user = localStorage.getItem('psc_currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.setupAutoLogout();
        }
    }

    updateNavigation() {
        const authSection = document.querySelector('.auth-section');
        if (!authSection) return;

        if (this.currentUser) {
            const displayName = this.currentUser.firstName || this.currentUser.email;
            authSection.innerHTML = `
                <span class="user-info">Hello, ${displayName}</span>
                <a href="profile.html"><button class="btn-small">Profile</button></a>
                <a href="history.html"><button class="btn-small">History</button></a>
                <a href="settings.html"><button class="btn-small">Settings</button></a>
                <button class="btn-small btn-logout" onclick="auth.logout(); window.location.href='index.html';">Logout</button>
            `;
        } else {
            authSection.innerHTML = `
                <a href="login.html"><button class="btn-small">Login</button></a>
                <a href="signup.html"><button class="btn-small">Sign Up</button></a>
            `;
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// ===== PASSWORD HISTORY MANAGER =====
class PasswordHistoryManager {
    constructor() {
        this.auth = auth || window.auth;
    }

    addToHistory(password, strength, crackTime) {
        if (!this.auth.isLoggedIn()) return;

        const users = JSON.parse(localStorage.getItem('psc_users') || '{}');
        const storageKey = this.auth.currentUser.storageKey || this.auth.currentUser.email;
        const user = users[storageKey];

        if (!user) return;

        const historyItem = {
            password,
            strength,
            crackTime,
            timestamp: new Date().toISOString()
        };

        user.passwordHistory = user.passwordHistory || [];
        user.passwordHistory.unshift(historyItem);

        // Limit history size
        const limit = user.settings?.historyLimit || 50;
        user.passwordHistory = user.passwordHistory.slice(0, limit);

        users[storageKey] = user;
        localStorage.setItem('psc_users', JSON.stringify(users));
        this.auth.currentUser = { ...user, email: this.auth.currentUser.email, storageKey };
        localStorage.setItem('psc_currentUser', JSON.stringify(this.auth.currentUser));
    }

    getHistory() {
        if (!this.auth.isLoggedIn()) return [];
        return this.auth.currentUser.passwordHistory || [];
    }

    clearHistory() {
        if (!this.auth.isLoggedIn()) return;

        const users = JSON.parse(localStorage.getItem('psc_users') || '{}');
        const storageKey = this.auth.currentUser.storageKey || this.auth.currentUser.email;
        const user = users[storageKey];

        if (!user) return;

        user.passwordHistory = [];
        users[storageKey] = user;
        localStorage.setItem('psc_users', JSON.stringify(users));
        this.auth.currentUser = { ...user, email: this.auth.currentUser.email, storageKey };
        localStorage.setItem('psc_currentUser', JSON.stringify(this.auth.currentUser));
    }

    deleteItem(timestamp) {
        if (!this.auth.isLoggedIn()) return;

        const users = JSON.parse(localStorage.getItem('psc_users') || '{}');
        const storageKey = this.auth.currentUser.storageKey || this.auth.currentUser.email;
        const user = users[storageKey];

        if (!user) return;

        user.passwordHistory = (user.passwordHistory || []).filter(item => item.timestamp !== timestamp);
        users[storageKey] = user;
        localStorage.setItem('psc_users', JSON.stringify(users));
        this.auth.currentUser = { ...user, email: this.auth.currentUser.email, storageKey };
        localStorage.setItem('psc_currentUser', JSON.stringify(this.auth.currentUser));
    }
}

// ===== PASSWORD STRENGTH CHECKER =====
class PasswordStrengthChecker {
    constructor() {
        this.history = new PasswordHistoryManager();
    }

    calculateStrength(password) {
        if (!password) return { strength: 0, text: '', color: '', level: 'very-weak' };

        let strength = 0;
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        if (hasLength) strength++;
        if (hasUppercase) strength++;
        if (hasLowercase) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;

        const levels = {
            0: { text: 'Very Weak', level: 'very-weak' },
            1: { text: 'Very Weak', level: 'very-weak' },
            2: { text: 'Weak', level: 'weak' },
            3: { text: 'Medium', level: 'medium' },
            4: { text: 'Strong', level: 'strong' },
            5: { text: 'Very Strong', level: 'very-strong' }
        };

        return { strength, ...levels[strength] };
    }

    calculateCrackTime(password) {
        if (!password) return 'N/A';

        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;

        const combinations = Math.pow(charsetSize, password.length);
        const guessesPerSecond = 1000000000;
        const seconds = combinations / guessesPerSecond;

        if (seconds < 1) return 'Instantly';
        if (seconds < 60) return 'Seconds';
        if (seconds < 3600) return 'Minutes';
        if (seconds < 86400) return 'Hours';
        if (seconds < 2592000) return 'Days to Weeks';
        if (seconds < 31536000) return 'Months';
        if (seconds < 3153600000) return 'Years';
        return 'Centuries';
    }

    generatePassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}';
        const allChars = uppercase + lowercase + numbers + special;

        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        const length = Math.floor(Math.random() * 5) + 12;
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        password = password.split('').sort(() => Math.random() - 0.5).join('');
        return password;
    }
}

// Initialize global objects
let auth;
let passwordChecker;

document.addEventListener('DOMContentLoaded', () => {
    auth = new AuthManager();
    window.auth = auth;
    passwordChecker = new PasswordStrengthChecker();
    window.passwordChecker = passwordChecker;
});

// ===== PAGE INITIALIZATION =====
function initializePasswordCheckPage() {
    const passwordInput = document.getElementById('password');
    const strengthText = document.getElementById('strengthText');
    const crackTimeText = document.getElementById('crackTimeText');
    const togglePassword = document.getElementById('togglePassword');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const loginBtn = document.getElementById('loginBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keyup', () => {
            const password = passwordInput.value;
            const result = passwordChecker.calculateStrength(password);
            const crackTime = passwordChecker.calculateCrackTime(password);

            if (password.length === 0) {
                strengthText.textContent = '';
                crackTimeText.textContent = '';
                document.querySelectorAll('.strength-bar').forEach(bar => bar.classList.remove('active'));
                if (copyBtn) copyBtn.style.display = 'none';
            } else {
                strengthText.textContent = result.text;
                crackTimeText.textContent = `Time to crack: ${crackTime}`;

                // Update strength bars
                document.querySelectorAll('.strength-bar').forEach(bar => bar.classList.remove('active'));
                document.querySelector(`[data-level="${result.level}"]`)?.classList.add('active');
                
                if (copyBtn) copyBtn.style.display = 'flex';
            }
        });

        passwordInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;

            // Keep Enter from triggering implicit actions and save current password to user history.
            event.preventDefault();
            const password = passwordInput.value.trim();
            if (!password) return;

            const result = passwordChecker.calculateStrength(password);
            const crackTime = passwordChecker.calculateCrackTime(password);
            passwordChecker.history.addToHistory(password, result.text, crackTime);
            if (auth.isLoggedIn()) {
                alert('Password saved to history.');
            }
        });
    }

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.classList.toggle('show-password');
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const password = passwordChecker.generatePassword();
            passwordInput.value = password;
            passwordInput.type = 'text';
            togglePassword?.classList.add('show-password');

            // Trigger strength check
            const event = new Event('keyup', { bubbles: true });
            passwordInput.dispatchEvent(event);

            // Add to history if logged in
            const result = passwordChecker.calculateStrength(password);
            const crackTime = passwordChecker.calculateCrackTime(password);
            passwordChecker.history.addToHistory(password, result.text, crackTime);

            generateBtn.classList.add('spin');
            setTimeout(() => generateBtn.classList.remove('spin'), 600);
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const password = passwordInput.value;
            if (password) {
                navigator.clipboard.writeText(password).then(() => {
                    const result = passwordChecker.calculateStrength(password);
                    const crackTime = passwordChecker.calculateCrackTime(password);
                    passwordChecker.history.addToHistory(password, result.text, crackTime);
                    alert('Password copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        });
    }
}

function initializeLoginPage() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    setupPasswordToggle('loginPassword', 'toggleLoginPassword');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const result = auth.login(email, password);
        if (result.success) {
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert(result.error);
        }
    });
}

function initializeSignupPage() {
    const form = document.getElementById('signupForm');
    if (!form) return;
    setupPasswordToggle('signupPassword', 'toggleSignupPassword');
    setupPasswordToggle('signupPassword2', 'toggleSignupPassword2');

    // Age validation
    const ageInput = document.getElementById('signupAge');
    const ageError = document.getElementById('signupAgeError');
    
    if (ageInput) {
        ageInput.addEventListener('change', () => {
            const age = parseInt(ageInput.value);
            if (age < 16) {
                ageError.style.display = 'block';
                ageInput.style.borderColor = 'var(--very-weak)';
            } else {
                ageError.style.display = 'none';
                ageInput.style.borderColor = 'var(--border)';
            }
        });

        ageInput.addEventListener('input', () => {
            const age = parseInt(ageInput.value);
            if (age && age < 16) {
                ageError.style.display = 'block';
            } else {
                ageError.style.display = 'none';
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const age = parseInt(document.getElementById('signupAge').value);
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupPassword2').value;

        // Validate age
        if (!age || age < 16) {
            alert('⚠️ Age must be 16 years or older');
            if (ageError) ageError.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }

        const result = auth.register(firstName, lastName, age, email, password);
        if (result.success) {
            alert('Account created! Please login.');
            window.location.href = 'login.html';
        } else {
            alert(result.error);
        }
    });
}

function initializeHomePage() {
    const welcomeBoard = document.getElementById('welcomeBoard');
    if (!welcomeBoard) return;

    if (auth.isLoggedIn()) {
        const firstName = auth.currentUser.firstName || 'there';
        welcomeBoard.innerHTML = `
            <h2>Welcome, ${firstName}!</h2>
            <p>Strong passwords are your first defense. Run a quick check now and keep your accounts safe.</p>
        `;
        return;
    }

    welcomeBoard.innerHTML = `
        <h2>Welcome to Password Strength Checker</h2>
        <p>Build stronger habits today. Test your password strength and stay one step ahead of attackers.</p>
    `;
}

function setupPasswordToggle(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(buttonId);
    if (!passwordInput || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        toggleBtn.classList.toggle('show-password');
        toggleBtn.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
}

function initializeSettingsPage() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const autoLogoutInput = document.getElementById('autoLogoutMinutes');
    const historyLimitInput = document.getElementById('historyLimit');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const saveSettingsBtn = document.getElementById('saveSettings');

    if (autoLogoutInput) {
        autoLogoutInput.value = auth.currentUser.settings?.autoLogoutMinutes || 30;
    }

    if (historyLimitInput) {
        historyLimitInput.value = auth.currentUser.settings?.historyLimit || 50;
    }

    if (notificationsToggle) {
        const toggle = notificationsToggle.querySelector('.toggle-switch');
        if (auth.currentUser.settings?.notificationsEnabled) {
            toggle.classList.add('active');
        }

        notificationsToggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const newAutoLogout = parseInt(autoLogoutInput?.value || 30);
            const newHistoryLimit = parseInt(historyLimitInput?.value || 50);
            const notificationsEnabled = notificationsToggle?.querySelector('.toggle-switch').classList.contains('active') || false;

            const users = JSON.parse(localStorage.getItem('psc_users') || '{}');
            const storageKey = auth.currentUser.storageKey || auth.currentUser.email;
            users[storageKey].settings = {
                autoLogoutMinutes: newAutoLogout,
                historyLimit: newHistoryLimit,
                notificationsEnabled
            };

            localStorage.setItem('psc_users', JSON.stringify(users));
            auth.currentUser.settings = users[storageKey].settings;
            localStorage.setItem('psc_currentUser', JSON.stringify(auth.currentUser));

            alert('Settings saved!');
        });
    }
}

function initializeHistoryPage() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistory');

    function renderHistory() {
        const history = passwordChecker.history.getHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <p>No password history yet.</p>
                    <p>Generate passwords to see them here!</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map((item, index) => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${item.password}</h4>
                    <p>${new Date(item.timestamp).toLocaleString()}</p>
                </div>
                <div class="history-strength">${item.strength}</div>
                <div class="history-actions">
                    <button onclick="copyToClipboard('${item.password}')">Copy</button>
                    <button onclick="passwordChecker.history.deleteItem('${item.timestamp}'); location.reload();">Delete</button>
                </div>
            </div>
        `).join('');
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure? This cannot be undone.')) {
                passwordChecker.history.clearHistory();
                renderHistory();
            }
        });
    }

    renderHistory();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const result = passwordChecker.calculateStrength(text);
        const crackTime = passwordChecker.calculateCrackTime(text);
        passwordChecker.history.addToHistory(text, result.text, crackTime);
        alert('Password copied to clipboard!');
    });
}
