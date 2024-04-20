/**
 * @type {import('./Cell').default}
 */

export default class Board {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     */
    constructor(rows, columns) {
        /**
         * @type {Array<Array<Cell>>}
         */
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
                this.board[i][j] = { row: i, column: j, value: 0, owner: null };
            }
        }
    }

    /**
     * @param {Board} board - Board "struct" (without the class methods)
     * @returns {Board}
     */
    static cloneFrom(board) {
        const newBoard = new Board(board.rows, board.columns);
        newBoard.board = board.board.map((row) =>
            row.map((cell) => ({ ...cell }))
        );
        return newBoard;
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
            current.value = 0;
            current.owner = null;
            // define the neighbors from cardinal directions
            const neighbors = [
                this.board[current.row - 1]?.[current.column],
                this.board[current.row + 1]?.[current.column],
                this.board[current.row]?.[current.column - 1],
                this.board[current.row]?.[current.column + 1],
            ].filter((cell) => cell !== undefined);
            for (const neighbor of neighbors) {
                neighbor.value++;
                neighbor.owner = owner;
                if (neighbor.value >= 4) {
                    neighbor.value = 4
                    neighbor.owner = owner
                    queue.push(neighbor);
                }
            }
            if (
                this.getCells((cell) => cell.value > 0).every(
                    (cell) => cell.owner === owner
                )
            )
                return;
        }
    }
}
