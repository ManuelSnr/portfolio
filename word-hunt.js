const words = [
  "DUEPAD", "CRAFT", "CODE", "PIXEL", "COFFEE", "MIDNIGHT", "CHAOS", "FOCUS", 
  "GLITCH", "MAGIC", "VIBES", "HACK", "PIZZA", "DEBUG", "MUSIC", "SLEEP", 
  "ZEN", "LATE", "WIZARD", "ART"
];

const GRID_SIZE = 8;
let scoreYou = 0;
let scoreManuel = 0;
let currentTarget = "";
let currentStreak = 0;
let animationFrameId = null;
let manuelTimeoutId = null;
let startTime = 0;
let totalTime = 0;
let isDragging = false;
let startCell = null;
let currentCells = [];
let gridData = [];
let totalTimeSpent = 0;
let wordsFound = 0;
let fastestTimeMs = Infinity;
let recentWords = [];

const wordGrid = document.getElementById("word-grid");
let targetEl = document.getElementById("target-word");
const progressEl = document.getElementById("manuel-progress");
const statusEl = document.getElementById("hunt-status");
const startBtn = document.getElementById("word-hunt-start");
const targetTextEl = document.getElementById("target-text");
const headerEl = document.querySelector(".word-hunt-header");

// -- AUDIO SYSTEM --
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration, vol=0.1) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playHover() { playTone(800, 'sine', 0.05, 0.02); }
function playSuccess() { 
  playTone(523.25, 'sine', 0.15, 0.05); // C5
  setTimeout(() => playTone(659.25, 'sine', 0.3, 0.05), 100); // E5
}
function playError() { playTone(150, 'sawtooth', 0.3, 0.05); }
function playManuelWin() {
  playTone(300, 'triangle', 0.15, 0.05);
  setTimeout(() => playTone(200, 'triangle', 0.3, 0.05), 150);
}
function playVictory() {
  playTone(523.25, 'sine', 0.2, 0.05);
  setTimeout(() => playTone(659.25, 'sine', 0.2, 0.05), 150);
  setTimeout(() => playTone(783.99, 'sine', 0.4, 0.05), 300);
}
function playDefeat() {
  playTone(400, 'sawtooth', 0.3, 0.05);
  setTimeout(() => playTone(350, 'sawtooth', 0.3, 0.05), 250);
  setTimeout(() => playTone(300, 'sawtooth', 0.5, 0.05), 500);
}

