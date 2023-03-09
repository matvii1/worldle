import targetWords from "./targetWords.js";
import dictionary from "./dictionary.js";

const WORDS_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const keys = [...document.querySelectorAll("[data-key]")];
const smallKeys = keys.map((key) => key.dataset.key.toLowerCase());
const grid = document.querySelector("[data-guess-grid]");
const alertContainer = document.querySelector("[alert-container]");
const keyboard = document.querySelector("[data-keyboard]");

const amountOfWords = targetWords.length;
const randomNum = Math.floor(Math.random() * amountOfWords);
const targetWord = targetWords[randomNum];

console.log(targetWord);

startIntercation();

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);

    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();

    return;
  }

  if (e.target.closest("[data-delete]")) {
    deleteKey();

    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();

    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();

    return;
  }

  if (smallKeys.includes(e.key)) {
    const upperLetter = e.key.toUpperCase();
    pressKey(upperLetter);

    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();

  if (activeTiles.length >= WORDS_LENGTH) {
    return;
  }

  const nextTile = grid.querySelector(":not([data-letter])");

  nextTile.textContent = key;
  nextTile.dataset.letter = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const lastTile = [...getActiveTiles()].at(-1);

  if (lastTile == null) {
    return;
  }

  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];

  if (activeTiles.length !== targetWord.length) {
    showAlert("Too short");
    shakeTiles(activeTiles);

    return;
  }

  const guess = activeTiles.reduce((prevWord, current) => {
    return prevWord + current.dataset.letter.toLowerCase();
  }, "");

  if (!dictionary.includes(guess)) {
    showAlert("Word does not exist");
    shakeTiles(activeTiles);

    return;
  }

  stopInteraction();
  activeTiles.forEach((...params) => {
    flipTile(...params, guess);
  });
}

function getActiveTiles() {
  const activeTiles = document.querySelectorAll('[data-state="active"]');

  return activeTiles;
}

function showAlert(text, duration = 1000) {
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("alert");
  alertDiv.textContent = text;
  alertContainer.prepend(alertDiv);

  setTimeout(() => {
    alertDiv.classList.add("hide");
    alertDiv.addEventListener("transitionend", () => {
      alertDiv.remove();
    });
  }, duration);
}

function shakeTiles(tilesToShake) {
  tilesToShake.forEach((tile) => {
    tile.classList.add("shake");

    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function flipTile(tile, i, arr, word) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"]`);

  setTimeout(() => {
    tile.classList.add("flip");
  }, (i * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");

      checkLetter(letter, i, tile, key);
    },
    { once: true }
  );

  if (i === arr.length - 1) {
    tile.addEventListener(
      "transitionend",
      () => {
        startIntercation();
        checkWinLose(arr, word);
      },
      { once: true }
    );
  }
}

function checkLetter(letter, i, tile, key) {
  const normalizedLetter = letter.toLowerCase();
  const normalizedTargetWord = targetWord.toLowerCase();
  const isCorrect = normalizedTargetWord[i] === normalizedLetter;
  const isExists = normalizedTargetWord.includes(normalizedLetter);

  if (isCorrect) {
    tile.dataset.state = "correct";
    key.dataset.state = "correct";
  }

  if (isExists && !isCorrect) {
    tile.dataset.state = "wrong-location";
    key.dataset.state = "wrong-location";
  }

  if (!isExists) {
    tile.dataset.state = "wrong";
    key.dataset.state = "wrong";
  }
}

function checkWinLose(tiles, guess) {
  const remainingTiles = grid.querySelectorAll(':not([data-state])').length;

  if (guess === targetWord.toLowerCase()) {
    console.log("win");
    showAlert("You win", 10000);
    jumpTiles(tiles);

    stopInteraction();

    return;
  }

  if (remainingTiles === 0) {
    showAlert("You lost ;( \nCorrect word is: " + targetWord.toUpperCase(), 10000);
    stopInteraction();

    return;
  }
}

function jumpTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("jumping");

      tile.addEventListener("transitionend", () => {
        tile.classList.remove("jumping");
      });
    }, (index * FLIP_ANIMATION_DURATION) / 5);
  });

  tiles.forEach((tile, index) => {
    setTimeout((() => {
      tile.classList.add("dance");

      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, FLIP_ANIMATION_DURATION) / 5);
  });
}

function startIntercation() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}
