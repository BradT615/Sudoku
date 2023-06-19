document.addEventListener("DOMContentLoaded", function() {
  let puzzle;

  function generateSudoku() {
    puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));

    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (let i = 0; i < 9; i++) {
      puzzle[i][i] = nums[i];
    }

    solveSudoku(puzzle);

    let count = 0;
    let targetCount = 60;
    const easyBtn = document.getElementById("easy-btn");
    const mediumBtn = document.getElementById("medium-btn");
    const hardBtn = document.getElementById("hard-btn");
    const expertBtn = document.getElementById("expert-btn");

    if (easyBtn.classList.contains("active")) {
      targetCount = 35;
    } else if (mediumBtn.classList.contains("active")) {
      targetCount = 45;
    } else if (hardBtn.classList.contains("active")) {
      targetCount = 50;
    } else if (expertBtn.classList.contains("active")) {
      targetCount = 60;
    } else {
      easyBtn.classList.add('active');
      targetCount = 35;
    }

    setActiveDifficultyButton(targetCount);
    while (count < targetCount) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        count++;
      }
    }
  }
  // Fisher-Yates algorithm
  function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }
  function setActiveDifficultyButton(targetCount) {
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach((button) => {
      button.classList.remove('active');
    });

    let activeDifficultyButtonId;
    if (targetCount <= 35) {
      activeDifficultyButtonId = "easy-btn";
    } else if (targetCount <= 45) {
      activeDifficultyButtonId = "medium-btn";
    } else if (targetCount <= 50) {
      activeDifficultyButtonId = "hard-btn";
    } else {
      activeDifficultyButtonId = "expert-btn";
    }

    const activeDifficultyButton = document.getElementById(activeDifficultyButtonId);
    activeDifficultyButton.classList.add('active');
  }





  function isValid(num, row, col) {
    for (let i = 0; i < 9; i++) {
      if (puzzle[row][i] === num || puzzle[i][col] === num) {
        return false;
      }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (puzzle[i][j] === num) {
          return false;
        }
      }
    }
    return true;
  }




  function isFilled(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }




  function solveSudoku(puzzle) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (puzzle[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(num, row, col)) {
              puzzle[row][col] = num;
              if (solveSudoku(puzzle)) {
                return true;
              }
              puzzle[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }



  function generate() {
    generateSudoku();

    const box = document.querySelector('.box');
    box.innerHTML = '';

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        const cellValue = puzzle[row][col];
        cell.textContent = cellValue !== 0 ? cellValue : '';
        if (cellValue !== 0) {
          cell.dataset.locked = true;
        }
        box.appendChild(cell);
      }
    }
    addBorders();
  }
  
  generate();


  
  // Event listener for numpad button clicks
  const numButtons = document.querySelectorAll('.num-btn');
  numButtons.forEach((button) => {
    button.addEventListener('click', function(event) {
      const clickedButton = event.target;
      const selectedCell = document.querySelector('.selected');

      if (selectedCell && !selectedCell.hasAttribute('data-locked')) {
        const selectedValue = clickedButton.textContent;
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);

        selectedCell.textContent = selectedValue;
        if (selectedValue !== '') {
          selectedCell.classList.add('filled');
        } else {
          selectedCell.classList.remove('filled');
        }

        // Then perform the checks for the selected cell only
        if (selectedValue !== '' && !isValid(parseInt(selectedValue), row, col)) {
          selectedCell.style.color = '#e55c6c'; // Invalid move
          increaseMistakes();
        } else {
          selectedCell.style.color = '#0072e3';
          // Copy the current puzzle state
          const tempPuzzle = JSON.parse(JSON.stringify(puzzle));
          tempPuzzle[row][col] = parseInt(selectedValue);

          // Check if all cells are filled
          if (isFilled(tempPuzzle) && solveSudoku(tempPuzzle)) {
            const box = document.querySelector('.box');
            box.dataset.filled = true;
          }
        }
      }
    });
  });

  // Event listener for keyboard numpad entries
