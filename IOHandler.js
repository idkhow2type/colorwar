import Board from './Board.js';

export class IOHandler {
    /**
     * @param {Board} board - The game board.
     * @param {function} update - The update function.
     */
    constructor(board, update) {
        this.board = board;
        this.update = update;
    }

    /**
     * Starts the input loop/event listeners.
     */
    startInput() {}

    /**
     * Stops the input loop/event listeners.
     */
    stopInput() {}

    /**
     * Renders the game board.
     */
    render() {}
}

export class DOMIOHandler extends IOHandler {
    /**
     * @param {Board} board - The game board.
     * @param {function} update - The update function.
     * @param {HTMLElement} container - The container element to render the game board in.
     */
    constructor(board, update, container) {
        super(board, update);
        this.container = container;

        this.container.style.setProperty('--rows', this.board.rows);
        this.container.style.setProperty('--cols', this.board.columns);

        for (let i = 0; i < this.board.rows; i++) {
            for (let j = 0; j < this.board.columns; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.container.appendChild(cell);
            }
        }
    }

    startInput() {
        for (let i = 0; i < this.board.rows; i++) {
            for (let j = 0; j < this.board.columns; j++) {
                const cell = this.container.children[i * this.board.columns + j];
                cell.onclick = () => this.update(i, j);
            }
        }
    }

    stopInput() {
        for (let i = 0; i < this.board.rows; i++) {
            for (let j = 0; j < this.board.columns; j++) {
                const cell = this.container.children[i * this.board.columns + j];
                cell.onclick = null;
            }
        }
    }

    render() {
        for (let i = 0; i < this.board.rows; i++) {
            for (let j = 0; j < this.board.columns; j++) {
                const cell =
                    this.container.children[i * this.board.columns + j];
                cell.classList.remove('p1', 'p2');
                if (this.board.board[i][j].owner !== null) {
                    cell.classList.add(
                        this.board.board[i][j].owner ? 'p2' : 'p1'
                    );
                }
                cell.dataset.dots = this.board.board[i][j].value;
            }
        }
    }
}