function initEmptyBoard() {
  if (headerEl) headerEl.style.display = '';
  if (targetTextEl) targetTextEl.style.display = "none";
  if (startBtn) startBtn.style.display = "inline-block";
  targetEl.textContent = "???";
  gridData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      gridData[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  renderGrid();
}

function initGame() {
  initAudio();
  if (headerEl) headerEl.style.display = '';
  
  // Re-establish the target word HTML in case it was overwritten previously
  if (targetTextEl) {
    targetTextEl.innerHTML = `FIND: <span id="target-word">???</span>`;
    targetTextEl.style.display = "inline";
    // Must re-query the inner span because we recreated it
    const newTargetEl = document.getElementById("target-word");
    if (newTargetEl) {
      targetEl = newTargetEl;
    }
  }
  
  if (startBtn) startBtn.style.display = "none";
  scoreYou = 0;
  scoreManuel = 0;
  currentStreak = 0;
  totalTimeSpent = 0;
  wordsFound = 0;
  fastestTimeMs = Infinity;
  wordGrid.innerHTML = "";
  
  // Remove existing play again button if it's lingering in the card
  const existingBtn = document.querySelector(".play-again-btn");
  if (existingBtn) existingBtn.remove();
  
  updateScoreboard();
  nextRound();
}

function updateScoreboard() {
  const youSegments = document.querySelectorAll("#health-you .health-segment");
  const manuelSegments = document.querySelectorAll("#health-manuel .health-segment");
  
  youSegments.forEach((seg, i) => {
    if (i < scoreYou) seg.classList.add("filled-you");
    else seg.classList.remove("filled-you");
  });
  
  manuelSegments.forEach((seg, i) => {
    if (i < scoreManuel) seg.classList.add("filled-manuel");
    else seg.classList.remove("filled-manuel");
  });
  
  if (scoreYou >= 5) {
    playVictory();
    endGame("YOU WIN! 🎉");
  } else if (scoreManuel >= 5) {
    playDefeat();
    endGame("MANUEL WINS! 💀");
  }
}

function endGame(msg) {
  statusEl.textContent = "";
  clearTimeout(manuelTimeoutId);
  cancelAnimationFrame(animationFrameId);
  progressEl.style.width = "0%";
  
  let avgTimeStr = "N/A";
  let fastestTimeStr = "N/A";
  if (wordsFound > 0) {
    avgTimeStr = (totalTimeSpent / wordsFound / 1000).toFixed(1) + "s";
    if (fastestTimeMs !== Infinity) {
      fastestTimeStr = (fastestTimeMs / 1000).toFixed(1) + "s";
    }
  }
  
  const isWin = scoreYou >= 5;
  const icon = isWin ? "🏆" : "💀";
  const title = isWin ? "YOU BEAT MANUEL" : "MANUEL WAS FASTER";
  
  // Vary subtitle based on score margin
  let subtitle;
  const margin = Math.abs(scoreYou - scoreManuel);
  if (isWin) {
    if (margin >= 4) subtitle = "Flawless. Manuel didn't stand a chance.";
    else if (margin >= 3) subtitle = "Dominant. That was clinical.";
    else if (margin >= 2) subtitle = "Impressive. You had the edge.";
    else subtitle = "Close call. Manuel almost had you.";
  } else {
    if (margin >= 4) subtitle = "Brutal. Manuel didn't even break a sweat.";
    else if (margin >= 3) subtitle = "Outclassed. He was just faster.";
    else if (margin >= 2) subtitle = "Not bad. You put up a fight.";
    else subtitle = "So close. One more second and you had it.";
  }
  
  // Hide the header (which contains the scoreboard and empty progress bar)
  if (headerEl) headerEl.style.display = 'none';
    
  wordGrid.innerHTML = `
    <div class="victory-screen" style="animation: popIn 0.5s ease forwards;">
      <div class="score-summary" style="margin-bottom: 24px;">
        <span class="score-you">${scoreYou}</span><span class="score-divider">:</span><span class="score-manuel">${scoreManuel}</span>
      </div>
      <div class="victory-icon">${icon}</div>
      <h3 class="victory-title">${title}</h3>
      <p class="victory-subtitle">${subtitle}</p>
      
      <div class="victory-stats-row">
        <div class="stat-box">
          <span class="stat-label">AVG TIME</span>
          <span class="stat-value">${avgTimeStr}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">FASTEST</span>
          <span class="stat-value">${fastestTimeStr}</span>
        </div>
      </div>
      
      <button class="btn btn-dark play-again-btn" onclick="initGame()">Play Again</button>
    </div>
  `;
}

function nextRound() {
  if (scoreYou >= 5 || scoreManuel >= 5) return;
  
  if (currentStreak >= 3) {
    statusEl.innerHTML = `<span class="streak-badge">🔥 ${currentStreak}x STREAK!</span>`;
  } else {
    statusEl.textContent = "Drag to select";
  }
  
  // Pick random word not recently used
  let candidate;
  do {
    candidate = words[Math.floor(Math.random() * words.length)];
  } while (recentWords.includes(candidate));
  
  currentTarget = candidate;
  recentWords.push(currentTarget);
  if (recentWords.length > Math.floor(words.length / 2)) {
    recentWords.shift();
  }
  
  targetEl.textContent = currentTarget;
  
  generateGrid(currentTarget);
  renderGrid();
  startManuelTimer();
}

function generateGrid(target) {
  gridData = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
  
  const orientation = Math.floor(Math.random() * 3);
  let placed = false;
  
  while (!placed) {
    let row = Math.floor(Math.random() * GRID_SIZE);
    let col = Math.floor(Math.random() * GRID_SIZE);
    
    if (canPlaceWord(target, row, col, orientation)) {
      placeWord(target, row, col, orientation);
      placed = true;
    }
  }
  
  // Fill remaining with random letters, heavily weighted with letters from the target word
  // to create optical camouflage (makes scanning much harder)
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (gridData[r][c] === '') {
        if (Math.random() < 0.20) {
          gridData[r][c] = target[Math.floor(Math.random() * target.length)];
        } else {
          gridData[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }
}

function canPlaceWord(word, r, c, o) {
  if (o === 0) return c + word.length <= GRID_SIZE; // H
  if (o === 1) return r + word.length <= GRID_SIZE; // V
  if (o === 2) return r + word.length <= GRID_SIZE && c + word.length <= GRID_SIZE; // D
  return false;
}

function placeWord(word, r, c, o) {
  for (let i = 0; i < word.length; i++) {
    if (o === 0) gridData[r][c + i] = word[i];
    if (o === 1) gridData[r + i][c] = word[i];
    if (o === 2) gridData[r + i][c + i] = word[i];
  }
}

function renderGrid() {
  wordGrid.innerHTML = "";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = gridData[r][c];
      
      cell.addEventListener("pointerdown", onPointerDown);
      cell.addEventListener("pointerenter", onPointerEnter);
      
      wordGrid.appendChild(cell);
    }
  }
}

function onPointerDown(e) {
  isDragging = true;
  startCell = e.target;
  currentCells = [startCell];
  playHover();
  updateSelectionVisuals();
  
  document.addEventListener("pointerup", onPointerUp);
  wordGrid.addEventListener("pointermove", onPointerMove);
}

function onPointerEnter(e) {
  if (!isDragging) return;
  const target = e.target;
  if (!target.classList.contains("grid-cell")) return;
  
  const startR = parseInt(startCell.dataset.r);
  const startC = parseInt(startCell.dataset.c);
  const currR = parseInt(target.dataset.r);
  const currC = parseInt(target.dataset.c);
  
  const dr = currR - startR;
  const dc = currC - startC;
  
  if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
    const oldLength = currentCells.length;
    currentCells = [];
    const steps = Math.max(Math.abs(dr), Math.abs(dc));
    const stepR = dr === 0 ? 0 : dr / steps;
    const stepC = dc === 0 ? 0 : dc / steps;
    
    for (let i = 0; i <= steps; i++) {
      const r = startR + (stepR * i);
      const c = startC + (stepC * i);
      const cell = document.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
      if (cell) currentCells.push(cell);
    }
    
    if (currentCells.length > oldLength) {
      playHover();
    }
  }
  
  updateSelectionVisuals();
}

