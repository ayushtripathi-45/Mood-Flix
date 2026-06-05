// js/quiz.js — Psychometric profile parameter dictionary setup and engine runtime
const QUESTIONS = [
  {
    id: 1,
    text: "How are you feeling right now?",
    options: [
      { label: "😊 Happy & Energetic",  scores: { happy: 3 } },
      { label: "😢 Sad or Low",         scores: { sad: 3 } },
      { label: "😌 Calm & Relaxed",     scores: { chill: 3 } },
      { label: "💕 Romantic & Dreamy",  scores: { romantic: 3 } },
      { label: "😤 Stressed or Tense",  scores: { thriller: 3 } },
      { label: "🎯 Focused & Driven",   scores: { focused: 3 } }
    ]
  },
  {
    id: 2,
    text: "What kind of day have you had?",
    options: [
      { label: "🚀 Super productive",   scores: { focused: 2, happy: 1 } },
      { label: "🛋️ Lazy & slow",        scores: { chill: 3 } },
      { label: "💔 Emotionally rough",  scores: { sad: 3 } },
      { label: "🌟 Pretty good overall",scores: { happy: 2 } }
    ]
  },
  {
    id: 3,
    text: "Who are you watching/listening with?",
    options: [
      { label: "👤 Alone",              scores: { chill: 1, sad: 1 } },
      { label: "👫 With partner",       scores: { romantic: 3 } },
      { label: "👨‍👩‍👧 With family",      scores: { happy: 2 } },
      { label: "👯 With friends",       scores: { happy: 2, thriller: 1 } }
    ]
  },
  {
    id: 4,
    text: "Language vector preference?",
    options: [
      { label: "🇮🇳 Hindi / Bollywood", scores: { _lang: "hi" } },
      { label: "🇺🇸 English / Hollywood",scores: { _lang: "en" } },
      { label: "🌍 Dynamic Blend",      scores: { _lang: "both" } }
    ]
  },
  {
    id: 5,
    text: "Select a structural media vibe constraint:",
    options: [
      { label: "😂 Make me laugh",      scores: { happy: 3 } },
      { label: "😭 Move me deeply",        scores: { sad: 3 } },
      { label: "😱 Give me adrenaline",  scores: { thriller: 3 } },
      { label: "🧘 Tranquility block",    scores: { chill: 3 } }
    ]
  },
  {
    id: 6,
    text: "What is your current physiological energy level?",
    options: [
      { label: "🔥 Peak Amplitude",   scores: { happy: 2, thriller: 1 } },
      { label: "🌊 Standard Balance",  scores: { chill: 1, focused: 1 } },
      { label: "🪫 Depleted Storage",  scores: { sad: 1, chill: 2 } }
    ]
  }
];

let currentQuestionIndex = 0;
let answersCollection = [];

function startQuizEngine() {
  const shortcut = localStorage.getItem("shortcut_mood");
  if (shortcut) {
    localStorage.removeItem("shortcut_mood");
    executeOrchestratedPipeline(shortcut, "both");
    return;
  }
  renderQuizStep();
}

function renderQuizStep() {
  const qText = document.getElementById("question-text");
  const optsGrid = document.getElementById("options-grid");
  const progress = document.getElementById("progress");

  if (!qText || !optsGrid) return;

  progress.style.width = `${(currentQuestionIndex / QUESTIONS.length) * 100}%`;
  
  const step = QUESTIONS[currentQuestionIndex];
  qText.textContent = step.text;
  optsGrid.innerHTML = "";

  step.options.forEach(opt => {
    const button = document.createElement("button");
    button.textContent = opt.label;
    button.onclick = () => {
      answersCollection.push(opt.scores);
      if (currentQuestionIndex < QUESTIONS.length - 1) {
        currentQuestionIndex++;
        renderQuizStep();
      } else {
        evaluateQuizMetrics();
      }
    };
    optsGrid.appendChild(button);
  });
}

function evaluateQuizMetrics() {
  document.getElementById("quiz-wrapper").classList.add("hidden");
  document.getElementById("loader-wrapper").classList.remove("hidden");

  const tallies = { happy: 0, sad: 0, chill: 0, romantic: 0, thriller: 0, focused: 0 };
  let language = "both";

  answersCollection.forEach(item => {
    Object.entries(item).forEach(([k, v]) => {
      if (k === "_lang") language = v;
      else tallies[k] += v;
    });
  });

  const finalMoodResult = Object.entries(tallies).sort((a, b) => b[1] - a[1])[0][0];
  
  setTimeout(() => {
    executeOrchestratedPipeline(finalMoodResult, language);
  }, 2000);
}

window.startQuizEngine = startQuizEngine;
window.resetQuizEngine = function () {
  currentQuestionIndex = 0;
  answersCollection = [];
  const quizWrapper = document.getElementById("quiz-wrapper");
  const resultsWrapper = document.getElementById("results-wrapper");
  const loaderWrapper = document.getElementById("loader-wrapper");
  if (quizWrapper) quizWrapper.classList.remove("hidden");
  if (resultsWrapper) resultsWrapper.classList.add("hidden");
  if (loaderWrapper) loaderWrapper.classList.add("hidden");
  renderQuizStep();
};
