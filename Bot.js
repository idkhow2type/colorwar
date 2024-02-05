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
                return acc + (2 + cell.value ** 1.2) * (2 * cell.owner - 1);
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

        let best = Infinity * -(2 * game.currentPlayer - 1);
        if (game.currentPlayer) {
            const moves = utils.shuffle(game.validMoves());
            for (let i = 0; i < moves.length; i++) {
                const cell = moves[i];
                const newGame = new Game({
                    board: _.cloneDeep(game.board),
                    player: game.currentPlayer,
                    turn: game.turn,
                });
                newGame.update(cell.row, cell.column);
                best = Math.max(
                    best,
                    this.minimax(depth - 1, newGame, alpha, beta)
                );
                alpha = Math.max(alpha, best);
                if (beta <= alpha) {
                    break;
                }
            }
        } else {
            const moves = utils.shuffle(game.validMoves());
            for (let i = 0; i < moves.length; i++) {
                const cell = moves[i];
                const newGame = new Game({
                    board: _.cloneDeep(game.board),
                    player: game.currentPlayer,
                    turn: game.turn,
                });
                newGame.update(cell.row, cell.column);
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
     * Returns the best move.
     * @param {number} depth - The depth of the search.
     * @returns {Cell} - The best move.
     */
    bestMoves(depth) {
        return utils.shuffle(this.game.validMoves()).reduce(
            (best, cell, i) => {
                const newGame = new Game({
                    board: _.cloneDeep(this.game.board),
                    player: this.game.currentPlayer,
                    turn: this.game.turn,
                });
                newGame.update(cell.row, cell.column);
                const value = this.minimax(depth - 1, newGame);
                if (
                    this.game.currentPlayer
                        ? utils.nearCompare(value, best.at(-1).value, '>')
                        : utils.nearCompare(value, best.at(-1).value, '<')
                ) {
                    return [{ cell, value }];
                } else if (utils.nearCompare(value, best.at(-1).value, '==')) {
                    return best.concat({ cell, value });
                } else {
                    return best;
                }
            },
            [
                {
                    cell: null,
                    value: Infinity * -(2 * this.game.currentPlayer - 1),
                },
            ]
        );
    }
}
