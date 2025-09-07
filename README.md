# NexusLink - Full Stack Community Portal

Welcome to the NexusLink, a full-stack application designed to connect students, companies, and startup founders. This repository contains the complete codebase for the project, structured as a monorepo.

*   **`/frontend`**: The user interface built with React and Vite.
*   **`/backend`**: The main API service built with Ballerina, responsible for handling core data operations with Firebase.
*   **`/data_analysis_service`**: A separate microservice built with Python, Flask, and Pandas to provide data insights and AI-powered predictions.

---

## 🏁 Getting Started: A Step-by-Step Guide

To run this application locally, you will need to start all three services. This requires **three separate terminal windows**.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Node.js & npm:** (Version 18 or higher recommended). Required for the React frontend.
    *   Download from [nodejs.org](https://nodejs.org/)
2.  **Ballerina:** (Swan Lake version recommended). Required for the main backend service.
    *   Download from [ballerina.io](https://ballerina.io/downloads/)
3.  **Python:** (Version 3.8 or higher recommended). Required for the data analysis and AI service.
    *   Download from [python.org](https://www.python.org/downloads/)
4.  **Git:** For version control.

---

### **Setup Step 1: Frontend (React App)**

This is the user interface of the application.

1.  **Open Terminal #1.**
2.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
3.  Install all the necessary Node.js packages:
    ```bash
    npm install
    ```
4.  Once installation is complete, you can start the frontend, but it's best to start the backends first. Keep this terminal window open and ready.

---

### **Setup Step 2: Ballerina Backend**

This service handles the main communication with your Firebase database.

1.  **Open Terminal #2.**
2.  Navigate to the Ballerina project directory:
    ```bash
    cd backend/api_service
    ```
3.  **Important:** Configure your Firebase credentials.
    *   Place your `serviceAccount.json` file inside this directory.
    *   Create a `Config.toml` file here and add your Firebase project configuration.
4.  Build the project. This will also automatically download and install the required Ballerina dependencies (like the Firebase module).
    ```bash
    bal build
    ```

---

### **Setup Step 3: Python Data Analysis & AI Service**

This service performs data analysis and runs the AI prediction model.

1.  **Open Terminal #3.**
2.  Navigate to the data analysis directory:
    ```bash
    cd data_analysis_service
    ```
3.  Create a Python virtual environment to keep its dependencies isolated:
    ```bash
    python -m venv venv
    ```
4.  **Activate the virtual environment.** This is a crucial step.
    *   On Windows (PowerShell):
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   On Mac/Linux:
        ```bash
        source venv/bin/activate
        ```
    *Your terminal prompt should now start with `(venv)`.*

5.  Install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: For this to work, you need to create a `requirements.txt` file inside the `data_analysis_service` folder with the following content:)*
    ```
    pandas
    flask
    flask-cors
    scikit-learn
    joblib
    numpy
    requests
    ```
6.  **Train the AI Model:** This is a one-time step (or whenever your `startup_data.csv` changes). It reads your data and creates the `*.pkl` model files.
    ```bash
    python train_model.py
    ```

---

## 🏃‍♂️ Running the Full Application

Now that setup is complete, you will run all three parts in their respective terminals.

**1. Run the Ballerina Backend**

*   Go to **Terminal #2** (the one inside `backend/api_service`).
*   Start the server:
    ```bash
    bal run
    ```
*   ✅ The backend is now running on `http://localhost:9090`. Keep this terminal open.

**2. Run the Python Data/AI Service**

*   Go to **Terminal #3** (the one inside `data_analysis_service` with `(venv)` active).
*   Start the server:
    ```bash
    flask run
    ```
*   ✅ The data service is now running on `http://localhost:5000`. Keep this terminal open.

**3. Run the Frontend**

*   Go to **Terminal #1** (the one inside `frontend`).
*   Start the React development server:
    ```bash
    npm run dev
    ```
*   ✅ The frontend is now running. Open your browser and go to the URL it provides (usually `http://localhost:5173`).

You now have the full application running locally.
