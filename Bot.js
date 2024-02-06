import Game from './Game.js';
import * as utils from './utils.js';

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
        return game.board
            .getCells((cell) => cell.value > 0)
            .reduce((acc, cell) => {
                return (
                    acc +
                    (2 +
                        cell.value ** 1.2 +
                        -(
                            Math.abs(cell.row - game.board.rows / 2) +
                            Math.abs(cell.column - game.board.columns / 2)
                        )) *
                        (2 * cell.owner - 1)
                );
            }, 0);
    }

    /**
     * Minimax algorithm.
     * @param {number} depth - The depth of the search.
     * @param {Game} game - The game board.
     * @param {number} alpha - The alpha value.
     * @param {number} beta - The beta value.
     * @returns {number} - The best move evaluation.
     */
    minimax(depth, game = this.game, alpha = -Infinity, beta = Infinity) {
        if (depth === 0 || game.gameOver()) {
            return this.evaluate(game);
        }

        const sign = game.currentPlayer ? 1 : -1;
        let best = Infinity * -sign;
        const moves = game.validMoves().map((cell) => {
            const newGame = game.clone();
            newGame.update(cell.row, cell.column);
            return { cell, value: this.evaluate(newGame) };
        });
        moves.sort((a, b) => (b.value - a.value) * sign);
        for (let i = 0; i < moves.length; i++) {
            const cell = moves[i]['cell'];
            const newGame = game.clone();
            newGame.update(cell.row, cell.column);

            if (game.currentPlayer) {
                best = Math.max(
                    best,
                    this.minimax(depth - 1, newGame, alpha, beta)
                );
                alpha = Math.max(alpha, best);
                if (beta <= alpha) {
                    break;
                }
            } else {
                best = Math.min(
                    best,
                    this.minimax(depth - 1, newGame, alpha, beta)
                );
                beta = Math.min(beta, best);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return best;
    }

    /**
     * Returns the best moves.
     * @param {number} depth - The depth of the search.
     * @returns {Cell[]} - The best move.
     */
    bestMoves(depth) {
        return this.game.validMoves().reduce((best, cell) => {
            const newGame = this.game.clone();
            newGame.update(cell.row, cell.column);
            const value = this.minimax(depth - 1, newGame);
            if (
                best === null ||
                (this.game.currentPlayer
                    ? utils.nearCompare(value, best.at(-1).value, '>')
                    : utils.nearCompare(value, best.at(-1).value, '<'))
            ) {
                return [{ cell, value }];
            } else if (utils.nearCompare(value, best.at(-1).value, '==')) {
                return best.concat({ cell, value });
            } else {
                return best;
            }
        }, null);
    }
}
