// DOM 節點目標
const dialogueText = document.getElementById("dialogueText");
const speakerTag = document.getElementById("speakerTag");
const choiceContainer = document.getElementById("choiceContainer");
const gameViewport = document.getElementById("gameViewport");

// 更新對話框與角色名稱
function updateDialogueUI(rawText) {
    let cleanText = rawText;

    // 1. 處理角色名字標籤 (例如 "林曉婷：" 或 "旁白：")
    const speakerMatch = cleanText.match(/^([^：:\n]+)[：:]/);
    if (speakerMatch) {
        speakerTag.innerText = speakerMatch[1].trim();
        cleanText = cleanText.substring(speakerMatch[0].length);
    } else if (!cleanText.startsWith(" ") && cleanText.length > 1) {
        speakerTag.innerText = "旁白描述";
    }

    // 2. 移除文本中殘留的選項文字，避免對話框內重覆出現選項
    cleanText = cleanText.replace(/^\s*([1-3一二三A-Ca-c\-\*•]|選項)[\.、\s\-\:\)].*$/gm, '');

    dialogueText.innerText = cleanText.trim();
}

// ✨ 強效解析引擎：精準捕捉 AI 生成的 3 個選項並秒變「點擊按鈕」
function parsingChoiceOptions(fullText) {
    choiceContainer.innerHTML = ""; // 清空舊按鈕
    const optionLines = fullText.split('\n');
    let count = 0;
    
    optionLines.forEach(line => {
        const trimmedLine = line.trim();
        // 超強正則表達式：只要行首帶有 1,2,3 或 A,B,C 或 一,二,三，就認定它是選項
        if (trimmedLine.match(/^([1-3A-Ca-c一二三]{1}[\.、\s\-\:\)]|\[選項[1-3]\])/) && count < 3) {
            count++;
            const btn = document.createElement("div");
            btn.classList.add("game-choice-btn");
            
            // 去除行首的數字標號，只留下乾淨的動作或說話內容
            const cleanButtonText = trimmedLine.replace(/^([1-3A-Ca-c一二三]{1}[\.、\s\-\:\)]|\[選項[1-3]\])/, "").trim();
            btn.innerText = cleanButtonText;
            
            // 玩家點擊按鈕後，直接把該選項傳送給 AI 觸發下一段劇情！
            btn.onclick = () => {
                choiceContainer.innerHTML = ""; // 立即清空按鈕防止重覆點擊
                processGameAction(`【玩家選擇了以下行動】：${cleanButtonText}`);
            };
            choiceContainer.appendChild(btn);
        }
    });
}

// 核心劇情推進引擎
async function processGameAction(actionPayloadText) {
    speakerTag.innerText = "因果演算中...";
    dialogueText.innerText = "正在推演時空分歧線，抉擇即刻呈現...";
    choiceContainer.innerHTML = "";

    let runningResponse = "";

    try {
        const responseStream = await puter.ai.chat(actionPayloadText, {
            model: 'gemini-3.1-pro-preview',
            stream: true,
            instructions: `你是一款現代高中校園戀愛養成 Galgame 的文本核心系統。
請嚴格遵守以下指示，與玩家進行互動：

【核心規則】
1. 每一回合請提供極具動漫分鏡感、筆觸細膩且富有情感波折的「場景與心理描述」。
2. 你必須「自己生成三個不同的行為動作或說話選項」供玩家選擇。
3. 為了讓系統能順利將選項轉化為畫面上的點擊按鈕，你必須在文本的【最後三行】，嚴格使用以下格式輸出選項，絕對不要加上額外的括號或解釋：
1. [這裡寫第一個行為或對話選項]
2. [這裡寫第二個行為或對話選項]
3. [這裡寫第三個行為或對話選項]`
        });

        // 流式傳輸文字
        for await (const part of responseStream) {
            if (part?.text) {
                runningResponse += part.text;
                updateDialogueUI(runningResponse);
            }
        }
        
        // 生成 3 個行為按鈕
        parsingChoiceOptions(runningResponse);

    } catch (error) {
        console.error("Game System Error:", error);
        speakerTag.innerText = "系統錯誤";
        dialogueText.innerText = "時空線崩塌，無法載入故事發展。";
    }
}

// 網頁重新整理時，自動啟動遊戲
window.onload = () => {
    processGameAction("【系統啟動】請拉開序幕，以極具畫面感的文筆描述開學第一天早晨的櫻花校園走廊，並引導出跟傲嬌青梅竹馬相遇的初始 3 個行動選項。");
};
