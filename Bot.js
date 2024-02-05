import Game from './Game.js';

export default class Bot {
    /**
     * @param {Game} game - The game board.
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Evaluates the board state.
     * @param {Game} game - The board to evaluate.
     * @returns {number} - The board state evaluation.
     */
    evaluate(game = this.game) {
        if (game.gameOver()) {
            return Infinity * (2 * !game.currentPlayer - 1);
        }
        const cells = game.board.getCells((cell) => cell.value > 0);
        return cells.reduce((acc, cell) => {
            // convert boolean to -1 or 1
            // (inserts dreading comment)
            return acc + (2 * cell.owner - 1) * cell.value;
        }, 0);
    }

    /**
     * Minimax algorithm.
     * @param {number} depth - The depth of the search.
     * @param {Game} game - The game board.
     * @returns {number} - The best move evaluation.
     */
    minimax(depth, game = this.game) {
        if (depth === 0 || game.gameOver()) {
            return this.evaluate(game);
        }

        return Math.max(
            ...game.validMoves().map((cell) => {
                const newGame = new Game({
                    board: _.cloneDeep(game.board),
                    player: game.currentPlayer,
                    turn: game.turn,
                });
                newGame.update(cell.row, cell.column);
                // convert boolean to -1 or 1 instead of branching for each player
                return (
                    this.minimax(depth - 1, newGame) *
                    (2 * this.game.currentPlayer - 1)
                );
            })
        );
    }

    /**
     * Returns the best move.
     * @param {number} depth - The depth of the search.
     * @returns {Cell} - The best move.
     */
    bestMove(depth) {
        return this.game.validMoves().reduce(
            (best, cell) => {
                const newGame = new Game({
                    board: _.cloneDeep(this.game.board),
                    player: this.game.currentPlayer,
                    turn: this.game.turn,
                });
                newGame.update(cell.row, cell.column);
                const value = this.minimax(depth, newGame);
                return value * (2 * this.game.currentPlayer - 1) >
                    best.value * (2 * this.game.currentPlayer - 1)
                    ? { cell, value }
                    : best;
            },
            { cell: null, value: Infinity * -(2 * this.game.currentPlayer - 1) }
        ).cell;
    }
}
