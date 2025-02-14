class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.initialGrid = null;
        this.difficulty = {
            'easy': 35,
            'medium': 45,
            'hard': 50,
            'expert': 60
        };
        this.selectedCell = null;
        this.mistakes = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isPaused = false;
        
        this.initializeDOM();
        this.setupEventListeners();
        this.newGame('easy');
    }

    initializeDOM() {
        this.domElements = {
            grid: document.getElementById('sudoku-grid'),
            cells: Array.from(document.querySelectorAll('#sudoku-grid > div')),
            difficultyBtns: document.querySelectorAll('#difficulty-controls button'),
            numButtons: document.querySelectorAll('#numpad button'),
            clearBtn: document.querySelector('.clear-btn'),
            solveBtn: document.querySelector('.solve-btn'),
            newGameBtn: document.querySelector('.new-game-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            mistakesDisplay: document.getElementById('mistakes'),
            timerDisplay: document.getElementById('timer'),
            playPauseIcon: document.getElementById('play-pause-icon')
        };
    }

    setupEventListeners() {
        this.domElements.numButtons.forEach(btn => 
            btn.addEventListener('click', () => this.handleNumberInput(btn.textContent))
        );
        
        this.domElements.clearBtn.addEventListener('click', () => this.clearCell());
        this.domElements.solveBtn.addEventListener('click', () => this.solvePuzzle());
        this.domElements.newGameBtn.addEventListener('click', () => this.newGame());
        this.domElements.pauseBtn.addEventListener('click', () => this.togglePause());

        this.domElements.cells.forEach(cell => 
            cell.addEventListener('click', (e) => this.selectCell(e.target))
        );

        this.domElements.grid.addEventListener('click', (e) => {
            if (this.isPaused && (e.target === this.domElements.grid || this.domElements.grid.contains(e.target))) {
                this.togglePause();
            }
        });

        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));

        this.domElements.difficultyBtns.forEach(btn => 
            btn.addEventListener('click', () => {
                const difficulty = btn.textContent.toLowerCase();
                this.newGame(difficulty);
                this.updateDifficultyUI(btn);
            })
        );
    }

    updateDifficultyUI(activeBtn) {
        this.domElements.difficultyBtns.forEach(btn => {
            btn.classList.remove('difficulty-btn-active');
            btn.classList.add('difficulty-btn-inactive');
        });
        activeBtn.classList.remove('difficulty-btn-inactive');
        activeBtn.classList.add('difficulty-btn-active');
    }

    newGame(difficulty = 'medium') {
        this.resetGame();
        this.generatePuzzle(this.difficulty[difficulty]);
        this.initialGrid = this.grid.map(row => [...row]);
        this.renderGrid();
        this.startTimer();
    }

    resetGame() {
        // Reset game state
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.mistakes = 0;
        this.updateMistakes();
        this.resetTimer();
        this.selectedCell = null;
        this.isPaused = false;
        this.updatePauseButton();
    
        // Clear all state-related classes from cells
        this.domElements.cells.forEach(cell => {
            cell.classList.remove(
                'cell-selected',
                'cell-related',
                'cell-same-value',
                'cell-error',
                'cell-user-input',
                'text-slate-900',
                'dark:text-white',
                'text-blue-600',
                'dark:text-blue-400'
            );
        });
    }

    generatePuzzle(emptyCells) {
        this.generateSolvedGrid();
        let positions = Array.from({length: 81}, (_, i) => [Math.floor(i/9), i%9]);
        positions = this.shuffle(positions);
        
        for (let i = 0; i < emptyCells && i < positions.length; i++) {
            const [row, col] = positions[i];
            this.grid[row][col] = 0;
        }
    }

    generateSolvedGrid() {
        const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let i = 0; i < 9; i++) {
            this.grid[i][i] = nums[i];
        }
        this.solve(true);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    solve(initial = false) {
        const empty = this.findEmpty();
        if (!empty) return true;

        const [row, col] = empty;
        const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of nums) {
            if (this.isValid(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solve(initial)) {
                    if (!initial) this.renderGrid();
                    return true;
                }
                this.grid[row][col] = 0;
            }
        }
        return false;
    }

    solvePuzzle() {
        this.solve();
        this.renderGrid();
        this.stopTimer();
    }

    findEmpty() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) return [row, col];
            }
        }
        return null;
    }

    isValid(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (x !== col && this.grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (x !== row && this.grid[x][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row && c !== col && this.grid[r][c] === num) return false;
            }
        }

        return true;
    }

    handleNumberInput(num) {
        if (!this.selectedCell || this.isPaused) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        if (this.initialGrid[row][col] !== 0) return;
        
        const val = parseInt(num);
        this.grid[row][col] = val;
        this.selectedCell.textContent = val;
        
        if (!this.isValid(row, col, val)) {
            this.selectedCell.classList.remove('cell-user-input');
            this.selectedCell.classList.add('cell-error');
            this.increaseMistakes();
        } else {
            this.selectedCell.classList.remove('cell-error');
            this.selectedCell.classList.add('cell-user-input');
            if (this.isSolved()) this.handleWin();
        }
    }

    handleKeyboardInput(e) {
        if (this.isPaused) return;
        
        if (/^[1-9]$/.test(e.key)) {
            this.handleNumberInput(e.key);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            this.clearCell();
        }
    }


    selectCell(cell) {
        if (this.isPaused) return;
    
        // Remove selected class from all cells
        this.domElements.cells.forEach(c => {
            c.classList.remove('cell-selected');
        });
    
        // Add selected class to clicked cell
        cell.classList.add('cell-selected');
        this.selectedCell = cell;
        this.highlightRelatedCells(cell);
    }

    highlightRelatedCells(selectedCell) {
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        const selectedValue = selectedCell.textContent;
    
        this.domElements.cells.forEach(cell => {
            if (cell === selectedCell) return;
    
            const cellRow = parseInt(cell.dataset.row);
            const cellCol = parseInt(cell.dataset.col);
            
            const isInSameRow = cellRow === row;
            const isInSameCol = cellCol === col;
            const isInSameBox = Math.floor(cellRow / 3) === Math.floor(row / 3) && 
                               Math.floor(cellCol / 3) === Math.floor(col / 3);
            const hasSameValue = selectedValue && cell.textContent === selectedValue;
    
            cell.classList.toggle('cell-related', isInSameRow || isInSameCol || isInSameBox);
            cell.classList.toggle('cell-same-value', hasSameValue);
        });
    }

    clearCell() {
        if (!this.selectedCell || this.isPaused) return;
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        
        if (this.initialGrid[row][col] !== 0) return;
        
        this.grid[row][col] = 0;
        this.selectedCell.textContent = '';
        this.selectedCell.classList.remove('cell-error', 'cell-user-input');
    }

