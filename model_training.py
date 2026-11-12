import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
import joblib

print("Starting model training...")

# 1. Load the dataset
data = pd.read_csv('salary_dataset.csv')

# 2. Define features (X) and target (y)
X = data[['job_title', 'experience_years', 'location']]
y = data['salary_inr']

# 3. Set up a preprocessing pipeline
# This will automatically handle categorical features (like 'job_title')
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['job_title', 'location'])
    ],
    remainder='passthrough' # Keep 'experience_years' as is
)

# 4. Create the full model pipeline
# This chains the preprocessing and the regressor model together
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# 5. Train the model
model_pipeline.fit(X, y)

# 6. Save the trained model to a file
joblib.dump(model_pipeline, 'salary_model.pkl')

print("Model training complete. `salary_model.pkl` has been created.")