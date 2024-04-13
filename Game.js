import Board from './Board.js';
import { IOHandler } from './IOHandler.js';

export default class Game {
    /**
     * @param {{
     * rows: number,
     * columns: number,
     * board: Board,
     * player: boolean,
     * turn: number,
     * io: [IOHandler, ...any[]],
     * }} - The game options.
     */
    constructor({ rows, columns, board, player, turn, io }) {
        this.board = board ?? new Board(rows, columns);
        this.currentPlayer = player;
        this.turn = turn ?? 0;
        this.io = io ? new io[0](this, ...io.slice(1)) : null;
        this.io?.render();
        this.io?.startInput();
    }

    /**
     * Clones the game state.
     * @param {[IOHandler, ...any[]]} io - (Optional) The IO handler and its arguments.
     * @returns {Game} - The cloned game.
     */
    clone(io = null) {
        return new Game({
            board: this.board.clone(),
            player: this.currentPlayer,
            turn: this.turn,
            io,
        });
    }

    /**
     * Returns the valid moves for the current player.
     * @returns {Cell[]} - The valid moves.
     */
    validMoves() {
        return this.board.getCells((cell) =>
            this.turn < 2
                ? cell.owner === null
                : cell.owner === this.currentPlayer
        );
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
            cell.value = 3;
            cell.owner = this.currentPlayer;
        } else {
            if (cell.value === 0) return;
            if (cell.owner !== this.currentPlayer) return;
            cell.value++;

            if (cell.value >= 4) {
                this.board.spread(cell);
            }
        }

        this.currentPlayer = !this.currentPlayer;
        this.turn++;

        this.io?.render();
    }

    /**
     * Checks if the game is over.
     * @returns {boolean} - True if the game is over, false otherwise.
     */
    gameOver() {
        return (
            this.turn > 1 &&
            this.board
                .getCells((cell) => cell.value > 0)
                .every((cell) => cell.owner === !this.currentPlayer)
        );
    }

    hash() {
        const clone = this.clone();

        return JSON.stringify({
            b: clone.board.board.flat().map((cell) => ({
                v: cell.value,
                o: cell.owner,
            })),
            p: clone.currentPlayer,
            t: clone.turn,
        });
    }
}
