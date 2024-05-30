/**
 * @type {import('./Cell.js').Cell}
 */

export default class Game {
    /**
     * @param {{
     * rows: number,
     * columns: number,
     * board: Array<Array<Cell>>
     * player: boolean,
     * turn: number,
     * }} - The game options.
     */
    constructor({ rows, columns, board, player, turn }) {
        this.board = board ?? Game.createBoard(rows, columns);
        this.rows = this.board.length;
        this.columns = this.board[0].length;
        this.currentPlayer = player;
        this.turn = turn ?? 0;
    }

    /**
     * Creates the game board by initializing the cells.
     */
    static createBoard(rows, columns) {
        const board = [];
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i][j] = { row: i, column: j, value: 0, owner: null };
            }
        }
        return board;
    }

    /**
     * Gets the cells that match the given predicate.
     * @param {(cell: Cell)=>boolean} predicate - The predicate function used to filter the cells.
     * @returns {Cell[]} - The filtered cells.
     */
    getCells(predicate) {
        predicate = predicate || (() => true);
        return this.board.flat().filter(predicate);
    }

    /**
     * Returns the valid moves for the current player.
     * @returns {Cell[]} - The valid moves.
     */
    validMoves() {
        return this.getCells((cell) =>
            this.turn < 2
                ? cell.owner === null
                : cell.owner === this.currentPlayer
        );
    }

    /**
     * @param {number} row - The row index of the cell.
     * @param {number} column - The column index of the cell.
     * @returns {boolean} - True if the move was valid, false otherwise.
     */
    isValidMove(row, column) {
        const cell = this.board[row][column];
        if (this.turn < 2) {
            if (cell.value !== 0) return false;
        } else {
            if (cell.value === 0) return false;
            if (cell.owner !== this.currentPlayer) return false;
        }
        return true;
    }

    /**
     * Updates the game state.
     * @param {number} row - The row index of the cell.
     * @param {number} column - The column index of the cell.
     * @param {(queue: {cell:Cell,depth:number}[])=>Promise} callback - Called for every modified cell
     */
    async update(row, column, callback) {
        if (!this.isValidMove(row, column)) return;

        const cell = this.board[row][column];
        if (this.turn < 2) {
            cell.value = 3;
            cell.owner = this.currentPlayer;
        } else if (++cell.value >= 4) {
            const owner = cell.owner;
            const queue = [{ cell, depth: 0 }];
            while (queue.length > 0) {
                const { cell: current, depth } = queue.shift();
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
                    if (neighbor.value === 4) continue;
                    neighbor.value++;
                    neighbor.owner = owner;
                    if (neighbor.value === 4)
                        queue.push({ cell: neighbor, depth: depth + 1 });
                }
                await callback?.([ ...queue]);
                if (
                    this.getCells((cell) => cell.value > 0).every(
                        (cell) => cell.owner === owner
                    )
                )
                    break;
            }
        }

        this.currentPlayer = !this.currentPlayer;
        this.turn++;
    }

    /**
     * Checks if the game is over.
     * @returns {boolean} - True if the game is over, false otherwise.
     */
    gameOver() {
        return (
            this.turn > 1 &&
            this.getCells((cell) => cell.value > 0).every(
                (cell) => cell.owner === !this.currentPlayer
            )
        );
    }

    hash() {
        return JSON.stringify({
            b: this.board.flat().map((cell) => ({
                v: cell.value,
                o: cell.owner,
            })),
            p: this.currentPlayer,
            t: this.turn,
        });
    }

    static cloneFrom(game) {
        return new Game({
            board: game.board.map((row) => row.map((cell) => ({ ...cell }))),
            player: game.currentPlayer,
            turn: game.turn,
        });
    }
}
