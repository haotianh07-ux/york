// ==========================================
// York AI - Galgame Chat Bot Configuration
// ==========================================

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
    
    // Auto-scroll to the bottom of the chat container
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

// Function to handle sending messages and getting the streaming AI response
async function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // 1. Display User Choice/Message in UI
    appendMessage(messageText, "user");
    userInput.value = ""; // Clear input field

    // 2. Create an empty AI bubble for the streaming content
    const aiMessageDiv = appendMessage("", "ai");

    try {
        // 3. Request streaming chat response from Gemini 3.1 Pro via Puter
        const responseStream = await puter.ai.chat(messageText, {
            model: 'gemini-3.1-pro-preview', // Advanced reasoning model
            stream: true,
            
            // Your custom Galgame system prompt setup
            instructions: `你是一款校園戀愛養成 Galgame 的遊戲系統。請嚴格遵守以下設定與玩家進行互動：
            
【遊戲背景】現代高中。
【玩家身份】高中二年級學生。

【女主角名單（共 5 位不同類型）】
1. 黑長直學生會長（高冷、理性、私下有反差萌）
2. 傲嬌青梅竹馬（嘴硬心軟、容易吃醋、與玩家互動頻繁）
3. 天然呆學妹（一年級、黏人、經常犯錯需要照顧、非常崇拜學長）
4. 神秘陰角轉學生（話少、帶有神秘過去、只對玩家逐漸敞開心扉）
5. 短髮假小子同桌（平常穿著和舉止像男生，但實際是女生，只有玩家知道這個祕密）

【遊戲機制】
- 每回合代表「一週」的時間。
- 必須包含以下系統：好感度系統（請隱藏或顯式提示好感度變化）、社團活動、特殊青春事件、考試、約會、修羅場。
- 擁有多結局系統（包含單一角色結局、後宮結局、孤狼結局等）。

【演出風格】
- 請使用強烈的「事件 CG 感」文字來描寫畫面（例如：[CG：夕陽下的教室裡，她轉過頭，髮絲隨風飄動...]）。
- 每次對話結束後，必須提供 3~4 個明確的「聊天/行動選項」讓玩家選擇接下來的舉動。

現在，請作為遊戲系統開始第一回合，為玩家介紹開學的第一天，並引導玩家做出第一個選擇。`
        });

        // 4. Stream response text piece by piece into the chat bubble
        for await (const part of responseStream) {
            if (part?.text) {
                aiMessageDiv.innerText += part.text;
                chatBox.scrollTop = chatBox.scrollHeight; // Scroll dynamically
            }
        }
    } catch (error) {
        console.error("Puter/Gemini Error:", error);
        aiMessageDiv.innerText = "系統錯誤：無法載入遊戲，請稍後再試。";
    }
}

// ==========================================
// Event Listeners
// ==========================================

// Click "Send" button
sendBtn.addEventListener("click", handleSendMessage);

// Press "Enter" key inside input field
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSendMessage();
    }
});
