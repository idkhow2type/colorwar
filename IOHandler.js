import Game from './Game.js';
import { toggleTransitionedClass, sleep } from './utils.js';
/**
 * @type {import('./Cell.js').Cell}
 */

export class IOHandler {
    /**
     * @param {Game} game - The game board.
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Returns a promise that resolves when the player has chosen a cell
     * @returns {Promise<Cell>}
     */
    async getCell() {}

    /**
     * Renders the game board.
     */
    render() {}
}

export class DOMIOHandler extends IOHandler {
    /**
     * @param {Game} game - The game board.
     * @param {HTMLElement} boardContainer - The container element to render the game board in.
     * @param {HTMLElement} turnContainer - The container element to render the current player in.
     */
    constructor(game, boardContainer, turnContainer = null) {
        super(game);
        this.boardContainer = boardContainer;
        this.turnContainer = turnContainer;

        this.boardContainer.style.setProperty('--rows', this.game.rows);
        this.boardContainer.style.setProperty('--cols', this.game.columns);

        this.boardContainer.innerHTML = '';
        for (let i = 0; i < this.game.rows; i++) {
            for (let j = 0; j < this.game.columns; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.boardContainer.appendChild(cell);
            }
        }
    }

    async getCell() {
        return new Promise((resolve) => {
            this.boardContainer.onclick = (event) => {
                const cell = event.target;
                if (cell.classList.contains('cell')) {
                    const row = Math.floor(Array.from(cell.parentNode.children).indexOf(cell) / this.game.columns);
                    const column = Array.from(cell.parentNode.children).indexOf(cell) % this.game.columns;
                    if (!this.game.isValidMove(row, column)) return;
                    this.boardContainer.onclick = null;
                    resolve(this.game.board[row][column]);
                }
            };
        });
    }

    /**
     * Renders the game board.
     * @param {Cell[]} spreaded - Cells that spread last turn.
     */
    async render(spreaded) {
        if (spreaded) {
            const spreadPromises = spreaded.flatMap((cell) => {
                const rootElem = this.boardContainer.children[cell.row * this.game.columns + cell.column];

                const directions = [
                    ['up', -1, 0],
                    ['down', 1, 0],
                    ['left', 0, -1],
                    ['right', 0, 1],
                ];

                return directions
                    .filter(([dir, dy, dx]) => this.game.board[cell.row + dy]?.[cell.column + dx] !== undefined)
                    .map(async ([dir, dy, dx]) => {
                        const destElem =
                            this.boardContainer.children[(cell.row + dy) * this.game.columns + (cell.column + dx)];
                        const spreadDot = document.createElement('div');

                        spreadDot.dataset.player = this.game.currentPlayer + 1;
                        spreadDot.classList.add('spread-dot');
                        rootElem.appendChild(spreadDot);

                        // Wait for the dot to be appended to the DOM
                        // idk why you need this, let alone twice
                        await new Promise((resolve) => requestAnimationFrame(resolve));
                        await new Promise((resolve) => requestAnimationFrame(resolve));

                        await toggleTransitionedClass(spreadDot, 'appear', 'opacity');
                        rootElem.dataset.dots = 0;
                        rootElem.dataset.player = '';
                        await toggleTransitionedClass(spreadDot, 'shrink', 'width');
                        await toggleTransitionedClass(spreadDot, dir, 'translate');
                        await toggleTransitionedClass(spreadDot, 'shrink', 'width');

                        const targetCell = this.game.board[cell.row + dy][cell.column + dx];
                        destElem.dataset.dots = targetCell.value;
                        destElem.dataset.player = targetCell.owner + 1;

                        await toggleTransitionedClass(spreadDot, 'appear', 'opacity');
                        spreadDot.remove();
                    });
            });

            await Promise.all(spreadPromises);
        }

        for (let i = 0; i < this.game.rows; i++) {
            for (let j = 0; j < this.game.columns; j++) {
                const cell = this.boardContainer.children[i * this.game.columns + j];
                const gameCell = this.game.board[i][j];

                cell.dataset.player = gameCell.owner !== null ? gameCell.owner + 1 : '';
                cell.dataset.dots = gameCell.value;
            }
        }

        this.turnContainer.dataset.player = this.game.currentPlayer + 1;
    }
}
