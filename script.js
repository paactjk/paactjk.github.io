const input = document.getElementById("input");

const handleIconClick = (str) => {
    input.value += ' ' + str;
}

const handleSend = () => {
    let utterance = new SpeechSynthesisUtterance(input.value);
    speechSynthesis.speak(utterance);
    input.value = "";
}