document.addEventListener('keydown', function(event) {
  const selectedCell = document.querySelector('.selected');

  if (selectedCell && !selectedCell.hasAttribute('data-locked')) {
    const key = event.key;

    if (key >= '0' && key <= '9') {
      event.preventDefault();
      
      const selectedValue = key;
      const row = parseInt(selectedCell.dataset.row);
      const col = parseInt(selectedCell.dataset.col);

      selectedCell.textContent = selectedValue;
      if (selectedValue !== '') {
        selectedCell.classList.add('filled');
      } else {
        selectedCell.classList.remove('filled');
      }

      if (selectedValue !== '' && !isValid(parseInt(selectedValue), row, col)) {
        selectedCell.style.color = '#e55c6c'; // Invalid move
        increaseMistakes();
      } else {
        selectedCell.style.color = '#0072e3';
        // Copy the current puzzle state
        const tempPuzzle = JSON.parse(JSON.stringify(puzzle));
        tempPuzzle[row][col] = parseInt(selectedValue);

        // Check if all cells are filled
        if (isFilled(tempPuzzle) && solveSudoku(tempPuzzle)) {
          const box = document.querySelector('.box');
          box.dataset.filled = true;
        }
      }
    }
  }
});












  // Event listener for difficulty buttons
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach((button) => {
    button.addEventListener('click', function(event) {
      difficultyButtons.forEach((btn) => {
        btn.classList.remove('active');
      });

      button.classList.add('active');
      generate();
      resetGame();
    });
  });

  // Event listener for clear button
  const clearButton = document.querySelector('.clear-btn');
  clearButton.addEventListener('click', function() {
    const selectedCell = document.querySelector('.selected');

    if (selectedCell && !selectedCell.hasAttribute('data-locked')) {
      selectedCell.textContent = '';
      selectedCell.classList.remove('filled');
    }
  });

  // Event listener for solve button
  const solveButton = document.querySelector('.solve-btn');
  solveButton.addEventListener('click', function() {
    const solved = solveSudoku(puzzle);

    if (solved) {
      const box = document.querySelector('.box');
      box.innerHTML = '';

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.dataset.row = row;
          cell.dataset.col = col;
          const cellValue = puzzle[row][col];
          cell.textContent = cellValue !== 0 ? cellValue : '';
          if (cellValue !== 0) {
            cell.dataset.locked = true;
          }
          box.appendChild(cell);
        }
      }
      addBorders();
      box.dataset.filled = true;
    }
  });

  // Event listener for new game button
  const newGameButton = document.querySelector('.new-game-btn');
  newGameButton.addEventListener('click', function() {
    const box = document.querySelector('.box');
    box.removeAttribute('data-filled');
    generate();
    resetGame();
  });

  // Event listener for cell selection
  const box = document.querySelector('.box');
  box.addEventListener('click', function(event) {
    const clickedCell = event.target;
    if (clickedCell.classList.contains('cell')) {
      selectCell(clickedCell);
    }
  });

  // Add border
  function addBorders() {
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 9; i++) {
      for (let j of [2, 5]) {
        cells[i * 9 + j].style.borderRight = '6px solid #344861';
      }
      for (let j of [2, 5]) {
        cells[j * 9 + i].style.borderBottom = '6px solid #344861';
      }
    }
  }

  // Function to highlight related cells
  function selectCell(cell) {
    const selectedCells = document.querySelectorAll('.selected, .selected-main, .selected-related, .same-value');
    selectedCells.forEach((selectedCell) => {
      selectedCell.classList.remove('selected', 'selected-main', 'selected-related', 'same-value');
    });

    cell.classList.add('selected');
    cell.classList.add('selected-main');

    const selectedValue = cell.textContent;

    const allCells = document.querySelectorAll('.cell');
    allCells.forEach((boardCell) => {
      const row = parseInt(boardCell.dataset.row);
      const col = parseInt(boardCell.dataset.col);

      if (boardCell.textContent === selectedValue && selectedValue !== '') {
        boardCell.classList.add('same-value');
      }
      if (row === parseInt(cell.dataset.row) || col === parseInt(cell.dataset.col)) {
        boardCell.classList.add('selected-related');
      }
      if (
        Math.floor(row / 3) === Math.floor(parseInt(cell.dataset.row) / 3) &&
        Math.floor(col / 3) === Math.floor(parseInt(cell.dataset.col) / 3)
      ) {
        boardCell.classList.add('selected-related');
      }
    });
  }
});






let timerInterval;
let time = 0;
let isPaused = false;
const playPauseIcon = document.getElementById('play-pause-icon');
function startTimer() {
  playPauseIcon.src = 'logos/pause.png';
  timerInterval = setInterval(function() {
    if(!isPaused) {
      time++;
      document.getElementById('timer').innerHTML = formatTime(time);
    }
  }, 1000);
}
function pauseTimer() {
  isPaused = !isPaused;
  if (isPaused) {
    playPauseIcon.src = 'logos/play.png';
  } else {
    playPauseIcon.src = 'logos/pause.png';
  }
}
function resetTimer() {
  clearInterval(timerInterval);
  time = 0;
  document.getElementById('timer').innerHTML = formatTime(time);
  playPauseIcon.src = 'logos/play.png';
}
function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
document.getElementById('pause-btn').addEventListener('click', pauseTimer);








let mistakes = 0;
function increaseMistakes() {
  mistakes++;
  document.getElementById('mistakes').innerHTML = mistakes;
  if (mistakes >= 3) {
    endGame();
  }
}
function resetMistakes() {
  mistakes = 0;
  document.getElementById('mistakes').innerHTML = mistakes;
}
function endGame() {
  stopTimer();
  alert("Game Over! You have made 3 mistakes.");
  resetGame();
}
function resetGame() {
  resetMistakes();
  resetTimer();
  startTimer()
  // additional game state reset
}