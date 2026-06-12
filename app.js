// DOM Targets
const dialogueText = document.getElementById("dialogueText");
const speakerTag = document.getElementById("speakerTag");
const choiceContainer = document.getElementById("choiceContainer");
const gameViewport = document.getElementById("gameViewport");

// Updates dialogue panels and strips metadata
function updateDialogueUI(rawText) {
    let cleanText = rawText;

    // Optional background changer parsing [CG: url]
    const cgMatch = cleanText.match(/\[CG：(.*?)\]/);
    if (cgMatch && cgMatch[1]) {
        const bgUrl = cgMatch[1].trim();
        if (bgUrl.startsWith('http')) {
            gameViewport.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.4)), url('${bgUrl}')`;
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

    dialogueText.innerText = cleanText.trim();
}

// Scans text chunks to construct 3 beautifully interactive option buttons
function parsingChoiceOptions(fullText) {
    choiceContainer.innerHTML = ""; 
    const optionLines = fullText.split('\n');
    
    optionLines.forEach(line => {
        // Looks for options that start with numbers, letters, or dashes
        if (line.match(/^([1-3A-C一二三]{1}[\.、\s\-\:\)])/)) {
            const btn = document.createElement("div");
            btn.classList.add("game-choice-btn");
            btn.innerText = line.trim();
            
            // Clicking option routes back into game flow loop directly
            btn.onclick = () => {
                choiceContainer.innerHTML = ""; 
                processGameAction(`【玩家選擇了行動】：${line.trim()}`);
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
        const responseStream = await puter.ai.chat(actionPayloadText, {
            model: 'gemini-3.1-pro-preview',
            stream: true,
            instructions: `你是一款校園戀愛養成 Galgame 的文本核心系統。請嚴格依照設定與玩家進行文字互動：
            
【遊戲背景】現代高中。
【玩家身份】高中二年級學生。

【登場女主角陣容（共 5 位不同類型，隨劇情推展交替登場）】
1. 黑長直學生會長（高冷、理性、私下有反差萌）
2. 傲嬌青梅竹馬（嘴硬心軟、容易吃醋、與玩家互動頻繁）
3. 天然呆學妹（一年級、黏人、經常犯錯需要照顧、非常崇拜學長）
4. 神秘陰角轉學生（話少、帶有神秘過去、只對玩家逐漸敞開心扉）
5. 短髮假小子同桌（平常穿著和舉止像男生，但實際是女生，只有玩家知道這個祕密）

【寫作與演出要求】
- 每一回合請提供極具小說描寫感、極為細膩且富有情感波折的「場景與心理描述」。
- 每一段對話或敘述完畢後，你必須在最後一行提供正好 3 個明確的行動選項（分別代表說話、動作或特殊反應）。
- 選項必須嚴格使用以下格式呈現（以便系統解析）：
1. [選項內容描述]
2. [選項內容描述]
3. [選項內容描述]`
        });

        for (await const part of responseStream) {
            if (part?.text) {
                runningResponse += part.text;
                updateDialogueUI(runningResponse);
            }
        }
        
        // Build the option buttons
        parsingChoiceOptions(runningResponse);

    } catch (error) {
        console.error("Game System Error:", error);
        speakerTag.innerText = "系統錯誤";
        dialogueText.innerText = "時空線崩塌，無法載入故事發展。";
    }
}

// Auto-trigger game launch immediately when page finishes loading
window.onload = () => {
    processGameAction("【系統啟動】請拉開序幕，以極具畫面感且精彩細膩的文筆描述開學第一天早晨的校園走廊，並引導出跟某位女主角相遇的初始 3 個行動選項。");
};
