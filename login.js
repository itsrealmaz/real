// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2e5ZFUMY67KJsUrrflJpSIm1UpE4gn_Q",
    authDomain: "realauth-f47e3.firebaseapp.com",
    projectId: "realauth-f47e3",
    storageBucket: "realauth-f47e3.firebasestorage.app",
    messagingSenderId: "246570204070",
    appId: "1:246570204070:web:d89596de8b627467e66d67"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM elements
const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Custom error messages
const customErrors = {
    "auth/invalid-login-credentials": "MAZ error: Invalid cosmic credentials",
    "auth/user-not-found": "MAZ error: Space traveler not found",
    "auth/wrong-password": "MAZ error: Incorrect cosmic key",
    "auth/email-already-in-use": "MAZ error: Cosmic identity already exists",
    "auth/weak-password": "MAZ error: Cosmic key too weak (min 6 characters)",
    "auth/invalid-email": "MAZ error: Invalid cosmic address",
    "default": "MAZ error: Cosmic connection failed"
};

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tab.dataset.tab === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            loginError.textContent = '';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            registerError.textContent = '';
        }
    });
});

// Login handler
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            const errorMsg = customErrors[error.code] || customErrors.default;
            loginError.textContent = errorMsg;
        });
});

// Register handler
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            const errorMsg = customErrors[error.code] || customErrors.default;
            registerError.textContent = errorMsg;
        });
});

// Check if user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'index.html';
    }
});
