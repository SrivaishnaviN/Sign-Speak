// DOM Elements
const video = document.getElementById('webcam');
const canvas = document.getElementById('output-canvas');
const ctx = canvas.getContext('2d');
const gestureText = document.getElementById('gesture-text');

// Handle MediaPipe hand detection results
function onHandResults(results) {
    if (!canvas || !ctx) return; // Exit if canvas not ready

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the video frame
    ctx.save();
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Draw hand landmarks if detected
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
            drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
        }
    } else {
        // gestureText.textContent = 'No hand detected';
    }
    ctx.restore();
}

// Initialize MediaPipe Hands
async function initializeHandDetection() {
    try {
        console.log("Initializing hand detection...");
        gestureText.textContent = 'Initializing camera...';

        // Get camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });
        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => resolve();
        });

        // Check if MediaPipe is loaded
        if (typeof Hands === 'undefined') {
            throw new Error('MediaPipe Hands not loaded');
        }

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(onHandResults);

        // Check if Camera is loaded
        if (typeof Camera === 'undefined') {
            throw new Error('MediaPipe Camera not loaded');
        }

        const camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({ image: video });
            },
            width: 640,
            height: 480
        });

        await camera.start();
        gestureText.textContent = 'Camera ready! Show your hand...';
        return camera;

    } catch (error) {
        console.error('Error initializing hand detection:', error);
        gestureText.textContent = 'Error initializing. Please check permissions and refresh.';
        throw error;
    }
}

// Capture image and send to backend for prediction
async function captureAndPredict() {
    if (!video || video.readyState !== 4) return;

    // Create a temporary canvas to get the image data
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(video, 0, 0);

    // Get base64 image data
    const imageData = tempCanvas.toDataURL("image/jpeg").split(',')[1];

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        gestureText.textContent = result.gesture || "Unknown";

    } catch (error) {
        console.error("Prediction error:", error);
        gestureText.textContent = "Prediction failed";
    }
}

// Text-to-Speech function
function speakText() {
    const text = gestureText.textContent.split('(')[0].trim();
    if (text && text !== 'No hand detected' && text !== 'Initializing...' && text !== 'Prediction failed' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN'; // Set to Indian English
        window.speechSynthesis.speak(utterance);
    }
}


// Initialize everything when page loads
async function init() {
    try {
        console.log("Initializing...");
        gestureText.textContent = 'Initializing...';

        // Resize canvas when video loads and window resizes
        const resizeCanvas = () => {
            if (video && canvas) {
                canvas.width = video.clientWidth;
                canvas.height = video.clientHeight;
            }
        };
        video.addEventListener('loadedmetadata', resizeCanvas);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Initialize hand detection
        const camera = await initializeHandDetection();

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if(camera) camera.stop();
            } else {
                if(camera) camera.start();
            }
        });

        // Start prediction loop
        setInterval(captureAndPredict, 2000); // Predict every 2 seconds
        
        // Add speech synthesis trigger
        const speakButton = document.getElementById('speak-button');
        if(speakButton) {
            speakButton.addEventListener('click', speakText);
        }


        console.log("Initialization complete");

    } catch (error) {
        console.error('Initialization error:', error);
        if (gestureText) {
            gestureText.textContent = 'Error initializing. Please refresh and try again.';
        }
    }
}

// Start everything when page loads
window.onload = init;
