const input = document.getElementById("input");

const handleIconClick = (str) => {
    input.value += ' ' + str;
    let utterance = new SpeechSynthesisUtterance(str);
    speechSynthesis.speak(utterance);
}

const handleSend = () => {
    let utterance = new SpeechSynthesisUtterance(input.value);
    speechSynthesis.speak(utterance);
    input.value = "";
}

const handleClear = () => {
    input.value = "";
}


// POPULATE PAGE WITH WORDS

// TODO: change img src links once have pictures

// button colors
const colors = [
    "#14A25B",
    "#2D7FD0",
    "#7348B9",
    "#D043A6",
    "#FF4B75",
    "#FF7F35",
    "#FFBB3E"
];


// icons

const table = fetch('/js/words.json')
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


// fanboys conjunctions

const fanboys = fetch('/js/fanboys.json')
    .then(res => res.json())
    .then(data => {
        populateFanboys(data.fanboys)
    })

function populateFanboys(data) {
    const fanboysList = document.getElementsByClassName("fanboys-list")[0];

    fanboysList.innerHTML = data.map((item, index) => (`
        <li>
          <button style="background-color: ${colors[0]}" onclick="handleIconClick('${item.text}')">
              <img src="assets/icon.png" width=35rem height=35rem>
              ${item.text}
            </button>
        </li>
    `)).join('');
}
