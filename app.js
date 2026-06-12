// DOM Targets
const dialogueText = document.getElementById("dialogueText");
const speakerTag = document.getElementById("speakerTag");
const choiceContainer = document.getElementById("choiceContainer");
const gameViewport = document.getElementById("gameViewport");

// Updates dialogue panels and strips metadata formatting artifacts
function updateDialogueUI(rawText) {
    let cleanText = rawText;

    // Optional background changer parsing [CG: url]
    const cgMatch = cleanText.match(/\[CG：(.*?)\]/);
    if (cgMatch && cgMatch[1]) {
        const bgUrl = cgMatch[1].trim();
        if (bgUrl.startsWith('http')) {
            gameViewport.style.backgroundImage = `linear-gradient(rgba(255, 184, 108, 0.1), rgba(40, 20, 35, 0.5)), url('${bgUrl}')`;
        }
        cleanText = cleanText.replace(/\[CG：.*?\]/, ''); 
    }

    // Handles speaking role identification tags
    const speakerMatch = cleanText.match(/^([^：:\n]+)[：:]/);
    if (speakerMatch) {
        speakerTag.innerText = speakerMatch[1].trim();
        cleanText = cleanText.substring(speakerMatch[0].length);
    } else if (!cleanText.startsWith(" ") && cleanText.length > 1) {
        speakerTag.innerText = "旁白描述";
    }

    // Clear out raw inline text options array lists from showing inside bottom text container
    cleanText = cleanText.replace(/^\s*([1-3一二三A-Ca-c\-\*•]|選項)[\.、\s\-\:\)].*$/gm, '');

    dialogueText.innerText = cleanText.trim();
}

// Scans text streams to construct exactly 3 beautifully interactive option buttons
function parsingChoiceOptions(fullText) {
    choiceContainer.innerHTML = ""; 
    const optionLines = fullText.split('\n');
    let count = 0;
    
    optionLines.forEach(line => {
        const trimmedLine = line.trim();
        // Verifies numerical string line patterns matching choice options layout formatting
        if (trimmedLine.match(/^([1-3A-Ca-c一二三]{1}[\.、\s\-\:\)]|\[選項[1-3]\])/) && count < 3) {
            count++;
            const btn = document.createElement("div");
            btn.classList.add("game-choice-btn");
            
            // Clean out line index parameters to present neat button action text labels
            const cleanButtonText = trimmedLine.replace(/^([1-3A-Ca-c一二三]{1}[\.、\s\-\:\)]|\[選項[1-3]\])/, "").trim();
            btn.innerText = cleanButtonText;
            
            // Clicking option routes directly into processing logic
            btn.onclick = () => {
                choiceContainer.innerHTML = ""; 
                processGameAction(`【玩家選擇了以下行動】：${cleanButtonText}`);
            };
            choiceContainer.appendChild(btn);
        }
    });
}

// Core Story Process Loop
async function processGameAction(actionPayloadText) {
    speakerTag.innerText = "因果演算中...";
    dialogueText.innerText = "正在推演時空分歧線，抉擇即刻呈現...";
    choiceContainer.innerHTML = "";

    let runningResponse = "";

    try {
        // Query global puter.js package stream instance
        const responseStream = await puter.ai.chat(actionPayloadText, {
            model: 'gemini-3.1-pro-preview',
            stream: true,
            instructions: `你是一款現代高中校園戀愛養成 Galgame 的文本核心系統。
請嚴格依照設定與玩家進行互動：

【核心規則】
1. 每一回合請提供極具動漫分鏡感、筆觸細膩且富有情感波折的簡短「場景與心理描述」。
2. 你必須自行生成三個截然不同的行為動作或說話語句選項供玩家選擇。
3. 為利解析引擎處理，你必須在輸出文本的【最後三行】，嚴格使用以下數字序號開頭格式輸出選項內容，不可夾帶任何其他符號或說明：
1. 第一個行為或對話選項
2. 第二個行為或對話選項
3. 第三個行為或對話選項`
        });

        // Loop array async text parts
        for await (const part of responseStream) {
            if (part?.text) {
                runningResponse += part.text;
                updateDialogueUI(runningResponse);
            }
        }
        
        // Finalize layout loop array options instantiation
        parsingChoiceOptions(runningResponse);

    } catch (error) {
        console.error("Game System Error Trace:", error);
        speakerTag.innerText = "系統錯誤";
        dialogueText.innerText = "命運線連線中斷，無法讀取故事。請重新載入。";
    }
}

// Auto-trigger landing screen state arrangement configurations upon component loading finishes
window.onload = () => {
    speakerTag.innerText = "遊戲主選單";
    dialogueText.innerText = "歡迎來到校園戀愛養成遊戲。粉色戀愛序幕已備就，請點擊上方按鈕開始啟程。";
    choiceContainer.innerHTML = "";

    // Generate the Landing Title button structure
    const startBtn = document.createElement("div");
    startBtn.classList.add("game-choice-btn");
    startBtn.innerText = "🌸 開始遊戲 (Start Game) 🌸";
    
    startBtn.onclick = () => {
        choiceContainer.innerHTML = ""; 
        processGameAction("【系統啟動】請拉開序幕，以極具畫面感的文筆描述開學第一天早晨的櫻花校園走廊，並引導出跟傲嬌青梅竹馬相遇的初始 3 個行動選項。");
    };
    
    choiceContainer.appendChild(startBtn);
};
