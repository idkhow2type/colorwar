import Game from './Game.js';
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
                    const row = Math.floor(
                        Array.from(cell.parentNode.children).indexOf(cell) /
                            this.game.columns
                    );
                    const column =
                        Array.from(cell.parentNode.children).indexOf(cell) %
                        this.game.columns;
                    if (!this.game.isValidMove(row, column)) return;
                    this.boardContainer.onclick = null;
                    resolve(this.game.board[row][column]);
                }
            };
        });
    }

    render() {
        this.turnContainer?.classList.remove('p1', 'p2');
        this.turnContainer?.classList.add(
            this.game.currentPlayer ? 'p2' : 'p1'
        );
        for (let i = 0; i < this.game.rows; i++) {
            for (let j = 0; j < this.game.columns; j++) {
                const cell =
                    this.boardContainer.children[i * this.game.columns + j];
                cell.classList.remove('p1', 'p2');
                if (this.game.board[i][j].owner !== null) {
                    cell.classList.add(
                        this.game.board[i][j].owner ? 'p2' : 'p1'
                    );
                }
                cell.dataset.dots = this.game.board[i][j].value;
            }
        }
    }
}
