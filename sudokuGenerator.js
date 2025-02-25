class SudokuGenerator {
    static generatePuzzle(emptyCells) {
        // Start with a completely solved puzzle
        const grid = Array(9).fill().map(() => Array(9).fill(0));
        SudokuGenerator.generateSolvedGrid(grid);
        
        // Make a copy of the solution for reference
        const solution = grid.map(row => [...row]);
        
        // Create a list of all positions and shuffle it for random cell removal
        let positions = Array.from({length: 81}, (_, i) => [Math.floor(i/9), i%9]);
        positions = SudokuGenerator.shuffle(positions);
        
        // Optimized approach: remove cells in batches, then check uniqueness
        const digCells = (grid, positions, numToRemove, startIdx = 0) => {
            if (startIdx >= positions.length || numToRemove <= 0) {
                return startIdx;
            }
            
            // Batch size - try removing multiple cells before checking
            const batchSize = Math.min(numToRemove, 5);
            
            const removedCells = [];
            
            // Try to remove a batch of cells
            for (let i = 0; i < batchSize && (startIdx + i) < positions.length; i++) {
                const [row, col] = positions[startIdx + i];
                removedCells.push([row, col, grid[row][col]]);
                grid[row][col] = 0;
            }
            
            // Check if the puzzle still has a unique solution
            if (SudokuGenerator.countSolutions(grid) === 1) {
                // Success! Recursively dig more cells
                return digCells(grid, positions, numToRemove - removedCells.length, startIdx + removedCells.length);
            } else {
                // Multiple solutions found, backtrack and try removing one cell at a time
                for (const [row, col, val] of removedCells) {
                    grid[row][col] = val;
                }
                
                let nextStart = startIdx;
                for (let i = 0; i < removedCells.length && numToRemove > 0; i++) {
                    const [row, col, val] = removedCells[i];
                    
                    // Try removing this single cell
                    grid[row][col] = 0;
                    
                    if (SudokuGenerator.countSolutions(grid) === 1) {
                        // This cell can be removed while maintaining uniqueness
                        numToRemove--;
                    } else {
                        // Removing this cell creates multiple solutions, put it back
                        grid[row][col] = val;
                    }
                    
                    nextStart++;
                }
                
                // Continue with the next position
                return digCells(grid, positions, numToRemove, nextStart);
            }
        };
        
        // Start removing cells until we've reached our target or can't remove more
        digCells(grid, positions, emptyCells);
        
        return grid;
    }

    static generateSolvedGrid(grid) {
        // Create a base diagonal solved grid
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
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) return false;
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
    
    // Count the number of solutions for a given grid
    static countSolutions(grid, limit = 2) {
        const gridCopy = grid.map(row => [...row]);
        const count = { count: 0 };
        
        this._countSolutionsRecursive(gridCopy, count, limit);
        
        return count.count;
    }
    
    // Helper method for counting solutions
    static _countSolutionsRecursive(grid, count, limit) {
        const empty = SudokuGenerator.findEmpty(grid);
        if (!empty) {
            // Found a solution
            count.count++;
            return count.count >= limit;
        }
        
        const [row, col] = empty;
        
        // Try each number 1-9
        for (let num = 1; num <= 9; num++) {
            if (SudokuGenerator.isValid(grid, row, col, num)) {
                grid[row][col] = num;
                
                // Recursively search for solutions
                if (this._countSolutionsRecursive(grid, count, limit)) {
                    return true; // Early exit once we've found enough solutions
                }
                
                // Backtrack
                grid[row][col] = 0;
            }
        }
        
        return count.count >= limit;
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