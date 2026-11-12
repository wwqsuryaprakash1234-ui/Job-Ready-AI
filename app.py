import joblib
import pandas as pd
import re
import PyPDF2
import io

from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util

# ==============================================================================
# 1. INITIALIZATION (No changes)
# ==============================================================================
print("Loading models...")
sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
try:
    salary_model = joblib.load('salary_model.pkl')
    print("Salary prediction model loaded successfully.")
except FileNotFoundError:
    print("Error: `salary_model.pkl` not found. Please run `model_training.py` first.")
    exit()

app = Flask(__name__)
CORS(app)
print("Models loaded. The server is ready.")

# ==============================================================================
# 2. HELPER FUNCTIONS (No changes)
# ==============================================================================
def extract_text_from_pdf(file_stream):
    try:
        reader = PyPDF2.PdfReader(file_stream)
        text = ""
        for page in reader.pages:
            text += (page.extract_text() or "") + " "
        return text.strip()
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_features_for_salary(text):
    features = {'job_title': 'Software Engineer', 'experience_years': 2, 'location': 'Bengaluru'}
    exp_match = re.search(r'(\d+)\s*\+?\s*years? of experience', text, re.IGNORECASE)
    if exp_match: features['experience_years'] = int(exp_match.group(1))
    if re.search(r'data scientist', text, re.IGNORECASE): features['job_title'] = 'Data Scientist'
    elif re.search(r'frontend developer', text, re.IGNORECASE): features['job_title'] = 'Frontend Developer'
    elif re.search(r'product manager', text, re.IGNORECASE): features['job_title'] = 'Product Manager'
    elif re.search(r'devops engineer', text, re.IGNORECASE): features['job_title'] = 'DevOps Engineer'
    if re.search(r'mumbai', text, re.IGNORECASE): features['location'] = 'Mumbai'
    elif re.search(r'pune', text, re.IGNORECASE): features['location'] = 'Pune'
    elif re.search(r'hyderabad', text, re.IGNORECASE): features['location'] = 'Hyderabad'
    return features

# ==============================================================================
# 3. API ENDPOINTS
# ==============================================================================

# --- ENDPOINT 1: FOR SINGLE CANDIDATE ANALYSIS ---
@app.route("/analyze", methods=['POST'])
def analyze_single():
    if 'resume' not in request.files: return jsonify({"error": "No resume file part"}), 400
    resume_file = request.files['resume']
    job_text = request.form.get('job_text')
    if resume_file.filename == '' or not job_text: return jsonify({"error": "Missing file or text"}), 400

    resume_text = extract_text_from_pdf(io.BytesIO(resume_file.read()))
    if not resume_text: return jsonify({"error": "Could not extract text from PDF."}), 400

    resume_embedding = sbert_model.encode(resume_text, convert_to_tensor=True)
    job_embedding = sbert_model.encode(job_text, convert_to_tensor=True)
    compatibility_score = util.pytorch_cos_sim(resume_embedding, job_embedding).item()

    resume_summary = " ".join(resume_text.split()[:150])
    summary_embedding = sbert_model.encode(resume_summary, convert_to_tensor=True)
    fit_score = util.pytorch_cos_sim(summary_embedding, job_embedding).item()

    features_df = pd.DataFrame([extract_features_for_salary(job_text)])
    predicted_salary_raw = salary_model.predict(features_df)[0]
    salary_in_lakhs = predicted_salary_raw / 100000
    predicted_salary = f"₹{salary_in_lakhs:.1f} - {salary_in_lakhs + 3:.1f} LPA"

    return jsonify({
        "compatibility_score": compatibility_score,
        "predicted_salary": predicted_salary,
        "company_fit_score": fit_score
    })

# --- ENDPOINT 2: NEW! FOR RECRUITER BULK ANALYSIS ---
@app.route("/bulk_analyze", methods=['POST'])
def analyze_bulk():
    job_text = request.form.get('job_text')
    # Use getlist to handle multiple files from the same input field
    resume_files = request.files.getlist('resumes')

    if not job_text or not resume_files:
        return jsonify({"error": "Missing job description or resume files"}), 400

    job_embedding = sbert_model.encode(job_text, convert_to_tensor=True)
    
    results = []
    for resume_file in resume_files:
        if resume_file and resume_file.filename != '':
            resume_text = extract_text_from_pdf(io.BytesIO(resume_file.read()))
            if resume_text:
                resume_embedding = sbert_model.encode(resume_text, convert_to_tensor=True)
                # Calculate ATS score (same as compatibility score)
                score = util.pytorch_cos_sim(resume_embedding, job_embedding).item()
                results.append({
                    "filename": resume_file.filename,
                    "ats_score": score
                })
    
    # Sort the results by score in descending order
    sorted_results = sorted(results, key=lambda x: x['ats_score'], reverse=True)
    
    return jsonify(sorted_results)

# ==============================================================================
# 4. RUN THE APPLICATION
# ==============================================================================
if __name__ == '__main__':
    app.run(debug=True)