document.addEventListener("DOMContentLoaded", function() {
let puzzle;
const box = document.querySelector('.box');
const numButtons = document.querySelectorAll('.num-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const clearButton = document.querySelector('.clear-btn');
const solveButton = document.querySelector('.solve-btn');
const newGameButton = document.querySelector('.new-game-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
let time = 0;
let isPaused = false;
let timerInterval;
let mistakes = 0;
let cellValues = [];
let selectedCellStore = null;

function generateSudoku() {
puzzle = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => 0));
const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
for (let i = 0; i < 9; i++) {
puzzle[i][i] = nums[i];
}
solveSudoku(puzzle);
let count = 0;
let targetCount = getTargetCount();
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

function shuffleArray(array) {
for (let i = array.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[array[i], array[j]] = [array[j], array[i]];
}
return array;
}

function getTargetCount() {
const easyBtn = document.getElementById("easy-btn");
const mediumBtn = document.getElementById("medium-btn");
const hardBtn = document.getElementById("hard-btn");
const expertBtn = document.getElementById("expert-btn");
if (easyBtn.classList.contains("active")) return 35;
if (mediumBtn.classList.contains("active")) return 45;
if (hardBtn.classList.contains("active")) return 50;
if (expertBtn.classList.contains("active")) return 60;
easyBtn.classList.add('active');
return 35;
}

function setActiveDifficultyButton(targetCount) {
difficultyButtons.forEach((button) => button.classList.remove('active'));
const activeDifficultyButtonId = targetCount <= 35 ? "easy-btn" :
targetCount <= 45 ? "medium-btn" :
targetCount <= 50 ? "hard-btn" : "expert-btn";
document.getElementById(activeDifficultyButtonId).classList.add('active');
}

function isValid(num, row, col) {
for (let i = 0; i < 9; i++) {
if (puzzle[row][i] === num || puzzle[i][col] === num) return false;
}
const startRow = Math.floor(row / 3) * 3;
const startCol = Math.floor(col / 3) * 3;
for (let i = startRow; i < startRow + 3; i++) {
for (let j = startCol; j < startCol + 3; j++) {
if (puzzle[i][j] === num) return false;
}
}
return true;
}

function isFilled() {
return puzzle.every(row => row.every(cell => cell !== 0));
}

function solveSudoku() {
for (let row = 0; row < 9; row++) {
for (let col = 0; col < 9; col++) {
if (puzzle[row][col] === 0) {
for (let num = 1; num <= 9; num++) {
if (isValid(num, row, col)) {
puzzle[row][col] = num;
if (solveSudoku()) return true;
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
box.innerHTML = '';
for (let row = 0; row < 9; row++) {
for (let col = 0; col < 9; col++) {
const cell = document.createElement('div');
cell.classList.add('cell');
cell.dataset.row = row;
cell.dataset.col = col;
const cellValue = puzzle[row][col];
cell.textContent = cellValue !== 0 ? cellValue : '';
if (cellValue !== 0) cell.dataset.locked = true;
box.appendChild(cell);
}
}
addBorders();
box.removeAttribute('data-filled');
}

function handleNumButtonClick(event) {
const clickedButton = event.target;
const selectedCell = document.querySelector('.selected');
if (selectedCell && !selectedCell.hasAttribute('data-locked')) {
const selectedValue = clickedButton.textContent;
const row = parseInt(selectedCell.dataset.row);
const col = parseInt(selectedCell.dataset.col);
selectedCell.textContent = selectedValue;
selectedCell.classList.toggle('filled', selectedValue !== '');
if (selectedValue !== '' && !isValid(parseInt(selectedValue), row, col)) {
selectedCell.style.color = '#e55c6c';
increaseMistakes();
} else {
selectedCell.style.color = '#0072e3';
puzzle[row][col] = parseInt(selectedValue);
if (isFilled() && solveSudoku()) {
box.dataset.filled = true;
}
}
}
}

function handleKeypadEntry(event) {
const selectedCell = document.querySelector('.selected');
if (selectedCell && !selectedCell.hasAttribute('data-locked')) {
const key = event.key;
if (key >= '0' && key <= '9') {
event.preventDefault();
const selectedValue = key;
const row = parseInt(selectedCell.dataset.row);
const col = parseInt(selectedCell.dataset.col);
selectedCell.textContent = selectedValue;
selectedCell.classList.toggle('filled', selectedValue !== '');
if (selectedValue !== '' && !isValid(parseInt(selectedValue), row, col)) {
selectedCell.style.color = '#e55c6c';
increaseMistakes();
} else {
selectedCell.style.color = '#0072e3';
puzzle[row][col] = parseInt(selectedValue);
if (isFilled() && solveSudoku()) {
box.dataset.filled = true;
}
}
}
}
}

function handleDifficultyButtonClick(event) {
difficultyButtons.forEach((btn) => btn.classList.remove('active'));
event.target.classList.add('active');
generate();
resetGame();
}

function handleClearButtonClick() {
const selectedCell = document.querySelector('.selected');
if (selectedCell && !selectedCell.hasAttribute('data-locked')) {
selectedCell.textContent = '';
selectedCell.classList.remove('filled');
}
}

function handleSolveButtonClick() {
if (solveSudoku()) {
box.innerHTML = '';
for (let row = 0; row < 9; row++) {
for (let col = 0; col < 9; col++) {
const cell = document.createElement('div');
cell.classList.add('cell');
cell.dataset.row = row;
cell.dataset.col = col;
const cellValue = puzzle[row][col];
cell.textContent = cellValue !== 0 ? cellValue : '';
if (cellValue !== 0) cell.dataset.locked = true;
box.appendChild(cell);
}
}
addBorders();
box.dataset.filled = true;
}
}

function handleNewGameButtonClick() {
box.removeAttribute('data-filled');
generate();
resetGame();
}

function handleCellClick(event) {
const clickedCell = event.target;
if (clickedCell.classList.contains('cell')) {
selectCell(clickedCell);
}
}

function addBorders() {
const cells = document.querySelectorAll('.cell');
for (let i = 0; i < 9; i++) {
for (let j of [2, 5]) {
cells[i * 9 + j].style.borderRight = '3px solid #344861';
cells[j * 9 + i].style.borderBottom = '3px solid #344861';
}
}
}

function selectCell(cell) {
const selectedCells = document.querySelectorAll('.selected, .selected-main, .selected-related, .same-value');
selectedCells.forEach((selectedCell) => {
selectedCell.classList.remove('selected', 'selected-main', 'selected-related', 'same-value');
});
cell.classList.add('selected', 'selected-main');
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
if (Math.floor(row / 3) === Math.floor(parseInt(cell.dataset.row) / 3) &&
Math.floor(col / 3) === Math.floor(parseInt(cell.dataset.col) / 3)) {
boardCell.classList.add('selected-related');
}
});
}

function startTimer() {
playPauseIcon.src = 'logos/pause.png';
timerInterval = setInterval(function() {
if(!isPaused) {
time++;
document.getElementById('timer').textContent = formatTime(time);
}
}, 1000);
}

function pauseTimer() {
isPaused = !isPaused;
if (isPaused) {
playPauseIcon.src = 'logos/play.png';
selectedCellStore = document.querySelector('.selected-main');
cellValues = Array.from(document.querySelectorAll('.cell')).map(cell => cell.textContent);
document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
document.querySelectorAll('.selected, .selected-main, .selected-related, .same-value').forEach(cell => {
cell.classList.remove('selected', 'selected-main', 'selected-related', 'same-value');
});
} else {
playPauseIcon.src = 'logos/pause.png';
document.querySelectorAll('.cell').forEach((cell, index) => cell.textContent = cellValues[index]);
if (selectedCellStore) {
selectCell(selectedCellStore);
selectedCellStore = null;
}
}
}

function stopTimer() {
clearInterval(timerInterval);
isPaused = true;
playPauseIcon.src = 'logos/play.png';
}

function resetTimer() {
clearInterval(timerInterval);
time = 0;
isPaused = false;
document.getElementById('timer').textContent = formatTime(time);
playPauseIcon.src = 'logos/play.png';
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  seconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function increaseMistakes() {
mistakes++;
document.getElementById('mistakes').textContent = mistakes;
if (mistakes >= 3) setTimeout(endGame, 0);
}

function resetMistakes() {
mistakes = 0;
document.getElementById('mistakes').textContent = mistakes;
}

function endGame() {
stopTimer();
alert("Game Over! You have made 3 mistakes.");
resetGame();
}

function resetGame() {
resetMistakes();
resetTimer();
startTimer();
generate();
}

numButtons.forEach(button => button.addEventListener('click', handleNumButtonClick));
document.addEventListener('keydown', handleKeypadEntry);
difficultyButtons.forEach(button => button.addEventListener('click', handleDifficultyButtonClick));
clearButton.addEventListener('click', handleClearButtonClick);
solveButton.addEventListener('click', handleSolveButtonClick);
newGameButton.addEventListener('click', handleNewGameButtonClick);
box.addEventListener('click', handleCellClick);
document.getElementById('pause-btn').addEventListener('click', pauseTimer);

generate();
startTimer();
});