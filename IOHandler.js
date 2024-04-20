import Game from './Game.js';

export class IOHandler {
    /**
     * @param {Game} game - The game board.
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Returns a promise that resolves when the player has made their turn.
     */
    async playTurn() {}

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

        this.boardContainer.style.setProperty('--rows', this.game.board.rows);
        this.boardContainer.style.setProperty(
            '--cols',
            this.game.board.columns
        );

        this.boardContainer.innerHTML = '';
        for (let i = 0; i < this.game.board.rows; i++) {
            for (let j = 0; j < this.game.board.columns; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.boardContainer.appendChild(cell);
            }
        }
    }

    async playTurn() {
        return new Promise((resolve) => {
            this.boardContainer.onclick = (event) => {
                const cell = event.target;
                if (cell.classList.contains('cell')) {
                    const row = Math.floor(
                        Array.from(cell.parentNode.children).indexOf(cell) /
                            this.game.board.columns
                    );
                    const column =
                        Array.from(cell.parentNode.children).indexOf(cell) %
                        this.game.board.columns;
                    if (!this.game.update(row, column)) return;
                    this.boardContainer.onclick = null;
                    resolve();
                }
            };
        });
    }

    render() {
        this.turnContainer?.classList.remove('p1', 'p2');
        this.turnContainer?.classList.add(
            this.game.currentPlayer ? 'p2' : 'p1'
        );
        for (let i = 0; i < this.game.board.rows; i++) {
            for (let j = 0; j < this.game.board.columns; j++) {
                const cell =
                    this.boardContainer.children[
                        i * this.game.board.columns + j
                    ];
                cell.classList.remove('p1', 'p2');
                if (this.game.board.board[i][j].owner !== null) {
                    cell.classList.add(
                        this.game.board.board[i][j].owner ? 'p2' : 'p1'
                    );
                }
                cell.dataset.dots = this.game.board.board[i][j].value;
            }
        }
        if (this.game.gameOver()) {
            alert(`Player ${this.game.currentPlayer ? 1 : 2} wins!`);
        }
    }
}
