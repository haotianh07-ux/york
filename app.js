import { GoogleGenAI } from "@google/genai";

// ⚠️ REPLACE WITH YOUR ACTUAL GEMINI API KEY
const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

// Initialize the Google Gen AI Client
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Create a stateful chat session using gemini-3.5-flash
const chatSession = ai.chats.create({
    model: "gemini-3.5-flash"
});

// DOM Elements
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Function to append message bubbles to the UI
void function appendMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-message`);
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    
    // Auto-scroll to the bottom of the chat
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to handle sending messages
async function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // 1. Show User Message in UI
    appendMessage(messageText, "user");
    userInput.value = ""; // Clear input

    // 2. Add a temporary loading bubble for the AI
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("message", "ai-message");
    loadingDiv.innerText = "Typing...";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        // 3. Send message to Gemini via the stateful chat session
        const response = await chatSession.sendMessage({
            message: messageText
        });

        // 4. Replace "Typing..." text with the actual AI response
        loadingDiv.innerText = response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        loadingDiv.innerText = "Sorry, something went wrong. Please check your console/API key.";
    }
}

// Event Listeners
sendBtn.addEventListener("click", handleSendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSendMessage();
    }
});
