// DOM Targets
const dialogueText = document.getElementById("dialogueText");
const speakerTag = document.getElementById("speakerTag");
const choiceContainer = document.getElementById("choiceContainer");
const gameViewport = document.getElementById("gameViewport");

// Updates dialogue panels and cleans formatting artifacts
function updateDialogueUI(rawText) {
    let cleanText = rawText;

    // 1. Handles speaking role identification tags (e.g., "林曉婷：" or "旁白：")
    const speakerMatch = cleanText.match(/^([^：:\n]+)[：:]/);
    if (speakerMatch) {
        speakerTag.innerText = speakerMatch[1].trim();
        cleanText = cleanText.substring(speakerMatch[0].length);
    } else if (!cleanText.startsWith(" ") && cleanText.length > 1) {
        speakerTag.innerText = "旁白描述";
    }

    // 2. Clear out raw inline text list choices from the bottom dialogue window box
    cleanText = cleanText.replace(/^\s*([1-3一二三A-Ca-c\-\*•]|選項)[\.、\s\-\:\)].*$/gm, '');

    dialogueText.innerText = cleanText.trim();
}

// Scans text streams to construct exactly 3 beautifully interactive option buttons
function parsingChoiceOptions(fullText) {
    choiceContainer.innerHTML = ""; // Clear current dynamic buttons
    const optionLines = fullText.split('\n');
    let count = 0;
    
    optionLines.forEach(line => {
        const trimmedLine = line.trim();
        // Regex catch: checks if line starts with 1., 2., 3. or A, B, C or 一, 二, 三
        if (trimmedLine.match(/^([1-3A-Ca-c一二三]{1}[\.、\s\-\:\)]|\[選項[1-3]\])/) && count < 3) {
            count++;
            const btn = document.createElement("div");
            btn.classList.add("game-choice-btn");
            
            // Clean up the numbers from the button label string
            const cleanButtonText = trimmedLine.replace(/^([1-3A-Ca-c一二三]{1}[\.、\s\-\:\)]|\[選項[1-3]\])/, "").trim();
            btn.innerText = cleanButtonText;
            
            // Clicking option routes back into game loop flow directly
            btn.onclick = () => {
                choiceContainer.innerHTML = ""; // Instantly clear buttons to prevent multi-clicking
                processGameAction(`【玩家選擇了以下行動】：${cleanButtonText}`);
            };
            choiceContainer.appendChild(btn);
        }
    });
}

// Core AI Story Generation Process Loop
async function processGameAction(actionPayloadText) {
    speakerTag.innerText = "因果演算中...";
    dialogueText.innerText = "正在推演時空分歧線，抉擇即刻呈現...";
    choiceContainer.innerHTML = "";

    let runningResponse = "";

    try {
        // Calling Puter.js Global AI Chat
        const responseStream = await puter.ai.chat(actionPayloadText, {
            model: 'gemini-3.1-pro-preview',
            stream: true,
            instructions: `你是一款現代高中校園戀愛養成 Galgame 的文本核心系統。
請嚴格遵守以下指示，與玩家進行互動：

【核心規則】
1. 每一回合請提供極具動漫分鏡感、筆觸細膩且富有情感波折的「場景與心理描述」。
2. 你必須自己生成三個不同的「行為動作」或「說話選項」供玩家選擇。
3. 為了讓系統能順利將選項轉化為畫面上的點擊按鈕，你必須在文本的【最後三行】，嚴格使用以下數字格式輸出選項，絕對不要加上額外的括號或解釋：
1. 第一個行為或對話選項
2. 第二個行為或對話選項
3. 第三個行為或對話選項`
        });

        // Dynamic streaming engine
        for await (const part of responseStream) {
            if (part?.text) {
                runningResponse += part.text;
                updateDialogueUI(runningResponse);
            }
        }
        
        // Scan response text output to append the 3 visual decision buttons
        parsingChoiceOptions(runningResponse);

    } catch (error) {
        console.error("Game System Error:", error);
        speakerTag.innerText = "系統錯誤";
        dialogueText.innerText = "時空網路連線中斷，無法載入故事發展。請檢查網路或重整網頁。";
    }
}

// ✨ INITIAL START BUTTON OVERLAY LOGIC
window.onload = () => {
    // Set landing configuration
    speakerTag.innerText = "遊戲主選單";
    dialogueText.innerText = "歡迎來到校園戀愛養成遊戲。請點擊上方按鈕拉開青春序幕。";
    choiceContainer.innerHTML = "";

    // Create the Start Game button node
    const startBtn = document.createElement("div");
    startBtn.classList.add("game-choice-btn");
    startBtn.innerText = "🌸 開始遊戲 (Start Game) 🌸";
    
    startBtn.onclick = () => {
        choiceContainer.innerHTML = ""; // Remove start button
        // Wake up AI to build scene
        processGameAction("【系統啟動】請拉開序幕，以極具畫面感的文筆描述開學第一天早晨的櫻花校園走廊，並引導出跟傲嬌青梅竹馬相遇的初始 3 個行動選項。");
    };
    
    choiceContainer.appendChild(startBtn);
};
