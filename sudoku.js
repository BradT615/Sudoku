document.addEventListener("DOMContentLoaded", function() {
  // Sudoku puzzle generation function
  function generateSudoku() {
    const puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
  
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
  
    function solveSudoku() {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (puzzle[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(num, row, col)) {
                puzzle[row][col] = num;
                if (solveSudoku()) {
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
  
    // Generate a fully solved puzzle
    solveSudoku();
  
    // Remove numbers
    let count = 0;
    while (count < 64) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        count++;
      }
    }
    return puzzle;
  }

  function generate() {
    const puzzle = generateSudoku();
  
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
          cell.dataset.locked = true; // Add a "locked" attribute to locked cells
        }
        box.appendChild(cell);
      }
    }
  }

  generate();














  // Event listener for cell selection
  const box = document.querySelector('.box');
  box.addEventListener('click', function(event) {
    const clickedCell = event.target;
    if (clickedCell.classList.contains('cell')) {
      selectCell(clickedCell);
    }
  });

  // Add border
  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < 9; i++) {
    for (let j of [2, 5]) {
      cells[i * 9 + j].style.borderRight = '6px solid #344861';
    }
    for (let j of [2, 5]) {
      cells[j * 9 + i].style.borderBottom = '6px solid #344861';
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