function onPointerMove(e) {
  if (!isDragging) return;
  if (e.pointerType === "touch") {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.classList.contains("grid-cell") && !currentCells.includes(el)) {
      onPointerEnter({target: el});
    }
  }
}

function onPointerUp(e) {
  isDragging = false;
  document.removeEventListener("pointerup", onPointerUp);
  wordGrid.removeEventListener("pointermove", onPointerMove);
  
  checkSelection();
}

function updateSelectionVisuals() {
  document.querySelectorAll(".grid-cell.selected").forEach(c => c.classList.remove("selected"));
  currentCells.forEach(c => c.classList.add("selected"));
}

function checkSelection() {
  if (currentCells.length === 0) return;
  const selectedWord = currentCells.map(c => c.textContent).join('');
  
  if (selectedWord === currentTarget) {
    playSuccess();
    currentCells.forEach(c => c.classList.add("found"));
    
    const timeTakenMs = performance.now() - startTime;
    let points = 1;
    if (timeTakenMs < 2000) { 
      points = 2;
    }
    
    totalTimeSpent += timeTakenMs;
    wordsFound++;
    if (timeTakenMs < fastestTimeMs) fastestTimeMs = timeTakenMs;
    
    scoreYou += points;
    currentStreak++;
    
    endRound();
  } else {
    playError();
    currentCells.forEach(c => c.classList.add("error"));
    
    const card = document.querySelector(".word-hunt-card");
    if (card) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 400);
    }
    
    setTimeout(() => {
      currentCells.forEach(c => c.classList.remove("error", "selected"));
      currentCells = [];
    }, 300);
    currentStreak = 0;
  }
}

