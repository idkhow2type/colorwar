import Board from './Board.js';
import { IOHandler } from './IOHandler.js';

export default class Game {
    /**
     * @param {{
     * rows: number,
     * columns: number,
     * board: Board,
     * player: boolean,
     * io: [IOHandler, ...any[]],
     * }} options - The game options.
     */
    constructor(options) {
        const { rows, columns, board, player, io } = options;
        this.board = board ?? new Board(rows, columns);
        this.currentPlayer = player;
        this.turn = 0;
        this.io = new io[0](
            this.board,
            this.update.bind(this),
            ...io.slice(1)
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

        this.currentPlayer = !this.currentPlayer;
        this.turn++;

        this.io.render();
    }

    /**
     * Checks if the game is over.
     * @returns {boolean} - True if the game is over, false otherwise.
     */
    gameOver() {
        return (
            this.turn >= 2 &&
            this.board
                .getCells((cell) => cell.value > 0)
                .every((cell) => cell.owner === this.currentPlayer)
        );
    }
}