renderGrid() {
    this.domElements.cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = this.grid[row][col];
        
        cell.textContent = value || '';
        
        // Preserve highlighting classes
        const hasHighlight = cell.classList.contains('cell-same-value');
        
        if (this.initialGrid && this.initialGrid[row][col] !== 0) {
            cell.classList.add('text-slate-900', 'dark:text-white');
            // Don't override the highlight if it exists
            if (!hasHighlight) {
                cell.classList.remove('text-blue-600', 'dark:text-blue-400');
            }
        } else {
            cell.classList.remove('text-slate-900', 'dark:text-white');
            // Don't override the highlight if it exists
            if (!hasHighlight) {
                cell.classList.add('text-blue-600', 'dark:text-blue-400');
            }
        }
    });
}

    isSolved() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0 || !this.isValid(row, col, this.grid[row][col])) {
                    return false;
                }
            }
        }
        return true;
    }
    
    handleWin() {
        this.stopTimer();
        
        // Create and show toast
        const toast = document.createElement('div');
        toast.className = `
            fixed bottom-4 left-1/2 -translate-x-1/2 transform
            flex items-center gap-2
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            px-6 py-4 rounded-lg shadow-lg
            border border-gray-200 dark:border-gray-700
            transition-all duration-300 ease-in-out
            translate-y-full opacity-0
            z-50
        `;
    
        const icon = document.createElement('div');
        icon.className = 'w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center';
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" 
                 class="h-6 w-6 text-green-500" 
                 fill="none" 
                 viewBox="0 0 24 24" 
                 stroke="currentColor">
                <path stroke-linecap="round" 
                      stroke-linejoin="round" 
                      stroke-width="2" 
                      d="M5 13l4 4L19 7" />
            </svg>
        `;
    
        const content = document.createElement('div');
        content.className = 'flex flex-col';
        
        const title = document.createElement('h3');
        title.className = 'font-medium text-lg';
        title.textContent = 'Puzzle Completed!';
        
        const message = document.createElement('p');
        message.className = 'text-gray-600 dark:text-gray-400';
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        message.textContent = `Time: ${minutes}:${seconds} • Mistakes: ${this.mistakes}/3`;
    
        content.appendChild(title);
        content.appendChild(message);
        toast.appendChild(icon);
        toast.appendChild(content);
        document.body.appendChild(toast);
    
        // Start confetti
        const confetti = new Confetti();
        confetti.start();
    
        // Animate toast in
        requestAnimationFrame(() => {
            toast.style.transform = 'translate(-50%, 0)';
            toast.style.opacity = '1';
        });
    
        // Remove toast after delay
        setTimeout(() => {
            toast.style.transform = 'translate(-50%, 100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 5000);
    }

    increaseMistakes() {
        this.mistakes++;
        this.updateMistakes();
        if (this.mistakes >= 3) this.handleGameOver();
    }

    updateMistakes() {
        this.domElements.mistakesDisplay.textContent = this.mistakes;
    }

    handleGameOver() {
        this.stopTimer();
        setTimeout(() => {
            alert('Game Over! You made 3 mistakes.');
            this.newGame();
        }, 100);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.updatePauseButton();
        
        if (this.isPaused) {
            this.stopTimer();
            this.domElements.grid.classList.add('game-paused');
        } else {
            this.startTimer();
            this.domElements.grid.classList.remove('game-paused');
        }
    }

    updatePauseButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.isPaused) {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        } else {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        }
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timer++;
                this.updateTimer();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    resetTimer() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimer();
    }

    updateTimer() {
        const minutes = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const seconds = (this.timer % 60).toString().padStart(2, '0');
        this.domElements.timerDisplay.textContent = `${minutes}:${seconds}`;
    }
}

class Confetti {
    constructor() {
        this.setupCanvas();
        this.particles = [];
        this.animate = this.animate.bind(this);
        this.generateParticles();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'fixed';
        this.canvas.style.inset = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    generateParticles() {
        const colors = [
            '#FF577F', '#FF884B', '#FFC764', '#63C5DA', '#9D75CB',
            '#4CAF50', '#FB48C4', '#FFD700', '#87CEEB', '#FF69B4'
        ];
        const shapes = ['circle', 'square', 'triangle', 'line'];
        
        for (let i = 0; i < 150; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = Math.random() * 10 + 5;
            
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height - this.canvas.height,
                size,
                color,
                shape,
                speedX: Math.random() * 6 - 3,
                speedY: Math.random() * 2 + 2,
                spin: Math.random() * 0.2 - 0.1,
                angle: Math.random() * 360,
                wobble: Math.random() * 0.1,
                wobbleSpeed: Math.random() * 0.1,
                gravity: 0.1 + Math.random() * 0.1,
                decay: 0.99 - Math.random() * 0.02,
                opacity: 1
            });
        }
    }

    drawParticle(particle) {
        const { x, y, size, color, shape, angle } = particle;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle * Math.PI / 180);
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.fillStyle = color;
        
        switch (shape) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'square':
                this.ctx.fillRect(-size / 2, -size / 2, size, size);
                break;
                
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(-size / 2, size / 2);
                this.ctx.lineTo(size / 2, size / 2);
                this.ctx.lineTo(0, -size / 2);
                this.ctx.closePath();
                this.ctx.fill();
                break;
                
            case 'line':
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = size / 4;
                this.ctx.beginPath();
                this.ctx.moveTo(-size, 0);
                this.ctx.lineTo(size, 0);
                this.ctx.stroke();
                break;
        }
        
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.speedX + Math.sin(particle.y * particle.wobble) * 2;
            particle.y += particle.speedY;
            
            // Add gravity and air resistance
            particle.speedY += particle.gravity;
            particle.speedX *= 0.99;
            particle.speedY *= particle.decay;
            
            // Update rotation and wobble
            particle.angle += particle.spin;
            particle.wobble += particle.wobbleSpeed;
            
            // Fade out
            particle.opacity *= 0.99;
            
            // Remove particles that are out of view or fully faded
            if (particle.y > this.canvas.height + particle.size || 
                particle.opacity < 0.1) {
                this.particles.splice(i, 1);
            } else {
                this.drawParticle(particle);
            }
        }
        
        // Continue animation if there are particles left
        if (this.particles.length > 0) {
            requestAnimationFrame(this.animate);
        } else {
            this.canvas.remove();
        }
    }

    start() {
        requestAnimationFrame(this.animate);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});