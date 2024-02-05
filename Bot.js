import Game from './Game.js';

function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
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
                return acc + (2 + cell.value**1.2) * (2 * cell.owner - 1);
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

        let best = Infinity * -(2 * game.currentPlayer - 1);
        if (game.currentPlayer) {
            shuffle(
                game.validMoves().map((cell) => {
                    const newGame = new Game({
                        board: _.cloneDeep(game.board),
                        player: game.currentPlayer,
                        turn: game.turn,
                    });
                    newGame.update(cell.row, cell.column);
                    return this.minimax(depth - 1, newGame);
                })
            ).forEach((value) => {
                best = Math.max(best, value);
            });
        } else {
            shuffle(
                game.validMoves().map((cell) => {
                    const newGame = new Game({
                        board: _.cloneDeep(game.board),
                        player: game.currentPlayer,
                        turn: game.turn,
                    });
                    newGame.update(cell.row, cell.column);
                    return this.minimax(depth - 1, newGame);
                })
            ).forEach((value) => {
                best = Math.min(best, value);
            });
        }
        return best;
    }

    /**
     * Returns the best move.
     * @param {number} depth - The depth of the search.
     * @returns {Cell} - The best move.
     */
    bestMove(depth) {
        return shuffle(this.game.validMoves()).reduce(
            (best, cell) => {
                const newGame = new Game({
                    board: _.cloneDeep(this.game.board),
                    player: this.game.currentPlayer,
                    turn: this.game.turn,
                });
                newGame.update(cell.row, cell.column);
                const value = this.minimax(depth - 1, newGame);
                return (this.game.currentPlayer ? Math.max : Math.min)(
                    best.value,
                    value
                ) === value
                    ? { cell, value }
                    : best;
            },
            { cell: null, value: Infinity * -(2 * this.game.currentPlayer - 1) }
        );
    }
}
