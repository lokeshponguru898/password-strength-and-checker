const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("strengthText");
const crackTimeText = document.getElementById("crackTimeText");
const togglePassword = document.getElementById("togglePassword");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

if (passwordInput) passwordInput.addEventListener("keyup", checkStrength);
if (togglePassword) togglePassword.addEventListener("click", togglePasswordVisibility);
if (generateBtn) generateBtn.addEventListener("click", generatePassword);
if (copyBtn) copyBtn.addEventListener("click", copyPassword);

// navigate to login page when button clicked
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

function checkStrength() {
    const password = passwordInput.value;
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

    switch (strength) {
        case 0:
        case 1:
            updateStrength("20%", "#ff6b6b", "Very Weak", calculateCrackTime(password));
            break;
        case 2:
            updateStrength("40%", "#ff9f43", "Weak", calculateCrackTime(password));
            break;
        case 3:
            updateStrength("60%", "#ffd166", "Medium", calculateCrackTime(password));
            break;
        case 4:
            updateStrength("80%", "#60a5fa", "Strong", calculateCrackTime(password));
            break;
        case 5:
            updateStrength("100%", "#34d399", "Very Strong", calculateCrackTime(password));
            break;
    }

    if (password.length === 0) {
        strengthText.textContent = "";
        crackTimeText.textContent = "";
        resetRules();
        copyBtn.style.display = "none";
    } else {
        copyBtn.style.display = "flex";
    }
}

function resetRules() {
    document.querySelectorAll('.strength-bar').forEach(bar => bar.classList.remove('active'));
}

function updateStrength(width, color, text, crackTime) {
    strengthText.textContent = text;
    crackTimeText.textContent = crackTime;

    // Update strength bars
    document.querySelectorAll('.strength-bar').forEach(bar => bar.classList.remove('active'));
    const levelMap = {
        'Very Strong': 'very-strong',
        'Strong': 'strong',
        'Medium': 'medium',
        'Weak': 'weak',
        'Very Weak': 'very-weak'
    };
    const level = levelMap[text];
    if (level) {
        document.querySelector(`[data-level="${level}"]`)?.classList.add('active');
    }
}

function calculateCrackTime(password) {
    if (password.length === 0) return "";
    
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;
    
    const combinations = Math.pow(charsetSize, password.length);
    const guessesPerSecond = 1000000000; // 1 billion guesses per second
    const seconds = combinations / guessesPerSecond;
    
    if (seconds < 1) return "Instantly";
    if (seconds < 60) return "Seconds";
    if (seconds < 3600) return "Minutes";
    if (seconds < 86400) return "Hours";
    if (seconds < 2592000) return "Days to Weeks";
    if (seconds < 31536000) return "Months";
    if (seconds < 3153600000) return "Years";
    return "Centuries";
}

function togglePasswordVisibility() {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.classList.toggle("show-password");
}

function generatePassword() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}";
    const allChars = uppercase + lowercase + numbers + special;
    let password = "";
    
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const length = Math.floor(Math.random() * 5) + 12;
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    passwordInput.value = password;
    passwordInput.type = "text";
    togglePassword.classList.add("show-password");
    checkStrength();
    
    copyBtn.style.display = "flex";
    
    generateBtn.classList.add('spin');
    setTimeout(() => generateBtn.classList.remove('spin'), 600);
}

function copyPassword() {
    const password = passwordInput.value;
    if (password) {
        navigator.clipboard.writeText(password).then(() => {
            // Save to localStorage for history
            const copiedPasswords = JSON.parse(localStorage.getItem('copiedPasswords') || '[]');
            const historyItem = {
                password,
                timestamp: new Date().toISOString()
            };
            copiedPasswords.unshift(historyItem);
            // Limit to 50
            copiedPasswords.splice(50);
            localStorage.setItem('copiedPasswords', JSON.stringify(copiedPasswords));
            
            // Maybe show a toast or something, but for now just copy
            alert('Password copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
}
