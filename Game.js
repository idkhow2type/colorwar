import Board from './Board.js';

export default class Game {
    /**
     * @param {{
     * rows: number,
     * columns: number,
     * board: Board,
     * player: boolean,
     * turn: number,
     * }} - The game options.
     */
    constructor({ rows, columns, board, player, turn}) {
        this.board = board ?? new Board(rows, columns);
        this.currentPlayer = player;
        this.turn = turn ?? 0;
    }

    /**
     * @param {Game} game - Game "struct" (without the class methods)
     * @returns {Game}
     */
    static cloneFrom(game) {
        return new Game({
            board: Board.cloneFrom(game.board),
            player: game.currentPlayer,
            turn: game.turn,
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
     * @returns {boolean} - True if the move was valid, false otherwise.
     */
    update(i, j) {
        const cell = this.board.board[i][j];
        if (this.turn < 2) {
            if (cell.value !== 0) return false;
            cell.value = 3;
            cell.owner = this.currentPlayer;
        } else {
            if (cell.value === 0) return false;
            if (cell.owner !== this.currentPlayer) return false;
            cell.value++;

            if (cell.value >= 4) {
                this.board.spread(cell);
            }
        }

        this.currentPlayer = !this.currentPlayer;
        this.turn++;
        return true;
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
        return JSON.stringify({
            b: this.board.board.flat().map((cell) => ({
                v: cell.value,
                o: cell.owner,
            })),
            p: this.currentPlayer,
            t: this.turn,
        });
    }
}
