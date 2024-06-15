import Game from './Game.js';
import * as utils from './utils.js';
/**
 * @type {import('./Cell.js').Cell}
 */

/**
 * @typedef {{cell:Cell,score:number|null}} Move
 */

export default class Bot {
    /**
     * @param {Game} game - The game board.
     * @param {number[]} scalers - The evaluation scalers.
     * @param {number} depth - The depth of the search.
     */
    constructor(game, scalers = [3, 1.6, 1.3], depth = 6) {
        this.game = game;
        this.scalers = scalers;
        this.depth = depth;
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
        return game
            .getCells((cell) => cell.value > 0)
            .reduce((acc, cell) => {
                const sign = cell.owner ? 1 : -1;

                const baseCellValue = this.scalers[0];
                const dotValue = cell.value ** this.scalers[1];

                const rowDist = Math.abs(cell.row - game.rows/2 + 0.5);
                const colDist = Math.abs(cell.column - game.columns/2 + 0.5);
                const distToCenter = -this.scalers[2] * (rowDist + colDist);
                return acc + (baseCellValue + dotValue + distToCenter) * sign;
            }, 0);
    }

    /**
     * Minimax algorithm.
     * @param {number} depth - The depth of the search.
     * @param {Game} game - The game board.
     * @param {number} alpha - The alpha value.
     * @param {number} beta - The beta value.
     * @param {Map<string,{depth:number,best:Move[]}>} transpositionTable - The transposition table.
     * @returns {Promise<Move[]>} - The best moves and its score.
     */
    async minimax(
        depth = this.depth,
        game = this.game,
        alpha = -Infinity,
        beta = Infinity,
        transpositionTable = new Map()
    ) {
        if (depth === 0 || game.gameOver()) {
            return [{ score: this.evaluate(game), cell: null }];
        }

        const cached = transpositionTable.get(game.hash());
        if (cached && cached.depth >= depth) {
            return cached.best;
        }

        const sign = game.currentPlayer ? 1 : -1;

        /**
         * @type {Move[]}
         */
        const moves = await Promise.all(
            game.validMoves().map(async (cell) => {
                const newGame = Game.cloneFrom(game);
                await newGame.update(cell.row, cell.column);
                return {
                    cell,
                    score: this.evaluate(newGame),
                };
            })
        );
        moves.sort((a, b) => (b.score - a.score) * sign);

        let score = Infinity * -sign;
        let best = [];
        for (let i = 0; i < moves.length; i++) {
            const cell = moves[i]['cell'];
            const newGame = Game.cloneFrom(game);
            await newGame.update(cell.row, cell.column);

            let newScore = (await this.minimax(depth - 1, newGame, alpha, beta, transpositionTable))[0].score;

            if (game.currentPlayer) {
                if (utils.nearCompare(newScore, score, '>')) {
                    score = newScore;
                    best = [{ score, cell }];
                } else if (utils.nearCompare(newScore, score, '==')) {
                    best.push({ score, cell });
                }
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break;
                }
            } else {
                if (utils.nearCompare(newScore, score, '<')) {
                    score = newScore;
                    best = [{ score, cell }];
                } else if (utils.nearCompare(newScore, score, '==')) {
                    best.push({ score, cell });
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

/**
 * @typedef {{type: 'init'|'minimax', data: {
 * game: Game,
 * scalers: number[],
 * depth: number
 * }}} WorkerMessage
 */

/**
 * @typedef {{best:Move[]}} WorkerResponse
 */

/**
 * @type {null|Bot}
 */
let bot;
self.addEventListener('message', async (event) => {
    /**
     * @type {WorkerMessage}
     */
    const { type, data } = event.data;
    switch (type) {
        case 'init':
            bot = new Bot(Game.cloneFrom(data.game), data.scalers, data.depth);
            break;
        case 'minimax':
            const best = await bot.minimax(bot.depth, Game.cloneFrom(data.game));
            self.postMessage({ best });
            break;
    }
});

export class BotWorker extends Worker {
    /**
     * @param {string} name - The worker name.
     * @param {Game} game - The game board.
     * @param {number[]} scalers - The evaluation scalers.
     * @param {number} depth - The depth of the search.
     */
    constructor(name, game, scalers, depth) {
        super('Bot.js', { name, type: 'module' });
        this.game = game;
        this.scalers = scalers;
        this.depth = depth;

        const message = { type: 'init', data: { game, scalers, depth } };
        this.postMessage(message);
    }

    /**
     * Gets the best moves.
     * @returns {Promise<Move[]>} - The best moves.
     */
    getBest() {
        return new Promise((resolve) => {
            /**
             * @type {WorkerMessage}
             */
            const message = {
                type: 'minimax',
                data: { depth: this.depth, game: this.game },
            };
            this.postMessage(message);
            this.addEventListener('message', (event) => {
                /**
                 * @type {WorkerResponse}
                 */
                const data = event.data;
                resolve(data.best);
            });
        });
    }
}
