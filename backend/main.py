# backend/main.py
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import uuid
import json
import logging
import firebase_admin
from firebase_admin import credentials, db

# --- Configure Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- GLOBAL VARIABLES ---
firebase_config = {}
service_account_path = "./serviceAccount.json" # Ensure this path is correct relative to main.py
all_dummy_data = {} 

# --- TYPES (Pydantic Models) ---
class ContactFormData(BaseModel):
    name: str
    email: EmailStr 
    subject: str
    message: str

class ContactMessage(ContactFormData):
    id: str
    timestamp: str 
    status: str = "new" 

# --- INITIALIZATION ---
async def initialize_firebase_and_data():
    global firebase_config, all_dummy_data
    try:
        # 1. Initialize Firebase Client
        with open("./firebaseConfig.json", "r") as f:
            firebase_config = json.load(f)
        
        cred = credentials.Certificate(service_account_path)
        # Check if the app is already initialized to avoid re-initialization errors (e.g., in --reload mode)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, firebase_config)
        else:
            logger.info("Firebase app already initialized (likely due to --reload).")

        logger.info("Firebase client initialized successfully.")

        # 2. Read the dummy-data.json file into memory at startup.
        with open("./dummy-data.json", "r") as f:
            all_dummy_data = json.load(f)
        logger.info("Local dummy data file loaded successfully.")

    except FileNotFoundError as e:
        logger.error(f"Configuration file not found: {e}")
        raise RuntimeError(f"Initialization failed: {e}. Make sure firebaseConfig.json, serviceAccount.json, and dummy-data.json are in the backend directory.")
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON file: {e}")
        raise RuntimeError(f"Initialization failed: {e}. Check JSON file formatting.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase or load data: {e}")
        raise RuntimeError(f"Initialization failed: {e}")

# ===================================================================
# FASTAPI APPLICATION SETUP
# ===================================================================
app = FastAPI()

# --- CORS Configuration ---
origins = [
    "http://localhost:5173", # Your frontend's URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"], 
    allow_headers=["Content-Type", "Authorization"], 
)

# Call initialization function on startup
@app.on_event("startup")
async def startup_event():
    await initialize_firebase_and_data()

# ===================================================================
# HELPER FUNCTIONS
# ===================================================================

async def handle_hybrid_get(db_path: str):
    merged_data = {}

    # Step 1: Get the correct section of dummy data
    if db_path in all_dummy_data and isinstance(all_dummy_data[db_path], dict):
        merged_data.update(all_dummy_data[db_path])
    elif db_path == "contact_messages" and "contact_messages" in all_dummy_data and isinstance(all_dummy_data["contact_messages"], dict):
        merged_data.update(all_dummy_data["contact_messages"])
    else:
        logger.debug(f"No matching dummy data or invalid format for path: {db_path}") 

    # Step 2: Fetch live data from Firebase
    try:
        ref = db.reference(f"/{db_path}") 
        live_data = ref.get()
        
        # Step 3: Manually merge the live data into our map.
        if live_data and isinstance(live_data, dict):
            merged_data.update(live_data)
        elif live_data is None:
            logger.info(f"No live data found in Firebase for /{db_path}")
        else:
            logger.warning(f"Firebase returned non-dict data for /{db_path}: {type(live_data)}")

    except Exception as e:
        logger.error(f"Failed to get live data for /{db_path} from Firebase: {e}")
        # Consider whether to raise an HTTPException or return partial data based on error tolerance.

    return merged_data

# ===================================================================
# FASTAPI ENDPOINTS
# ===================================================================

# --- GET endpoints for fetching combined data ---
@app.get("/advertisements")
async def get_advertisements():
    """Fetches advertisements, merging dummy and live data."""
    data = await handle_hybrid_get("advertisements")
    return data

@app.get("/ideas")
async def get_ideas():
    """Fetches ideas, merging dummy and live data."""
    data = await handle_hybrid_get("ideas")
    return data

@app.get("/students")
async def get_students():
    """Fetches students, merging dummy and live data."""
    data = await handle_hybrid_get("students")
    return data

# --- GET endpoint for fetching contact messages (admin use) ---
@app.get("/api/contact")
async def get_contact_messages_admin():
    """Fetches all contact messages, merging dummy and live data (primarily live)."""
    data = await handle_hybrid_get("contact_messages")
    return data

# --- POST endpoint for submitting contact form ---
@app.post("/api/contact", status_code=status.HTTP_200_OK)
async def submit_contact_form(form_data: ContactFormData):
    """Submits a contact form message and saves it to Firebase."""
    if not all([form_data.name.strip(), form_data.email.strip(), 
                form_data.subject.strip(), form_data.message.strip()]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "All fields are required and cannot be empty"}
        )

    message_id = str(uuid.uuid4())
    current_time_utc = datetime.utcnow().replace(tzinfo=timezone.utc)
    timestamp = current_time_utc.isoformat(timespec='milliseconds').replace('+00:00', 'Z')

    contact_message_data = ContactMessage(
        id=message_id,
        name=form_data.name,
        email=form_data.email,
        subject=form_data.subject,
        message=form_data.message,
        timestamp=timestamp,
        status="new"
    ).dict() 

    try:
        db.reference(f"/contact_messages/{message_id}").set(contact_message_data)
        logger.info(f"Contact message successfully saved to Firebase with ID: {message_id}")
        return {
            "success": True,
            "message": "Thank you for your message! We'll get back to you soon.",
            "messageId": message_id
        }
    except Exception as e:
        logger.error(f"Failed to save contact message to Firebase: {e}")
        # Local backup logic (as in Ballerina)
        try:
            backup_filename = f"./contact_messages_backup_{message_id}.json"
            with open(backup_filename, "w") as f:
                json.dump(contact_message_data, f, indent=4)
            logger.info(f"Contact message saved locally as backup: {message_id} to {backup_filename}")
        except Exception as backup_e:
            logger.error(f"Failed to save contact message locally as backup: {backup_e}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": "Failed to save your message. Please try again later."}
        )

# --- Additional endpoint to update message status (admin use) ---
@app.patch("/api/contact/{message_id}", status_code=status.HTTP_200_OK)
async def update_contact_message_status(message_id: str, update_data: dict):
    """Updates the status or other fields of a specific contact message in Firebase."""
    if not update_data or not isinstance(update_data, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Invalid payload format. Expected a JSON object with fields to update."}
        )
    
    allowed_patch_fields = ["status"] 
    if not any(field in update_data for field in allowed_patch_fields):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": f"Only fields {', '.join(allowed_patch_fields)} can be updated via this endpoint."}
        )
    
    if "status" in update_data:
        allowed_statuses = ["new", "read", "resolved", "archived"] 
        if update_data["status"] not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": f"Invalid status value. Allowed: {', '.join(allowed_statuses)}"}
            )

    try:
        db.reference(f"/contact_messages/{message_id}").update(update_data)
        logger.info(f"Message status updated for ID: {message_id} with data: {update_data}")
        return {
            "success": True,
            "message": "Message status updated successfully"
        }
    except Exception as e:
        logger.error(f"Failed to update message for ID {message_id} in Firebase: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"success": False, "message": "Failed to update message status"}
        )