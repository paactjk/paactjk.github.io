const input = document.getElementById("input");

const handleIconClick = (str) => {
    input.value += ' ' + str;
    localStorage.setItem('paac-input', input.value);  // saving current prompt
    //let utterance = new SpeechSynthesisUtterance(str);
    //speechSynthesis.speak(utterance);
    getAIpredictions(input.value);
};

const handleSend = () => {
    const text = input.value.trim();

    if (!text) {
        announce("No message to send");
        return;
    }

    speak(text);

    announce(`Message sent`);

    input.value = "";
    localStorage.removeItem('paac-input');
    clearPredictions();
};

const handleClear = () => {
    input.value = "";
    localStorage.removeItem('paac-input');
    clearPredictions();
    announce("Message cleared");
}

const speak = (text) => {
    speechSynthesis.cancel(); // stop previous speech
    speechSynthesis.speak(
        new SpeechSynthesisUtterance(text)
    );
};

// --- AI PREDICTIONS ---

const getAIpredictions = async (currentInput) => {
    const buttons = document.querySelectorAll(".ai button");

    // Show loading state
    buttons.forEach(btn => btn.textContent = "...");

    // detect current page for context
    const page = document.title.includes("Food") ? "food"
               : document.title.includes("Family") ? "family"
               : document.title.includes("School") ? "school"
               : document.title.includes("Health") ? "health"
               : "general";

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3.2:3b",
                prompt: `You are an AAC (Augmentative and Alternative Communication) assistant. The user has a speech or language impairment and is building a sentence word by word by tapping buttons on a communication board.

Current page context: ${page}
Sentence so far: "${currentInput.trim()}"

Suggest exactly 4 short, natural next words or phrases to complete this sentence. Follow these rules:
- Prioritize common, everyday communication needs
- Keep each suggestion brief (1-3 words)
- Make suggestions feel like natural continuations of the sentence
- On the food page, lean toward food-related words
- On the family page, lean toward family/relationship words
- On the school page, lean toward school/learning words
- On the health page, lean toward health/body/feeling words
- On the general page, suggest broadly useful words

Reply with ONLY a JSON array of exactly 4 strings, no explanation, no markdown, no extra text.
Example: ["to eat", "some help", "right now", "with you"]`,
                stream: false
            })
        });

        const data = await response.json();

        // Strip any accidental markdown fences and parse
        const clean = data.response.replace(/```json|```/g, "").trim();
        const suggestions = JSON.parse(clean);

        buttons.forEach((btn, i) => {
            btn.textContent = suggestions[i] ?? "...";
            btn.onclick = () => handleIconClick(suggestions[i]);
        });

        announce("New AI suggestions available");

    } catch (err) {
        console.error("Ollama error:", err);
        buttons.forEach(btn => btn.textContent = "AI unavailable");

        announce("AI suggestions unavailable");
    }
};

const clearPredictions = () => {
    const buttons = document.querySelectorAll(".ai button");
    buttons.forEach(btn => {
        btn.textContent = "AI-generated prompt";
        btn.onclick = () => handleIconClick("AI-generated prompt");
    });
};

// restore saved input across page navigation
const saved = localStorage.getItem('paac-input');
if (saved) {
    input.value = saved;
    getAIpredictions(saved);
}

// --- KEYBOARD ---
let capsOn = false;
let numbersOn = false;

const toggleKeyboard = () => {
    const overlay = document.getElementById('keyboard-overlay');
    overlay.classList.toggle('hidden');
    updateKeyboardPreview();
    if (opening) {
    announce("Keyboard opened");
    }
    if (!opening) {
    announce("Keyboard closed");
    }
}

const toggleCaps = () => {
    capsOn = !capsOn;
    const keys = document.querySelectorAll('.keyboard-row button');
    keys.forEach(btn => {
        if (btn.textContent.length === 1 && btn.textContent.match(/[a-z]/i)) {
            btn.textContent = capsOn ? btn.textContent.toUpperCase() : btn.textContent.toLowerCase();
        }
    });
}

const toggleNumbers = () => {
    numbersOn = !numbersOn;
    const letterRows = ['row-letters-1', 'row-letters-2', 'row-letters-3'];
    const numberRows = ['row-numbers-1', 'row-numbers-2', 'row-numbers-3'];
    const btn = document.getElementById('toggle-123-btn');

    letterRows.forEach(id => document.getElementById(id).classList.toggle('hidden', numbersOn));
    numberRows.forEach(id => document.getElementById(id).classList.toggle('hidden', !numbersOn));
    btn.textContent = numbersOn ? 'ABC' : '123';
}

const keyPress = (key) => {
    if (key === 'backspace') {
        input.value = input.value.slice(0, -1);
    } else {
        const char = (capsOn && key.length === 1) ? key.toUpperCase() : key;
        input.value += char;
        if (capsOn && key.length === 1) { capsOn = false; toggleCaps(); }
    }
    localStorage.setItem('paac-input', input.value);
    updateKeyboardPreview();
}

