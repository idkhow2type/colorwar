import Cell from './Cell.js';
import Game from './Game.js';
import * as utils from './utils.js';

export default class Bot {
    /**
     * @param {Game} game - The game board.
     */
    constructor(game, scalers = [2, 1.2, -1]) {
        this.game = game;
        this.scalers = scalers;
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
                const sign = cell.owner ? 1 : -1;

                const baseCellValue = this.scalers[0];
                const dotValue = cell.value ** this.scalers[1];

                const rowDist = Math.abs(cell.row - game.board.rows / 2);
                const colDist = Math.abs(cell.column - game.board.columns / 2);
                const distToCenter = this.scalers[2] * (rowDist + colDist);
                return acc + (baseCellValue + dotValue + distToCenter) * sign;
            }, 0);
    }

    /**
     * Minimax algorithm.
     * @param {number} depth - The depth of the search.
     * @param {Game} game - The game board.
     * @param {number} alpha - The alpha value.
     * @param {number} beta - The beta value.
     * @returns {Cell[]} - The best move and its score.
     */
    minimax(
        depth,
        game = this.game,
        alpha = -Infinity,
        beta = Infinity,
        transpositionTable = new Map()
    ) {
        if (depth === 0 || game.gameOver()) {
            return [{ score: this.evaluate(game), move: null }];
        }

        const cached = transpositionTable.get(game.hash());
        if (cached && cached.depth >= depth) {
            return cached.best;
        }

        const sign = game.currentPlayer ? 1 : -1;

        const moves = game.validMoves().map((cell) => {
            const newGame = game.clone();
            newGame.update(cell.row, cell.column);
            return { cell, value: this.evaluate(newGame) };
        });
        moves.sort((a, b) => (b.value - a.value) * sign);

        let score = Infinity * -sign;
        let best = [];
        for (let i = 0; i < moves.length; i++) {
            const cell = moves[i]['cell'];
            const newGame = game.clone();
            newGame.update(cell.row, cell.column);

            const newScore = this.minimax(
                depth - 1,
                newGame,
                alpha,
                beta,
                transpositionTable
            )[0].score;

            if (game.currentPlayer) {
                if (utils.nearCompare(newScore, score, '>')) {
                    score = newScore;
                    best = [{ score, move: cell }];
                } else if (utils.nearCompare(newScore, score, '==')) {
                    best.push({ score, move: cell });
                }
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break;
                }
            } else {
                if (utils.nearCompare(newScore, score, '<')) {
                    score = newScore;
                    best = [{ score, move: cell }];
                } else if (utils.nearCompare(newScore, score, '==')) {
                    best.push({ score, move: cell });
                }
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        transpositionTable.set(game.hash(), { depth, best });
        return best;
    }
}
