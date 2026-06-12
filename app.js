// DOM Target Core Nodes
const dialogueText = document.getElementById("dialogueText");
const speakerTag = document.getElementById("speakerTag");
const choiceContainer = document.getElementById("choiceContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const gameViewport = document.getElementById("gameViewport");

// Helper function to extract and render inline text elements
function updateDialogueUI(rawText) {
    let cleanText = rawText;

    // 1. Scene Background Image Switcher Trigger Check [CG: URL]
    const cgMatch = cleanText.match(/\[CG：(.*?)\]/);
    if (cgMatch && cgMatch[1]) {
        const bgUrl = cgMatch[1].trim();
        if (bgUrl.startsWith('http')) {
            gameViewport.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4)), url('${bgUrl}')`;
        }
        cleanText = cleanText.replace(/\[CG：.*?\]/, ''); 
    }

    // 2. Character Dialogue Speaker Tag Identification Check
    const speakerMatch = cleanText.match(/^([^：:\n]+)[：:]/);
    if (speakerMatch) {
        speakerTag.innerText = speakerMatch[1].trim();
        cleanText = cleanText.substring(speakerMatch[0].length);
    } else if (!cleanText.startsWith(" ") && cleanText.length > 1) {
        speakerTag.innerText = "系統廣播";
    }

    dialogueText.innerText = cleanText.trim();
}

// Function to scan text strings and generate stylized overlay button nodes
function parsingChoiceOptions(fullText) {
    choiceContainer.innerHTML = ""; 
    
    const optionLines = fullText.split('\n');
    optionLines.forEach(line => {
        // Matches typical numbering patterns like 1., A., or bullet points
        if (line.match(/^([1-4A-D一二三四直接引導引步選擇落項詢問回答探查行動走去看去找]{1,2}[\.、\s\-\:\)])/)) {
            const btn = document.createElement("div");
            btn.classList.add("game-choice-btn");
            btn.innerText = line.trim();
            
            btn.onclick = () => {
                choiceContainer.innerHTML = ""; 
                processGameAction(line.trim());
            };
            choiceContainer.appendChild(btn);
        }
    });
}

// Core game processing engine loops 
async function processGameAction(actionPayloadText) {
    if (!actionPayloadText) return;

    speakerTag.innerText = "因果演算中...";
    dialogueText.innerText = "正在變更命運抉擇線，請稍候...";
    choiceContainer.innerHTML = "";

    let runningResponse = "";

    try {
        const responseStream = await puter.ai.chat(actionPayloadText, {
            model: 'gemini-3.1-pro-preview',
            stream: true,
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

【演出風格與限制】
- 請使用強類的「事件 CG 感」文字描寫畫面。你可以透過在內文加上 [CG：網址] 來動態切換背景圖片（可以使用校園背景圖片網址，若無則不寫）。
- 每次敘述完一段劇情後，必須固定在最後一行提供 3~4 個明確的「聊天/行動選項」讓玩家點擊。`
        });

        for await (const part of responseStream) {
            if (part?.text) {
                runningResponse += part.text;
                updateDialogueUI(runningResponse);
            }
        }
        
        parsingChoiceOptions(runningResponse);

    } catch (error) {
        console.error("Game Loop Failure Handling:", error);
        speakerTag.innerText = "系統錯誤";
        dialogueText.innerText = "無法載入該時間線分支。";
    }
}

// User-Input Command Handlers
function handleManualSubmission() {
    const text = userInput.value.trim();
    if(text) {
        userInput.value = "";
        processGameAction(text);
    }
}

// Event Listeners
sendBtn.addEventListener("click", handleManualSubmission);
userInput.addEventListener("keypress", (e) => { if(e.key === 'Enter') handleManualSubmission(); });

// Auto-start game on page reload
window.onload = () => {
    processGameAction("【系統啟動】請初始化遊戲，展示開學第一天的場景，並提供初始行動選項。");
};