function startManuelTimer() {
  // Adaptive Difficulty: Manuel gets faster as you score more points
  let minTime = 4000;
  let timeRange = 6000; // Base: 4s - 10s
  
  if (scoreYou >= 2) { minTime = 2500; timeRange = 4500; } // 2.5s - 7.0s
  if (scoreYou >= 4) { minTime = 1800; timeRange = 2700; } // 1.8s - 4.5s (Sweat Mode)
  
  totalTime = Math.random() * timeRange + minTime;
  startTime = performance.now();
  
  function updateProgress() {
    const elapsed = performance.now() - startTime;
    const progress = Math.max(0, 100 - (elapsed / totalTime) * 100);
    progressEl.style.width = `${progress}%`;
    
    if (elapsed < totalTime) {
      animationFrameId = requestAnimationFrame(updateProgress);
    } else {
      manuelWinsRound();
    }
  }
  
  animationFrameId = requestAnimationFrame(updateProgress);
}

function manuelWinsRound() {
  scoreManuel++;
  currentStreak = 0;
  statusEl.textContent = "Manuel found it!";
  
  const allCells = document.querySelectorAll('.grid-cell');
  allCells.forEach(c => c.classList.remove('selected'));
  
  let found = [];
  for (let r=0; r<GRID_SIZE; r++) {
    for (let c=0; c<GRID_SIZE; c++) {
      if (checkWordAt(r, c, 0)) { found = getPath(r, c, 0); break; }
      if (checkWordAt(r, c, 1)) { found = getPath(r, c, 1); break; }
      if (checkWordAt(r, c, 2)) { found = getPath(r, c, 2); break; }
    }
    if (found.length) break;
  }
  
  found.forEach((c, idx) => {
    setTimeout(() => {
      c.classList.add("manuel-found");
    }, idx * 100);
  });
  
  playManuelWin();
  
  setTimeout(endRound, 1000);
}

function checkWordAt(r, c, o) {
  let w = "";
  for(let i=0; i<currentTarget.length; i++) {
    if (o===0 && c+i<GRID_SIZE) w += gridData[r][c+i];
    if (o===1 && r+i<GRID_SIZE) w += gridData[r+i][c];
    if (o===2 && r+i<GRID_SIZE && c+i<GRID_SIZE) w += gridData[r+i][c+i];
  }
  if (w === currentTarget) return 1;
  return 0;
}

function getPath(r, c, o) {
  let cells = [];
  for(let i=0; i<currentTarget.length; i++) {
    let rr=r, cc=c;
    if (o===0) cc+=i;
    if (o===1) rr+=i;
    if (o===2) {rr+=i; cc+=i;}
    const el = document.querySelector(`.grid-cell[data-r="${rr}"][data-c="${cc}"]`);
    if(el) cells.push(el);
  }
  return cells;
}

function endRound() {
  cancelAnimationFrame(animationFrameId);
  updateScoreboard();
  progressEl.style.width = "0%";
  
  if (scoreYou < 5 && scoreManuel < 5) {
    manuelTimeoutId = setTimeout(nextRound, 1500);
  }
}

if (startBtn) {
  startBtn.addEventListener("click", initGame);
}

// Show empty board on load
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('word-hunt');
  if (!section) { initEmptyBoard(); return; }
  
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        initEmptyBoard();
        obs.unobserve(section);
      }
    });
  }, { threshold: 0.01 });
  obs.observe(section);
});
