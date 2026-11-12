// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "yourKey",
    authDomain: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "...",
    measurementId: "..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- DOM Elements ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const errorMessage = document.getElementById('error-message');
const googleSignInButtons = document.querySelectorAll('.google-signin-button');

// --- Redirect if user is already logged in ---
auth.onAuthStateChanged(user => {
    // If user exists and we are on the login page, redirect to the main app
    if (user && window.location.pathname.includes('login.html')) {
        window.location.replace('index.html');
    }
});

// --- View Switching ---
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    });
}
if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    });
}

// --- Email/Password Login ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        auth.signInWithEmailAndPassword(email, password)
            .catch((error) => {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            });
    });
}

// --- Email/Password Registration ---
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        auth.createUserWithEmailAndPassword(email, password)
            .catch((error) => {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            });
    });
}

// --- Google Sign-In Logic ---
if (googleSignInButtons.length > 0) {
    googleSignInButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Create a new instance of the Google provider object
            const provider = new firebase.auth.GoogleAuthProvider();

            // Sign in with a pop-up window
            auth.signInWithPopup(provider)
                .then((result) => {
                    // Successful sign-in is handled by the onAuthStateChanged listener,
                    // which will automatically redirect the user.
                    console.log('Google sign-in successful:', result.user);
                })
                .catch((error) => {
                    // Handle Errors here.
                    console.error('Google sign-in error:', error.message);
                    errorMessage.textContent = error.message;
                    errorMessage.classList.remove('hidden');
                });
        });
    });
}
