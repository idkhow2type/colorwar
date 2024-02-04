import Cell from "./Cell.js";

export default class Board {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     */
    constructor(rows, columns) {
        this.board = [];
        this.rows = rows;
        this.columns = columns;
        this.#createBoard();
    }

    /**
     * Creates the game board by initializing the cells.
     */
    #createBoard() {
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.board[i][j] = new Cell(i, j);
            }
        }
    }

    /**
     * Gets the cells that match the given predicate.
     * @param {function} predicate - The predicate function used to filter the cells.
     * @returns {Array} - The filtered cells.
     */
    getCells(predicate) {
        predicate = predicate || (() => true);
        return this.board.flat().filter(predicate);
    }

    /**
     * Spreads the dots to the adjacent cells.
     * @param {Cell} cell - The cell to spread the dots from.
     */
    spread(cell) {
        const owner = cell.owner;
        const queue = [cell];
        while (queue.length > 0) {
            const current = queue.shift();
            current.update(0, null);
            // define the neighbors from cardinal directions
            const neighbors = [
                this.board[current.row - 1]?.[current.column],
                this.board[current.row + 1]?.[current.column],
                this.board[current.row]?.[current.column - 1],
                this.board[current.row]?.[current.column + 1],
            ].filter((cell) => cell !== undefined);
            for (const neighbor of neighbors) {
                neighbor.update(neighbor.value + 1, owner);
                if (neighbor.value >= 4) {
                    queue.push(neighbor);
                }
            }
            if (
                this.getCells((cell) => cell.value > 0).every(
                    (cell) => cell.owner === this.currentPlayer
                )
            )
                return;
        }
    }
}
