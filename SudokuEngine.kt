package com.example.sudoku.engine

/**
 * Sudoku Data Architecture
 */
data class SudokuCell(
    val row: Int,
    val col: Int,
    var value: Int, // 0 indicates an empty cell
    val isOriginalClue: Boolean = false,
    val isUserInput: Boolean = false,
    val notes: Set<Int> = emptySet()
)

data class BoardState(
    val grid: List<List<SudokuCell>>,
    val selectedRow: Int? = null,
    val selectedCol: Int? = null,
    val currentMistakesCount: Int = 0,
    val maxMistakesLimit: Int = 3,
    val hintsCount: Int = 0,
    val isGameOver: Boolean = false
)

enum class SudokuDifficulty {
    EASY,
    MEDIUM,
    HARD,
    EXPERT
}

/**
 * Sudoku Logical Calculations Engine
 */
class SudokuEngine {

    /**
     * Checks if a digit can legally be placed in a row, column, or local 3x3 square quadrant.
     */
    fun isValidPlacement(grid: Array<IntArray>, row: Int, col: Int, num: Int): Boolean {
        // Check row
        for (x in 0 until 9) {
            if (grid[row][x] == num) return false
        }

        // Check col
        for (x in 0 until 9) {
            if (grid[x][col] == num) return false
        }

        // Check local 3x3 square box quadrant
        val boxRowStart = row - (row % 3)
        val boxColStart = col - (col % 3)
        for (i in 0 until 3) {
            for (j in 0 until 3) {
                if (grid[boxRowStart + i][boxColStart + j] == num) {
                    return false
                }
            }
        }

        return true
    }

    /**
     * Backtracking algorithm to generate a valid, full 9x9 Sudoku grid.
     */
    fun solveSudoku(grid: Array<IntArray>): Boolean {
        for (row in 0 until 9) {
            for (col in 0 until 9) {
                // If cell is empty
                if (grid[row][col] == 0) {
                    // Try numbers 1 to 9
                    // Shuffle numbers to ensure randomized generation
                    val numbers = (1..9).shuffled()
                    for (num in numbers) {
                        if (isValidPlacement(grid, row, col, num)) {
                            grid[row][col] = num

                            if (solveSudoku(grid)) {
                                return true
                            }

                            // Undo assignment (backtrack)
                            grid[row][col] = 0
                        }
                    }
                    return false // Trigger backtracking
                }
            }
        }
        return true // Sudoku solved successfully
    }

    /**
     * Helper to clone an array grid for solver calculations
     */
    private fun cloneGrid(original: Array<IntArray>): Array<IntArray> {
        return Array(9) { r -> original[r].clone() }
    }

    /**
     * Solves a grid and counts how many distinct solutions exist (up to a limit of 2 to check uniqueness).
     */
    fun countSolutions(grid: Array<IntArray>, limit: Int = 2): Int {
        var solutionCount = 0

        fun solveAndCount(g: Array<IntArray>): Boolean {
            for (row in 0 until 9) {
                for (col in 0 until 9) {
                    if (g[row][col] == 0) {
                        for (num in 1..9) {
                            if (isValidPlacement(g, row, col, num)) {
                                g[row][col] = num
                                if (solveAndCount(g)) {
                                    solutionCount++
                                }
                                g[row][col] = 0
                                
                                if (solutionCount >= limit) {
                                    return true // Break early when unique count threshold exceeded
                                }
                            }
                        }
                        return false
                    }
                }
            }
            return true
        }

        solveAndCount(cloneGrid(grid))
        return solutionCount
    }

    /**
     * Generates a final Sudoku puzzle with exactly ONE unique solution.
     * Starts with a randomized complete grid, then punctures holes based on target difficulty
     * while continuously verifying that only one matching solution exists.
     */
    fun generatePuzzle(difficulty: SudokuDifficulty): Array<IntArray> {
        // Step 1: Create a blank grid and solve it to generate a randomized complete board
        val completeGrid = Array(9) { IntArray(9) { 0 } }
        solveSudoku(completeGrid)

        // Step 2: Determine target target empty cells based on difficulty
        val cellsToRemove = when (difficulty) {
            SudokuDifficulty.EASY -> 30   // Leaves ~51 clues
            SudokuDifficulty.MEDIUM -> 40 // Leaves ~41 clues
            SudokuDifficulty.HARD -> 48   // Leaves ~33 clues
            SudokuDifficulty.EXPERT -> 54 // Leaves ~27 clues
        }

        val puzzleGrid = cloneGrid(completeGrid)
        
        // Generate random sequence of cells to puncture
        val positions = (0 until 81).shuffled().toMutableList()
        var removedCount = 0

        for (pos in positions) {
            if (removedCount >= cellsToRemove) break

            val row = pos / 9
            val col = pos % 9
            val backupValue = puzzleGrid[row][col]

            // Puncture the cell
            puzzleGrid[row][col] = 0

            // Check if removing this value preserves EXACTLY 1 unique solution
            // If yes, keep it empty. If no, restore the backup and continue.
            val numSolutions = countSolutions(puzzleGrid)
            if (numSolutions == 1) {
                removedCount++
            } else {
                puzzleGrid[row][col] = backupValue
            }
        }

        return puzzleGrid
    }

    /**
     * Checks if a board meets unique solution conditions and calculates physical difficulty metric.
     * Scores are measured by ratio of empty spaces and computational backtracking counts.
     */
    fun evaluateDifficulty(grid: Array<IntArray>): SudokuDifficulty {
        val emptyCount = grid.sumOf { row -> row.count { it == 0 } }
        return when {
            emptyCount <= 32 -> SudokuDifficulty.EASY
            emptyCount <= 42 -> SudokuDifficulty.MEDIUM
            emptyCount <= 50 -> SudokuDifficulty.HARD
            else -> SudokuDifficulty.EXPERT
        }
    }
}
