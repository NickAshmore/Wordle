// Goal of javascript file: Read HTML elements. Attach levent listeners (keypresses, clicks). Run game logic. Update the DOM
// script.js — frontend-only Wordle logic (no backend)

document.addEventListener("DOMContentLoaded", function () {
  // ====== CONFIG ======
  const ROWS = 6;
  const COLS = 5;

  // Small built-in word list (you can expand later)
  const WORDS = [
    "crane", "slate", "trace", "adieu", "stare", "raise", "cigar", "rebut",
    "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve",
    "heath", "dwarf", "model", "karma", "grade", "quiet", "bench", "abide"
  ];

  // Pick a random answer
  const answer = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();

  // ====== STATE ======
  let currentRow = 0;
  let currentCol = 0;
  let gameOver = false;

  // board[r][c] = "A" .. "Z" or ""
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push("");
    board.push(row);
  }

  // ====== DOM BUILD ======
  const grid = document.getElementById("grid");
  const keyboard = document.getElementById("keyboard");

  // Create 30 tiles inside #grid (CSS grid will place them)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.id = tileId(r, c);
      grid.appendChild(tile);
    }
  }

  // Build on-screen keyboard (optional but nice)
  const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  for (let i = 0; i < KEY_ROWS.length; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    // Add Enter / Backspace on last row
    if (i === 2) rowDiv.appendChild(makeKey("ENTER", "Enter"));

    for (let k = 0; k < KEY_ROWS[i].length; k++) {
      rowDiv.appendChild(makeKey(KEY_ROWS[i][k], KEY_ROWS[i][k]));
    }

    if (i === 2) rowDiv.appendChild(makeKey("BACKSPACE", "⌫"));

    keyboard.appendChild(rowDiv);
  }

  // ====== INPUT HANDLING ======
  document.addEventListener("keydown", function (e) {
    handleInput(e.key);
  });

  keyboard.addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;
    handleInput(btn.dataset.key);
  });

  function handleInput(key) {
    if (gameOver) return;

    if (key === "Backspace" || key === "BACKSPACE") {
      backspace();
      return;
    }

    if (key === "Enter" || key === "ENTER") {
      submitGuess();
      return;
    }

    // Letters
    if (typeof key === "string" && key.length === 1 && isLetter(key)) {
      typeLetter(key.toUpperCase());
    }
  }

  // ====== ACTIONS ======
  function typeLetter(letter) {
    if (currentCol >= COLS) return;
    board[currentRow][currentCol] = letter;
    setTileText(currentRow, currentCol, letter);
    currentCol++;
  }

  function backspace() {
    if (currentCol <= 0) return;
    currentCol--;
    board[currentRow][currentCol] = "";
    setTileText(currentRow, currentCol, "");
    clearTileState(currentRow, currentCol);
  }

  function submitGuess() {
    if (currentCol !== COLS) return; // require full 5 letters

    const guess = board[currentRow].join("");
    // Optional validation: only accept guesses that are in WORDS
    // (Comment this out if you want to accept any 5-letter string)
    if (!isKnownWord(guess)) {
      flashRow(currentRow);
      return;
    }

    const result = scoreGuess(guess, answer); // array of "correct"/"present"/"absent"

    // Apply colors to tiles + keyboard
    for (let c = 0; c < COLS; c++) {
      setTileState(currentRow, c, result[c]);
      updateKeyState(guess[c], result[c]);
    }

    if (guess === answer) {
      gameOver = true;
      return;
    }

    currentRow++;
    currentCol = 0;

    if (currentRow >= ROWS) {
      gameOver = true;
    }
  }

  // ====== WORDLE SCORING (handles repeats correctly) ======
  function scoreGuess(guess, ans) {
    // First pass: mark correct, and count remaining letters in answer
    const out = new Array(COLS).fill("absent");
    const remaining = {}; // letter -> count

    for (let i = 0; i < COLS; i++) {
      if (guess[i] === ans[i]) {
        out[i] = "correct";
      } else {
        const ch = ans[i];
        remaining[ch] = (remaining[ch] || 0) + 1;
      }
    }

    // Second pass: mark present if letter exists in remaining pool
    for (let i = 0; i < COLS; i++) {
      if (out[i] === "correct") continue;
      const ch = guess[i];
      if (remaining[ch] > 0) {
        out[i] = "present";
        remaining[ch]--;
      }
    }

    return out;
  }

  // ====== DOM HELPERS ======
  function tileId(r, c) {
    return "tile-" + r + "-" + c;
  }

  function getTile(r, c) {
    return document.getElementById(tileId(r, c));
  }

  function setTileText(r, c, text) {
    const tile = getTile(r, c);
    tile.textContent = text;
  }

  function clearTileState(r, c) {
    const tile = getTile(r, c);
    tile.classList.remove("correct", "present", "absent");
  }

  function setTileState(r, c, state) {
    const tile = getTile(r, c);
    tile.classList.remove("correct", "present", "absent");
    tile.classList.add(state);
  }

  function makeKey(keyValue, label) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.key = keyValue;
    btn.textContent = label;
    return btn;
  }

  // Keyboard coloring: don't downgrade (correct > present > absent)
  function updateKeyState(letter, state) {
    const btn = keyboard.querySelector(`button[data-key="${letter}"]`);
    if (!btn) return;

    const rank = { absent: 1, present: 2, correct: 3 };
    const current =
      btn.classList.contains("correct") ? "correct" :
      btn.classList.contains("present") ? "present" :
      btn.classList.contains("absent")  ? "absent"  : null;

    if (current && rank[current] >= rank[state]) return;

    btn.classList.remove("correct", "present", "absent");
    btn.classList.add(state);
  }

  function flashRow(r) {
    // Simple visual hint using the tiles' border color briefly (no extra CSS required)
    for (let c = 0; c < COLS; c++) {
      const tile = getTile(r, c);
      tile.style.borderColor = "red";
    }
    setTimeout(function () {
      for (let c = 0; c < COLS; c++) {
        const tile = getTile(r, c);
        tile.style.borderColor = "";
      }
    }, 250);
  }

  function isLetter(ch) {
    const code = ch.toUpperCase().charCodeAt(0);
    return code >= 65 && code <= 90;
  }

  function isKnownWord(guessUpper) {
    const guessLower = guessUpper.toLowerCase();
    for (let i = 0; i < WORDS.length; i++) {
      if (WORDS[i] === guessLower) return true;
    }
    return false;
  }

  // Debug: uncomment to see the answer in console
  // console.log("Answer:", answer);
});
