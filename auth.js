// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Password match validation
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                validatePasswordMatch(passwordInput, confirmPasswordInput);
            });
        }
    }

    // Check if user is logged in
    checkAuthState();
});

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeInput = document.getElementById('remember');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeInput ? rememberMeInput.checked : false;
    
    if (!validateEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError(passwordInput, 'Password must be at least 6 characters');
        return;
    }
    
    // Clear any previous errors
    clearErrors();
    
    // Simulate login API call
    simulateApiCall({
        email,
        password,
        rememberMe
    })
    .then(response => {
        if (response.success) {
            // Store auth token
            setAuthToken(response.token, rememberMe);
            
            // Redirect to home page
            window.location.href = './index.html';
        } else {
            showFormError('Invalid email or password. Please try again.');
        }
    })
    .catch(error => {
        showFormError('Login failed. Please try again later.');
        console.error('Login error:', error);
    });
}

/**
 * Handle registration form submission
 * @param {Event} event - Form submit event
 */
function handleRegistration(event) {
    event.preventDefault();
    
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsInput = document.getElementById('terms');
    
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const termsAccepted = termsInput.checked;
    
    // Validate inputs
    let isValid = true;
    
    if (firstName.length < 2) {
        showError(firstNameInput, 'First name is required');
        isValid = false;
    }
    
    if (lastName.length < 2) {
        showError(lastNameInput, 'Last name is required');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    if (password.length < 8) {
        showError(passwordInput, 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError(confirmPasswordInput, 'Passwords do not match');
        isValid = false;
    }
    
    if (!termsAccepted) {
        showError(termsInput, 'You must accept the terms and conditions');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Clear any previous errors
    clearErrors();
    
    // Simulate registration API call
    simulateApiCall({
        firstName,
        lastName,
        email,
        password,
        termsAccepted
    })
    .then(response => {
        if (response.success) {
            // Store auth token
            setAuthToken(response.token, false);
            
            // Show success message and redirect
            showSuccess('Account created successfully! Redirecting...');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = './index.html';
            }, 1500);
        } else {
            showFormError(response.message || 'Registration failed. Please try again.');
        }
    })
    .catch(error => {
        showFormError('Registration failed. Please try again later.');
        console.error('Registration error:', error);
    });
}

/**
 * Validate password match
 * @param {HTMLInputElement} passwordInput - Password input element
 * @param {HTMLInputElement} confirmInput - Confirm password input element
 */
function validatePasswordMatch(passwordInput, confirmInput) {
    if (passwordInput.value !== confirmInput.value) {
        confirmInput.setCustomValidity('Passwords do not match');
    } else {
        confirmInput.setCustomValidity('');
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Show error message for an input
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message
 */
function showError(input, message) {
    const formGroup = input.closest('.form-group');
    
    // Remove any existing error
    clearError(formGroup);
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
    formGroup.classList.add('has-error');
    
    // Set aria attributes for accessibility
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `error-${input.id}`);
    errorElement.id = `error-${input.id}`;
}

/**
 * Clear error for a form group
 * @param {HTMLElement} formGroup - Form group element
 */
function clearError(formGroup) {
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        const input = formGroup.querySelector('input');
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
        formGroup.removeChild(errorElement);
        formGroup.classList.remove('has-error');
    }
}

/**
 * Clear all errors in the form
 */
function clearErrors() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => clearError(group));
    
    const formError = document.querySelector('.form-error');
    if (formError) {
        formError.remove();
    }
}

/**
 * Show form-level error message
 * @param {string} message - Error message
 */
function showFormError(message) {
    // Remove any existing form error
    const existingError = document.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    const form = document.querySelector('.auth-form');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    form.insertBefore(errorElement, submitButton.parentNode);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
    // Remove any existing messages
    const existingError = document.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    const existingSuccess = document.querySelector('.form-success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const form = document.querySelector('.auth-form');
    const submitButton = form.querySelector('button[type="submit"]');
    
    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.textContent = message;
    
    form.insertBefore(successElement, submitButton.parentNode);
}

/**
 * Set authentication token in storage
 * @param {string} token - Authentication token
 * @param {boolean} remember - Whether to remember user
 */
function setAuthToken(token, remember) {
    if (remember) {
        localStorage.setItem('authToken', token);
    } else {
        sessionStorage.setItem('authToken', token);
    }
}

/**
 * Get authentication token from storage
 * @returns {string|null} - Authentication token or null
 */
function getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

/**
 * Clear authentication token from storage
 */
function clearAuthToken() {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
function isAuthenticated() {
    return getAuthToken() !== null;
}

/**
 * Check authentication state and update UI accordingly
 */
function checkAuthState() {
    if (isAuthenticated()) {
        // User is logged in
        updateUIForAuthenticatedUser();
    } else {
        // User is not logged in
        updateUIForUnauthenticatedUser();
    }
}

/**
 * Update UI for authenticated user
 */
function updateUIForAuthenticatedUser() {
    // Add user menu to header
    const nav = document.querySelector('.nav-links');
    if (nav) {
        // Check if user menu already exists
        if (!document.querySelector('.user-menu')) {
            const userMenu = document.createElement('div');
            userMenu.className = 'user-menu';
            userMenu.innerHTML = `
                <a href="#" class="user-button">
                    <i class="fas fa-user-circle"></i>
                    <span>My Account</span>
                </a>
                <div class="user-dropdown">
                    <a href="./profile.html">Profile</a>
                    <a href="./settings.html">Settings</a>
                    <a href="#" id="logout-button">Log Out</a>
                </div>
            `;
            nav.appendChild(userMenu);
            
            // Add logout event listener
            document.getElementById('logout-button').addEventListener('click', handleLogout);
        }
    }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticatedUser() {
    // No specific changes needed as the login/register links are part of the default UI
}

/**
 * Handle user logout
 * @param {Event} event - Click event
 */
function handleLogout(event) {
    event.preventDefault();
    
    // Clear auth token
    clearAuthToken();
    
    // Redirect to home page
    window.location.href = './index.html';
}

/**
 * Simulate API call (replace with actual API calls in production)
 * @param {Object} data - Request data
 * @returns {Promise} - Promise resolving to response data
 */
function simulateApiCall(data) {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            // For demo purposes, always succeed with login/registration
            resolve({
                success: true,
                token: 'demo-token-' + Math.random().toString(36).substring(2),
                message: 'Operation successful'
            });
        }, 1000);
    });
} 