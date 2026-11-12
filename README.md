
# JobMatch AI 🚀

**Your AI-Powered Career Co-Pilot**

JobMatch AI is an intelligent skill-to-job recommender system that revolutionizes the hiring process. Moving beyond simple keyword matching, this platform uses advanced Natural Language Processing (NLP) to understand the semantic meaning of resumes and job descriptions. It provides precise compatibility scores, data-driven salary predictions, and an innovative company-fit analysis.

The application features a secure login system powered by Firebase and offers distinct workflows for both individual job seekers and recruiters performing bulk analysis.



## ✨ Key Features

* **AI-Powered Compatibility Score:** Uses Sentence-BERT embeddings and cosine similarity to provide a true contextual match score between a resume and a job description.
* **Data-Driven Salary Prediction:** A machine learning model predicts a realistic salary range based on user-provided job title, experience, and location.
* **Company Fit Score:** Analyzes the cultural alignment between a candidate's professional summary and a company's values.
* **Dual User Modes:**
    * **Candidate View:** For individual users to analyze their resume against a single job.
    * **Recruiter View:** A powerful tool for recruiters to upload multiple resumes at once and get a ranked list of candidates for a specific role.
* **Secure Authentication:** A complete login and registration system using Firebase, supporting both email/password and Google Sign-In.

---

## 🛠️ Tech Stack

This project is built with a modern, decoupled architecture.

* **Frontend:**
    * HTML5
    * CSS3 (with a modern dark theme)
    * Vanilla JavaScript
    * Firebase SDK (for authentication)

* **Backend:**
    * Python 3.x
    * Flask (as the web server and for creating REST APIs)
    * **AI & Machine Learning:**
        * `sentence-transformers`: For generating semantic embeddings.
        * `scikit-learn`: For the salary prediction model (RandomForestRegressor).
        * `pandas`: For data manipulation.
    * **Utilities:**
        * `PyPDF2`: For extracting text from PDF resumes.
        * `joblib`: For saving and loading the trained ML model.

---

## 🚀 Setup and Installation

To get this project running locally, follow these steps. You will need to run the backend server and the frontend client separately.

### Prerequisites

* Python 3.7+ installed on your system.
* A Firebase project with your credentials and Google Sign-In enabled.

### **1. Backend Setup**

1.  **Clone the Repository & Navigate to the Backend Directory:**
    ```bash
    git clone <your-repo-url>
    cd path/to/your/backend-folder
    ```

2.  **Create a Virtual Environment (Recommended):**
    ```bash
    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Train the Salary Prediction Model:**
    This is a **crucial one-time step**. This script creates the `salary_model.joblib` file that the main application needs.
    ```bash
    python model_training.py
    ```

5.  **Run the Flask Server:**
    ```bash
    python app.py
    ```
    The server will start, and you will see output indicating it is running on `http://127.0.0.1:5000`. Keep this terminal window open.

### **2. Frontend Setup**

1.  **Navigate to the Frontend Directory:** Open a new terminal or use your file explorer.
2.  **Open `login.html`:** You do not need a separate web server for the frontend. Simply open the `login.html` file directly in your web browser (e.g., Google Chrome, Firefox).
3.  **Log In or Register:** Use the interface to create an account or sign in. Upon success, you will be automatically redirected to `index.html`, where the main application runs.

---

## ⚙️ How It Works

### AI Analysis

1.  **Semantic Matching:** When a resume and job description are provided, the backend's Sentence-BERT model converts both texts into numerical vectors (embeddings). The cosine similarity between these vectors is calculated to produce the **Compatibility Score** and **Company Fit Score**. A score near 1.0 indicates a strong semantic match.

2.  **Salary Prediction:** The user provides the job title, experience, and location directly in the UI. These structured features are fed into a pre-trained `RandomForestRegressor` model, which predicts a salary. The model is trained on the data provided in `salary_dataset.csv`.

### Authentication

The frontend uses the official Firebase SDK. The `auth.js` script handles user sign-up and sign-in. The main `script.js` on the `index.html` page has a security guard (`onAuthStateChanged`) that checks if a user is logged in. If not, it redirects them to the login page, effectively protecting the application.

---

## 🌐 API Endpoints

The backend exposes two main endpoints that the frontend communicates with:

* **`POST /analyze`** (For Candidate View)
    * **Description:** Analyzes a single resume against a single job description.
    * **Request Body:** `multipart/form-data` containing:
        * `resume`: The PDF file.
        * `job_text`: The job description text.
        * `job_title`, `experience_years`, `location`: Text fields for salary prediction.
    * **Response:** A JSON object with the three analysis scores.

* **`POST /bulk_analyze`** (For Recruiter View)
    * **Description:** Analyzes multiple resumes against a single job description.
    * **Request Body:** `multipart/form-data` containing:
        * `resumes`: Multiple PDF files.
        * `job_text`: The job description text.
    * **Response:** A JSON array of ranked candidates, sorted by their ATS score.
=======
