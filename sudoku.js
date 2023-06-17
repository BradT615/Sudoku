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
    if (document.getElementById("easy-btn").classList.contains("active")) {
      targetCount = 35;
    } else if (document.getElementById("medium-btn").classList.contains("active")) {
      targetCount = 45;
    } else if (document.getElementById("hard-btn").classList.contains("active")) {
      targetCount = 50;
    }
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


  // Event listener for difficulty buttons
  const difficultyButtons = document.querySelectorAll('.difficulty-btn');
  difficultyButtons.forEach((button) => {
    button.addEventListener('click', function(event) {
      difficultyButtons.forEach((btn) => {
        btn.classList.remove('active');
      });

      button.classList.add('active');
      generate();
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