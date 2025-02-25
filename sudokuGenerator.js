class SudokuGenerator {
    static generatePuzzle(emptyCells) {
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        
        SudokuGenerator.generateSolvedGrid(grid);
        
        let positions = Array.from({length: 81}, (_, i) => [Math.floor(i/9), i%9]);
        positions = SudokuGenerator.shuffle(positions);
        
        for (let i = 0; i < emptyCells && i < positions.length; i++) {
            const [row, col] = positions[i];
            grid[row][col] = 0;
        }
        
        return grid;
    }

    static generateSolvedGrid(grid) {
        const nums = SudokuGenerator.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let i = 0; i < 9; i++) {
            grid[i][i] = nums[i];
        }
        
        return SudokuGenerator.solve(grid, true);
    }

    static solve(grid, initial = false) {
        const empty = SudokuGenerator.findEmpty(grid);
        if (!empty) return true;

        const [row, col] = empty;
        const nums = SudokuGenerator.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (const num of nums) {
            if (SudokuGenerator.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (SudokuGenerator.solve(grid, initial)) {
                    return true;
                }
                grid[row][col] = 0;
            }
        }
        return false;
    }

    static findEmpty(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) return [row, col];
            }
        }
        return null;
    }

    static isValid(grid, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (x !== col && grid[row][x] === num) return false;
        }

        for (let x = 0; x < 9; x++) {
            if (x !== row && grid[x][col] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (r !== row && c !== col && grid[r][c] === num) return false;
            }
        }

        return true;
    }

    static validateMove(grid, row, col, num) {
        const testGrid = grid.map(r => [...r]);
        testGrid[row][col] = num;
        return SudokuGenerator.isValid(testGrid, row, col, num);
    }

    static isSolved(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) return false;
                
                const num = grid[row][col];
                grid[row][col] = 0;
                const isValid = SudokuGenerator.isValid(grid, row, col, num);
                grid[row][col] = num;
                
                if (!isValid) return false;
            }
        }
        return true;
    }

    static shuffle(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

window.SudokuGenerator = SudokuGenerator;