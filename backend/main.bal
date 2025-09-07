import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/time;
import ballerina/uuid;
import lakpahana/firebase_realtime_database;

// --- GLOBAL VARIABLES ---
final firebase_realtime_database:FirebaseDatabaseClient firebaseClient;
// This variable will hold all the dummy data read from the local file.
json allDummyData; 

// --- TYPES ---
type ContactFormData record {
    string name;
    string email;
    string subject;
    string message;
};

// --- INITIALIZATION ---
function init() returns error? {
    // 1. Initialize Firebase Client
    json firebaseConfigJson = check io:fileReadJson("./firebaseConfig.json");
    firebaseClient = check new (firebaseConfigJson, "./serviceAccount.json");
    log:printInfo("Firebase client initialized successfully.");

    // 2. Read the dummy-data.json file into memory at startup.
    allDummyData = check io:fileReadJson("./dummy-data.json");
    log:printInfo("Local dummy data file loaded successfully.");
}

// ===================================================================
// BALLERINA SERVICE (GET AND POST)
// ===================================================================

service / on new http:Listener(9090) {

    // Handles the browser's preflight OPTIONS request.
    resource function options [string... path]() returns http:Response {
        http:Response response = new;
        response.statusCode = http:STATUS_OK;
        setCorsHeaders(response);
        return response;
    }

    // Specific OPTIONS handler for the /api/contact endpoint
    resource function options api/contact() returns http:Response {
        http:Response response = new;
        response.statusCode = http:STATUS_OK;
        setCorsHeaders(response);
        return response;
    }

    // --- GET endpoints for fetching combined data ---
    resource function get advertisements(http:Request request) returns http:Response|error {
        return handleHybridGet(request, "advertisements");
    }
    resource function get ideas(http:Request request) returns http:Response|error {
        return handleHybridGet(request, "ideas");
    }
    resource function get students(http:Request request) returns http:Response|error {
        return handleHybridGet(request, "students");
    }

    // --- GET endpoint for fetching contact messages (admin use) ---
    resource function get api/contact(http:Request request) returns http:Response|error {
        return handleHybridGet(request, "contact_messages");
    }

    // --- POST endpoint for submitting contact form ---
    resource function post api/contact(http:Request request) returns http:Response|error {
        http:Response response = new;
        setCorsHeaders(response);

        // Parse the JSON payload from the request
        json|error jsonPayload = request.getJsonPayload();
        if jsonPayload is error {
            response.statusCode = http:STATUS_BAD_REQUEST;
            response.setPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            return response;
        }
        
        ContactFormData|error formDataResult = jsonPayload.cloneWithType(ContactFormData);
        
        if formDataResult is error {
            response.statusCode = http:STATUS_BAD_REQUEST;
            response.setPayload({
                "success": false,
                "message": "Invalid form data format"
            });
            return response;
        }

        ContactFormData formData = formDataResult;

        // Validate required fields
        if formData.name.trim() == "" || formData.email.trim() == "" || 
           formData.subject.trim() == "" || formData.message.trim() == "" {
            response.statusCode = http:STATUS_BAD_REQUEST;
            response.setPayload({
                "success": false,
                "message": "All fields are required"
            });
            return response;
        }

        // Create contact message record
        string messageId = uuid:createType4AsString();
        time:Utc currentTime = time:utcNow();
        string timestamp = time:utcToString(currentTime);

        json contactMessage = {
            "id": messageId,
            "name": formData.name,
            "email": formData.email,
            "subject": formData.subject,
            "message": formData.message,
            "timestamp": timestamp,
            "status": "new"
        };

        // Save to Firebase using HTTP client (Firebase REST API)
        http:Client|error firebaseHttpClientResult = new ("https://jobflow2-d1187-default-rtdb.firebaseio.com");
        
        if firebaseHttpClientResult is error {
            log:printError("Failed to create Firebase HTTP client", firebaseHttpClientResult);
            response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
            response.setPayload({
                "success": false,
                "message": "Failed to connect to Firebase"
            });
            return response;
        }

        http:Client firebaseHttpClient = firebaseHttpClientResult;
        
        // Use Firebase REST API to save data
        http:Response|error saveResponse = firebaseHttpClient->put(
            string `/contact_messages/${messageId}.json`,
            contactMessage
        );
        
        if saveResponse is error {
            log:printError("Failed to save to Firebase via HTTP", saveResponse);
            // Save locally as backup
            json|error localSave = io:fileWriteJson("./contact_messages_backup.json", contactMessage);
            log:printInfo("Contact message saved locally as backup: " + messageId);
        } else {
            if saveResponse.statusCode == 200 {
                log:printInfo("Contact message successfully saved to Firebase with ID: " + messageId);
            } else {
                log:printError("Firebase returned status: " + saveResponse.statusCode.toString());
            }
        }

        // Success response
        response.statusCode = http:STATUS_OK;
        response.setPayload({
            "success": true,
            "message": "Thank you for your message! We'll get back to you soon.",
            "messageId": messageId
        });

        return response;
    }

    // --- Additional endpoint to update message status (admin use) ---
    resource function patch api/contact/[string messageId](http:Request request) returns http:Response|error {
        http:Response response = new;
        setCorsHeaders(response);

        json|error payload = request.getJsonPayload();
        if payload is error {
            response.statusCode = http:STATUS_BAD_REQUEST;
            response.setPayload({
                "success": false,
                "message": "Invalid payload"
            });
            return response;
        }

        // Update message status in Firebase using HTTP client
        http:Client|error firebaseHttpClientResult = new ("https://jobflow2-d1187-default-rtdb.firebaseio.com");
        
        if firebaseHttpClientResult is error {
            response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
            response.setPayload({
                "success": false,
                "message": "Failed to connect to Firebase"
            });
            return response;
        }

        http:Client firebaseHttpClient = firebaseHttpClientResult;
        
        http:Response|error updateResponse = firebaseHttpClient->patch(
            string `/contact_messages/${messageId}.json`,
            payload
        );
        
        if updateResponse is error {
            log:printError("Failed to update message status", updateResponse);
            response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
            response.setPayload({
                "success": false,
                "message": "Failed to update message status"
            });
        } else {
            if updateResponse.statusCode == 200 {
                response.statusCode = http:STATUS_OK;
                response.setPayload({
                    "success": true,
                    "message": "Message status updated successfully"
                });
                log:printInfo("Message status updated for ID: " + messageId);
            } else {
                response.statusCode = http:STATUS_INTERNAL_SERVER_ERROR;
                response.setPayload({
                    "success": false,
                    "message": "Failed to update message status"
                });
            }
        }

        return response;
    }
}

