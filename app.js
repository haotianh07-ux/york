// DOM Elements
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Helper function to append message bubbles to the UI
function appendMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-message`);
    messageDiv.innerText = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

// Function to handle sending messages
async function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // 1. Show User Message in UI
    appendMessage(messageText, "user");
    userInput.value = ""; // Clear input field

    // 2. Add an empty AI bubble for streaming the response
    const aiMessageDiv = appendMessage("", "ai");

    try {
        // 3. Request streaming chat response from Gemini 3.5 Flash via Puter
        const responseStream = await puter.ai.chat(messageText, {
            model: 'gemini-3.5-flash',
            stream: true
        });

        // 4. Read the chunks from the stream and append them live
        for await (const part of responseStream) {
            if (part?.text) {
                // Keep building the response string inside the bubble
                aiMessageDiv.innerText += part.text;
                // Keep auto-scrolling as the message grows
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }
    } catch (error) {
        console.error("Puter/Gemini Error:", error);
        aiMessageDiv.innerText = "Sorry, I encountered an error processing that request.";
    }
}

// Event Listeners for interaction
sendBtn.addEventListener("click", handleSendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSendMessage();
    }
});
