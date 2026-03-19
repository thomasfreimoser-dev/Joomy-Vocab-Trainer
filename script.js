let allWords = [];
let sessionWords = [];
let currentIndex = 0;
let score = { right: 0, wrong: 0 };
let activeSettings = { front: 'romanized', back: 'english', mixed: false };
let isFlipped = false;

// DOM Elements
const viewSettings = document.getElementById('view-settings');
const viewTrainer = document.getElementById('view-trainer');
const viewSummary = document.getElementById('view-summary');

const inputWordCount = document.getElementById('word-count');
const selectFront = document.getElementById('lang-front');
const selectBack = document.getElementById('lang-back');
const checkMixed = document.getElementById('mode-mixed');
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
    const wordCountEl = document.getElementById('word-count');
    const frontEl = document.getElementById('lang-front');
    const backEl = document.getElementById('lang-back');
    const mixedEl = document.getElementById('mode-mixed');
    
    // Fallback error handling if elements are still missing due to a cached HTML file
    if (!frontEl || !backEl) {
        alert("The new UI elements aren't loaded properly in the HTML yet. Please hard-refresh your browser!");
        return;
    }

    let count = parseInt(wordCountEl.value, 10);
    if (isNaN(count) || count < 1) count = 10;
    if (count > allWords.length) count = allWords.length;

    activeSettings.front = frontEl.value;
    activeSettings.back = backEl.value;
    activeSettings.mixed = mixedEl.checked;

    if (activeSettings.front === activeSettings.back) {
        alert("Please select different languages for Front and Back!");
        return;
    }
    
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
    
    function getLangConfig(langKey) {
        switch(langKey) {
            case 'thai': return { lang: 'Thai', text: wordObj.thai };
            case 'romanized': return { lang: 'Thai (Rom)', text: wordObj.romanized };
            case 'english': return { lang: 'English', text: wordObj.english };
            case 'german': return { lang: 'German', text: wordObj.german };
            default: return { lang: 'Unknown', text: '' };
        }
    }

    let front = getLangConfig(activeSettings.front);
    let back = getLangConfig(activeSettings.back);
    
    // Mixed Mode logic (50% chance to swap front and back)
    if (activeSettings.mixed && Math.random() > 0.5) {
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
        const scene = document.querySelector('.card-scene');
        scene.classList.add('animate-next');
        feedbackControls.classList.add('hidden');
        
        setTimeout(() => {
            // Halfway through animation (opacity 0)
            flashcard.style.transition = 'none';
            showCard();
            
            // Force reflow
            void flashcard.offsetWidth;
            // Restore transition
            flashcard.style.transition = '';
        }, 200);

        setTimeout(() => {
            scene.classList.remove('animate-next');
        }, 400);
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