// SAFER Helper Function to Merge Dummy and Live Data
function handleHybridGet(http:Request request, string dbPath) returns http:Response {
    http:Response response = new;
    
    // Step 1: Get the correct section of dummy data using a 'match' statement.
    map<json> mergedData = {};
    match dbPath {
        "students" => {
            var dummyItems = allDummyData.students;
            if dummyItems is map<json> { mergedData = dummyItems.clone(); }
        }
        "ideas" => {
            var dummyItems = allDummyData.ideas;
            if dummyItems is map<json> { mergedData = dummyItems.clone(); }
        }
        "advertisements" => {
            var dummyItems = allDummyData.advertisements;
            if dummyItems is map<json> { mergedData = dummyItems.clone(); }
        }
        "contact_messages" => {
            // For contact messages, we fetch directly from Firebase via HTTP
            http:Client|error firebaseHttpClientResult = new ("https://jobflow2-d1187-default-rtdb.firebaseio.com");
            
            if firebaseHttpClientResult is http:Client {
                http:Response|error firebaseResponse = firebaseHttpClientResult->get("/contact_messages.json");
                
                if firebaseResponse is http:Response && firebaseResponse.statusCode == 200 {
                    json|error firebaseData = firebaseResponse.getJsonPayload();
                    if firebaseData is map<json> {
                        mergedData = firebaseData.clone();
                    }
                }
            } else {
                log:printError("Failed to create Firebase HTTP client for contact messages", firebaseHttpClientResult);
            }
        }
        _ => {
            log:printWarn("No matching dummy data for path: " + dbPath);
        }
    }
    
    // Step 2: For other paths, fetch live data from Firebase using the original client
    if dbPath != "contact_messages" {
        json|error liveDataResult = firebaseClient.getData(dbPath);
        
        // Step 3: Manually merge the live data into our map.
        if liveDataResult is map<json> {
            foreach var [key, value] in liveDataResult.entries() {
                mergedData[key] = value;
            }
        } else if liveDataResult is error {
            log:printError(string `Failed to get live data for ${dbPath}`, liveDataResult);
        }
    }
    
    // Step 4: Send the combined list to the frontend
    response.statusCode = http:STATUS_OK;
    response.setPayload(mergedData);
    setCorsHeaders(response);
    return response;
}

// Helper function that manually adds the required CORS headers
function setCorsHeaders(http:Response response) {
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}