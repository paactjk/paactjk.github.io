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
