import Board from './Board.js';
import { IOHandler } from './IOHandler.js';

export default class Game {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     * @param {string} player - The current player.
     * @param {typeof IOHandler} io - The input/output handler constructor.
     * @param {...any} ioArgs - The arguments to pass to the io constructor.
     */
    constructor(rows, columns, player, io, ...ioArgs) {
        this.board = new Board(rows, columns, this);
        this.currentPlayer = player;
        this.turn = 0;
        this.io = new io(
            this.board.rows,
            this.board.columns,
            this.board,
            this.update.bind(this),
            ...ioArgs
        );
        this.io.render();
        this.io.startInput();
    }

    /**
     * Updates the game state.
     * @param {number} i - The row index of the cell.
     * @param {number} j - The column index of the cell.
     */
    update(i, j) {
        const cell = this.board.board[i][j];
        if (this.turn < 2) {
            if (cell.value !== 0) return;
            cell.update(3, this.currentPlayer);
        } else {
            if (cell.value === 0) return;
            if (cell.owner !== this.currentPlayer) return;
            cell.update(cell.value + 1, cell.owner);

            if (cell.value >= 4) {
                this.board.spread(cell);
            }
        }

        this.currentPlayer = this.currentPlayer === 'p1' ? 'p2' : 'p1';
        this.turn++;

        this.io.render();
    }

    /**
     * Checks if the game is over.
     * @returns {boolean} - True if the game is over, false otherwise.
     */
    gameOver() {
        return this.board
            .getCells((cell) => cell.value > 0)
            .every((cell) => cell.owner === this.currentPlayer);
    }
}