const keyboardClear = () => {
    input.value = "";
    localStorage.removeItem('paac-input');
    updateKeyboardPreview();
}

const updateKeyboardPreview = () => {
    const preview = document.getElementById('keyboard-preview');
    if (preview) {
        preview.textContent = input.value || 'User input...';
        preview.scrollLeft = preview.scrollWidth;
    }
}

// POPULATE PAGE WITH WORDS

// TODO: change img src links once have pictures

// button colors
const colors = [
    "#79addc",
    "#118ab2",
    "#ef476f",
    "#f78c6b",
    "#ffd166",
    "#ffee93",
    "#06d6a0"
];


// icons

const table = fetch('js/words.json')
.then(res => res.json())
.then(data => {
    populateTable(data)
})

function populateTable(data) {
    const categories = Object.keys(data);

    const tableBody = document.getElementById('table-body');
    const rowCount = 5;

    tableBody.innerHTML = [...Array(rowCount)].map((row, index) => `
        <tr>
            ${categories.map((item, i) => {
                const word = data[item][index];

                return `
                    <td>
                        <button style="background-color: ${colors[i + 2]}" onclick="handleIconClick('${word.text}')">
                            <img src="${word.img}" alt="${word.text}" width="50" height="50">
                            <br />
                            ${word.text}
                        </button>
                    </td>
                `;
            }).join('')} 
        </tr>
    `).join('');
}

const foodtable = fetch('js/foodwords.json')
.then(res => res.json())
.then(data => {
    populateFoodTable(data)
})

function populateFoodTable(data) {
    const categories = Object.keys(data);

    const tableBody = document.getElementById('food-table-body');
    const rowCount = 5;

    tableBody.innerHTML = [...Array(rowCount)].map((row, index) => `
        <tr>
            ${categories.map((item, i) => {
                const word = data[item][index];

                return `
                    <td>
                        <button style="background-color: ${colors[i + 2]}" onclick="handleIconClick('${word.text}')">
                            <img src="${word.img}" alt="${word.text}" width="50" height="50">
                            <br />
                            ${word.text}
                        </button>
                    </td>
                `;
            }).join('')} 
        </tr>
    `).join('');
}

const familytable = fetch('js/familywords.json')
.then(res => res.json())
.then(data => {
    populateFamilyTable(data)
})

function populateFamilyTable(data) {
    const categories = Object.keys(data);

    const tableBody = document.getElementById('family-table-body');
    const rowCount = 5;

    tableBody.innerHTML = [...Array(rowCount)].map((row, index) => `
        <tr>
            ${categories.map((item, i) => {
                const word = data[item][index];

                return `
                    <td>
                        <button style="background-color: ${colors[i + 2]}" onclick="handleIconClick('${word.text}')">
                            <img src="${word.img}" alt="${word.text}" width="50" height="50">
                            <br />
                            ${word.text}
                        </button>
                    </td>
                `;
            }).join('')} 
        </tr>
    `).join('');
}

const healthtable = fetch('js/healthwords.json')
.then(res => res.json())
.then(data => {
    populateHealthTable(data)
})

function populateHealthTable(data) {
    const categories = Object.keys(data);

    const tableBody = document.getElementById('health-table-body');
    const rowCount = 5;

    tableBody.innerHTML = [...Array(rowCount)].map((row, index) => `
        <tr>
            ${categories.map((item, i) => {
                const word = data[item][index];

                return `
                    <td>
                        <button style="background-color: ${colors[i + 2]}" onclick="handleIconClick('${word.text}')">
                            <img src="${word.img}" alt="${word.text}" width="50" height="50">
                            <br />
                            ${word.text}
                        </button>
                    </td>
                `;
            }).join('')} 
        </tr>
    `).join('');
}

const schooltable = fetch('js/schoolwords.json')
.then(res => res.json())
.then(data => {
    populateSchoolTable(data)
})

function populateSchoolTable(data) {
    const categories = Object.keys(data);

    const tableBody = document.getElementById('school-table-body');
    const rowCount = 5;

    tableBody.innerHTML = [...Array(rowCount)].map((row, index) => `
        <tr>
            ${categories.map((item, i) => {
                const word = data[item][index];

                return `
                    <td>
                        <button style="background-color: ${colors[i + 2]}" onclick="handleIconClick('${word.text}')">
                            <img src="${word.img}" alt="${word.text}" width="50" height="50">
                            <br />
                            ${word.text}
                        </button>
                    </td>
                `;
            }).join('')} 
        </tr>
    `).join('');
}


// fanboys conjunctions

const fanboys = fetch('js/fanboys.json')
    .then(res => res.json())
    .then(data => {
        populateFanboys(data.fanboys)
    })

function populateFanboys(data) {
    const fanboysList = document.getElementsByClassName("fanboys-list")[0];

    fanboysList.innerHTML = data.map((item, index) => (`
        <li>
          <button style="background-color: ${colors[0]}" onclick="handleIconClick('${item.text}')">
              <img src="${item.img}" alt="${item.text}" width="35" height="35">
              ${item.text}
            </button>
        </li>
    `)).join('');
}