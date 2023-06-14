document.addEventListener("DOMContentLoaded", function() {
  // Sudoku puzzle generation function
  function generateSudoku() {
    const puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }));

    // Function to check if a number is valid in a given position
    function isValid(num, row, col) {
      // Check row and column
      for (let i = 0; i < 9; i++) {
        if (puzzle[row][i] === num || puzzle[i][col] === num) {
          return false;
        }
      }

      // Check 3x3 box
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

    // Fill the puzzle with random numbers
    let count = 0;
    while (count < 9) {
      const index = Math.floor(Math.random() * 81);
      const row = Math.floor(index / 9);
      const col = index % 9;
      if (!puzzle[row][col]) {
        let num;
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!isValid(num, row, col));
        puzzle[row][col] = num;
        count++;
      }
    }

    return puzzle;
  }

  // Generate Sudoku puzzle
  const puzzle = generateSudoku();

  // Input numbers into cells
  const box = document.querySelector('.box');
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      const cellValue = puzzle[row][col];
      cell.textContent = cellValue !== undefined ? cellValue : '';
      if (cellValue !== undefined) {
        cell.dataset.locked = true; // Add a "locked" attribute to locked cells
      }
      box.appendChild(cell);
    }
  }

  // Handle cell selection and numpad input
  const cells = document.querySelectorAll('.cell');
  const numButtons = document.querySelectorAll('.num-btn');
  const clearButton = document.querySelector('.clear-btn');
  let selectedCell = null;

  // Apply thick border between squares
  for (let i = 0; i < 9; i++) {
    for (let j of [2, 5]) {
      cells[i * 9 + j].style.borderRight = '5px solid black';
    }
    for (let j of [2, 5]) {
      cells[j * 9 + i].style.borderBottom = '5px solid black';
    }
  }

  // Add event listeners to cells
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      if (!cell.dataset.locked) { // Allow selecting only non-locked cells
        if (selectedCell) {
          selectedCell.classList.remove('selected');
        }
        selectedCell = cell;
        selectedCell.classList.add('selected');
      }
    });
  });

  // Add event listeners to num buttons
  numButtons.forEach(numButton => {
    numButton.addEventListener('click', () => {
      if (selectedCell && !selectedCell.dataset.locked) { // Allow input only in non-locked cells
        const num = parseInt(numButton.textContent);
        if (isValid(num, selectedCell)) {
          selectedCell.textContent = num;
          selectedCell.classList.remove('invalid');
        } else {
          selectedCell.classList.add('invalid');
        }
      }
    });
  });

  // Add event listener to clear button
  clearButton.addEventListener('click', () => {
    if (selectedCell && !selectedCell.dataset.locked) { // Allow clearing only in non-locked cells
      selectedCell.textContent = '';
      selectedCell.classList.remove('invalid');
    }
  });

  // Function to check if a number is valid in a given cell
  function isValid(num, cell) {
    const rowIndex = Math.floor(Array.from(box.children).indexOf(cell) / 9);
    const colIndex = Array.from(cell.parentNode.children).indexOf(cell);
    const row = Array.from(box.children).slice(rowIndex * 9, (rowIndex + 1) * 9);
    const column = Array.from(box.children).filter((_, index) => index % 9 === colIndex);
    const boxRow = Math.floor(rowIndex / 3);
    const boxCol = Math.floor(colIndex / 3);
    const boxStartIndex = (boxRow * 3) * 9 + (boxCol * 3);
    const boxCells = Array.from(box.children).slice(boxStartIndex, boxStartIndex + 3)
      .concat(Array.from(box.children).slice(boxStartIndex + 9, boxStartIndex + 12))
      .concat(Array.from(box.children).slice(boxStartIndex + 18, boxStartIndex + 21));

    // Check row, column, and box
    if (row.some(cell => cell.textContent === num.toString()) ||
        column.some(cell => cell.textContent === num.toString()) ||
        boxCells.some(cell => cell.textContent === num.toString())) {
      return false;
    }

    return true;
  }

  // Function to solve the Sudoku puzzle
  function solve() {
    const emptyCell = findEmptyCell();
    if (!emptyCell) {
      // All cells are filled, puzzle solved
      return true;
    }

    const row = emptyCell.row;
    const col = emptyCell.col;

    for (let num = 1; num <= 9; num++) {
      if (isValid(num, cells[row * 9 + col])) {
        // Try placing the number in the empty cell
        cells[row * 9 + col].textContent = num;

        if (solve()) {
          return true;
        }

        // Backtrack if the number doesn't lead to a solution
        cells[row * 9 + col].textContent = '';
      }
    }

    // No valid number found, backtrack
    return false;
  }

  // Function to find an empty cell in the puzzle
  function findEmptyCell() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (cells[row * 9 + col].textContent === '') {
          return { row, col };
        }
      }
    }
    return null; // No empty cell found
  }

  // Solve Sudoku puzzle when Solve button is clicked
  const solveButton = document.querySelector('.solve-btn');
  solveButton.addEventListener('click', () => {
    if (solve()) {
      // Puzzle solved
      console.log('The Sudoku puzzle is solved.');
    } else {
      // Puzzle unsolvable
      console.log('The Sudoku puzzle is unsolvable.');
    }
  });
});
