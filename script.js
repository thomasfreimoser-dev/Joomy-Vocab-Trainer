// Data & State
let allWords = [];
let sessionWords = [];
let currentIndex = 0;
let score = { right: 0, wrong: 0 };
let currentMode = 'th-en';
let isFlipped = false;

// DOM Elements
const viewSettings = document.getElementById('view-settings');
const viewTrainer = document.getElementById('view-trainer');
const viewSummary = document.getElementById('view-summary');

const inputWordCount = document.getElementById('word-count');
const selectMode = document.getElementById('learning-mode');
const btnStart = document.getElementById('btn-start');

const flashcard = document.getElementById('flashcard');
const frontLang = document.getElementById('front-lang');
const frontWord = document.getElementById('front-word');
const backLang = document.getElementById('back-lang');
const backWord = document.getElementById('back-word');
const hintText = document.getElementById('hint-text');

const feedbackControls = document.getElementById('feedback-controls');
const btnRight = document.getElementById('btn-right');
const btnWrong = document.getElementById('btn-wrong');

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

const scoreRightEl = document.getElementById('score-right');
const scoreWrongEl = document.getElementById('score-wrong');
const btnRestart = document.getElementById('btn-restart');

// Initialization
async function init() {
    try {
        const response = await fetch('vocabs.json');
        allWords = await response.json();
        inputWordCount.max = allWords.length;
        if(allWords.length > 0 && inputWordCount.value > allWords.length) {
            inputWordCount.value = allWords.length;
        }
    } catch (e) {
        console.error("Failed to load vocabs", e);
        viewSettings.innerHTML = `<h2 style="color:var(--danger)">Error loading vocabulary data</h2>`;
    }
}

// Utility: Shuffle Array
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Start Session
btnStart.addEventListener('click', () => {
    let count = parseInt(inputWordCount.value, 10);
    if (isNaN(count) || count < 1) count = 10;
    if (count > allWords.length) count = allWords.length;

    currentMode = selectMode.value;
    
    // Select and shuffle words
    sessionWords = shuffleArray(allWords).slice(0, count);
    
    currentIndex = 0;
    score = { right: 0, wrong: 0 };
    
    switchView(viewSettings, viewTrainer);
    progressContainer.classList.remove('hidden');
    updateProgress();
    showCard();
});

// Display Card
function showCard() {
    isFlipped = false;
    flashcard.classList.remove('is-flipped');
    feedbackControls.classList.add('hidden');
    hintText.classList.remove('hidden');

    const wordObj = sessionWords[currentIndex];
    
    // Determine languages for front and back based on mode
    let front = {}, back = {};
    
    let modeToUse = currentMode;
    if (modeToUse === 'mix') {
        const modes = ['rom-de', 'th-en', 'th-de', 'en-th'];
        modeToUse = modes[Math.floor(Math.random() * modes.length)];
    }

    switch (modeToUse) {
        case 'rom-de':
            front = { lang: 'Thai (Rom)', text: wordObj.romanized };
            back = { lang: 'German', text: wordObj.german };
            break;
        case 'th-en':
            front = { lang: 'Thai', text: wordObj.thai };
            back = { lang: 'English', text: wordObj.english };
            break;
        case 'th-de':
            front = { lang: 'Thai', text: wordObj.thai };
            back = { lang: 'German', text: wordObj.german };
            break;
        case 'en-th':
            front = { lang: 'English', text: wordObj.english };
            back = { lang: 'Thai (Rom)', text: wordObj.romanized };
            break;
    }

    // Randomize direction sometimes in mix mode (e.g. sometimes Thai -> EN, sometimes EN -> Thai)
    if (currentMode === 'mix' && Math.random() > 0.5) {
        let temp = front;
        front = back;
        back = temp;
    }
    
    frontLang.textContent = front.lang;
    frontWord.textContent = front.text;
    backLang.textContent = back.lang;
    backWord.textContent = back.text;
}

// Flip Card
flashcard.addEventListener('click', () => {
    if (!isFlipped) {
        isFlipped = true;
        flashcard.classList.add('is-flipped');
        hintText.classList.add('hidden');
        
        // Slight delay before showing controls for better UX
        setTimeout(() => {
            feedbackControls.classList.remove('hidden');
        }, 300);
    }
});

// Evaluate
btnRight.addEventListener('click', () => handleAnswer(true));
btnWrong.addEventListener('click', () => handleAnswer(false));

function handleAnswer(isRight) {
    if (isRight) score.right++;
    else score.wrong++;

    currentIndex++;
    updateProgress();

    if (currentIndex < sessionWords.length) {
        showCard();
    } else {
        endSession();
    }
}

// Progress
function updateProgress() {
    const percent = (currentIndex / sessionWords.length) * 100;
    progressBar.style.width = `${percent}%`;
}

// End Session
function endSession() {
    switchView(viewTrainer, viewSummary);
    progressContainer.classList.add('hidden');
    
    scoreRightEl.textContent = score.right;
    scoreWrongEl.textContent = score.wrong;
}

// Restart
btnRestart.addEventListener('click', () => {
    switchView(viewSummary, viewSettings);
});

// Utils Views
function switchView(from, to) {
    from.classList.remove('active');
    from.classList.add('hidden');
    
    to.classList.remove('hidden');
    to.classList.add('active');
}

// Run app
document.addEventListener('DOMContentLoaded', init);
