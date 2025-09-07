import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib # A library to save our trained AI model to a file

print("--- AI Model Training Script ---")

# 1. Load the dataset
try:
    df = pd.read_csv('startup_data.csv')
    print("Successfully loaded startup_data.csv.")
except FileNotFoundError:
    print("FATAL ERROR: startup_data.csv not found. Cannot train model.")
    exit()

# 2. Prepare the Data for the AI (Feature Engineering)
# Machine learning models only understand numbers, so we need to convert
# text categories like 'IT' or 'USA' into numerical values.

# Create copies of encoders to use later in our main app
le_industry = LabelEncoder()
le_country = LabelEncoder()

# Convert 'industry' and 'country' columns to numbers
df['industry_encoded'] = le_industry.fit_transform(df['industry'])
df['country_encoded'] = le_country.fit_transform(df['country'])

# The target variable: what we want to predict. 1 for 'Succeeded', 0 otherwise.
df['succeeded'] = (df['status'] == 'Succeeded').astype(int)

print("Data preprocessing complete.")

# 3. Define Features (X) and Target (y)
# Features are the inputs the AI will learn from.
features = ['founded_year', 'funding_usd', 'industry_encoded', 'country_encoded']
X = df[features]
y = df['succeeded'] # The target is the 'succeeded' column

# 4. Split data into training and testing sets
# We train the AI on 80% of the data and test its performance on the remaining 20%.
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Choose and Train the AI Model
# We are using a 'Random Forest', a powerful and popular model for this kind of task.
print("Training the AI model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print("Model training complete.")

# 6. Evaluate the Model's Performance (Accuracy)
accuracy = model.score(X_test, y_test)
print(f"Model Accuracy on test data: {accuracy * 100:.2f}%")

# 7. Save the Trained Model and the Encoders to Files
# This is the most important step. We save the "brain" of our AI so our Flask app can use it.
joblib.dump(model, 'startup_success_model.pkl')
joblib.dump(le_industry, 'industry_encoder.pkl')
joblib.dump(le_country, 'country_encoder.pkl')

print("\nSUCCESS: AI model and encoders have been saved to files:")
print("- startup_success_model.pkl")
print("- industry_encoder.pkl")
print("- country_encoder.pkl")