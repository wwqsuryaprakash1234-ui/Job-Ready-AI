// --- Firebase Config (Provided by you) ---
const firebaseConfig = {
    apiKey: "AIzaSyBYn--k5tAaQQh_LUD_H7PE8hJbwUqjrS8",
    authDomain: "vendor-c54e4.firebaseapp.com",
    projectId: "vendor-c54e4",
    storageBucket: "vendor-c54e4.appspot.com",
    messagingSenderId: "514887648402",
    appId: "1:514887648402:web:b96face888ffeba75d124b",
    measurementId: "G-BCDYQLMYFE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', () => {
    // --- API Endpoints ---
    const CANDIDATE_API_URL = 'http://127.0.0.1:5000/analyze';
    const RECRUITER_API_URL = 'http://127.0.0.1:5000/bulk_analyze';

    // --- Auth Elements ---
    const userProfileSection = document.getElementById('user-profile');
    const userEmailDisplay = document.getElementById('user-email-display');
    const signOutButton = document.getElementById('sign-out-button');

    // --- Your Existing Element Selectors ---
    const candidateTab = document.getElementById('candidate-tab');
    const recruiterTab = document.getElementById('recruiter-tab');
    const candidateView = document.getElementById('candidate-view');
    const recruiterView = document.getElementById('recruiter-view');
    const candidateAnalyzeButton = document.getElementById('candidate-analyze-button');
    const candidateResumeInput = document.getElementById('candidate-resume-file');
    const candidateJobText = document.getElementById('candidate-job-description');
    const candidateFileName = document.getElementById('candidate-file-name');
    const candidateLoader = document.getElementById('candidate-loader');
    const candidateResults = document.getElementById('candidate-results-section');
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const compatibilityScoreEl = document.getElementById('compatibility-score');
    const compatibilityFillEl = document.getElementById('compatibility-fill');
    const salaryPredictionEl = document.getElementById('salary-prediction');
    const fitScoreEl = document.getElementById('fit-score');
    const fitFillEl = document.getElementById('fit-fill');
    const recruiterAnalyzeButton = document.getElementById('recruiter-analyze-button');
    const recruiterResumeInput = document.getElementById('recruiter-resume-files');
    const recruiterJobText = document.getElementById('recruiter-job-description');
    const recruiterFileName = document.getElementById('recruiter-file-name');
    const recruiterLoader = document.getElementById('recruiter-loader');
    const recruiterResults = document.getElementById('recruiter-results-section');
    const recruiterPlaceholder = document.getElementById('recruiter-placeholder');
    const resultsTableBody = document.getElementById('results-table-body');

    // ======================== AUTHENTICATION ========================
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in, show the profile section
            userProfileSection.classList.remove('hidden');
            // Use displayName if available (from Google), otherwise fall back to email
            userEmailDisplay.textContent = user.displayName || user.email;
        } else {
            // No user is signed in, redirect to the login page
            window.location.replace('login.html');
        }
    });

    // Sign Out Logic
    signOutButton.addEventListener('click', () => {
        auth.signOut().catch((error) => console.error('Sign out error:', error));
    });

    // ======================== YOUR EXISTING APP LOGIC ========================

    // --- Tab Switching Logic ---
    candidateTab.addEventListener('click', () => {
        candidateView.classList.add('active'); candidateView.classList.remove('hidden');
        recruiterView.classList.add('hidden'); recruiterView.classList.remove('active');
        candidateTab.classList.add('active'); recruiterTab.classList.remove('active');
    });
    recruiterTab.addEventListener('click', () => {
        recruiterView.classList.add('active'); recruiterView.classList.remove('hidden');
        candidateView.classList.add('hidden'); candidateView.classList.remove('active');
        recruiterTab.classList.add('active'); candidateTab.classList.remove('active');
    });

    // --- File Input Label Updaters ---
    candidateResumeInput.addEventListener('change', () => {
        candidateFileName.textContent = candidateResumeInput.files.length > 0 ? candidateResumeInput.files[0].name : 'Choose a file...';
    });
    recruiterResumeInput.addEventListener('change', () => {
        recruiterFileName.textContent = recruiterResumeInput.files.length > 0 ? `${recruiterResumeInput.files.length} file(s) selected` : 'Choose files...';
    });

    // --- CANDIDATE Analysis ---
    candidateAnalyzeButton.addEventListener('click', async () => {
        const resumeFile = candidateResumeInput.files[0];
        const jobDescription = candidateJobText.value.trim();
        if (!resumeFile || !jobDescription) { return alert('Please upload a resume and paste the job description.'); }

        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_text', jobDescription);

        candidateLoader.classList.remove('hidden');
        resultsPlaceholder.classList.add('hidden');
        candidateResults.classList.add('hidden');

        try {
            const response = await fetch(CANDIDATE_API_URL, { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'An unknown error occurred.');
            displayCandidateResults(data);
        } catch (error) {
            alert(`Error: ${error.message}`);
            resultsPlaceholder.classList.remove('hidden');
        } finally {
            candidateLoader.classList.add('hidden');
        }
    });

    // --- RECRUITER Analysis ---
    recruiterAnalyzeButton.addEventListener('click', async () => {
        const resumeFiles = recruiterResumeInput.files;
        const jobDescription = recruiterJobText.value.trim();
        if (resumeFiles.length === 0 || !jobDescription) { return alert('Please upload at least one resume and paste the job description.'); }

        const formData = new FormData();
        for (const file of resumeFiles) { formData.append('resumes', file); }
        formData.append('job_text', jobDescription);

        recruiterLoader.classList.remove('hidden');
        recruiterPlaceholder.classList.add('hidden');
        recruiterResults.classList.add('hidden');
        
        try {
            const response = await fetch(RECRUITER_API_URL, { method: 'POST', body: formData });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'An unknown error occurred.');
            displayRecruiterResults(data);
        } catch (error) {
            alert(`Error: ${error.message}`);
            recruiterPlaceholder.classList.remove('hidden');
        } finally {
            recruiterLoader.classList.add('hidden');
        }
    });

    // --- UI UPDATE FUNCTIONS ---
    function displayCandidateResults(data) {
        const compatibility = Math.round(data.compatibility_score * 100);
        compatibilityScoreEl.textContent = `${compatibility}%`;
        compatibilityFillEl.style.transform = `rotate(${compatibility / 100 * 0.5}turn)`;
        salaryPredictionEl.textContent = data.predicted_salary;
        const fit = Math.round(data.company_fit_score * 100);
        fitScoreEl.textContent = `${fit}%`;
        fitFillEl.style.transform = `rotate(${fit / 100 * 0.5}turn)`;
        candidateResults.classList.remove('hidden');
    }

    function displayRecruiterResults(data) {
        resultsTableBody.innerHTML = '';
        if (data.length === 0) {
            resultsTableBody.innerHTML = '<tr><td colspan="3">No valid resumes could be processed.</td></tr>';
        } else {
            data.forEach((result, index) => {
                const score = Math.round(result.ats_score * 100);
                const row = document.createElement('tr');
                row.innerHTML = `<td>${index + 1}</td><td>${result.filename}</td><td>${score}%</td>`;
                resultsTableBody.appendChild(row);
            });
        }
        recruiterResults.classList.remove('hidden');
    }
});