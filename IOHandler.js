export class IOHandler {
    constructor(rows, columns, board, update) {
        this.rows = rows;
        this.columns = columns;
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
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     * @param {Board} board - The game board.
     * @param {function} update - The update function.
     * @param {HTMLElement} container - The container element to render the game board in.
     */
    constructor(rows, columns, board, update, container) {
        super(rows, columns, board, update);
        this.container = container;

        this.container.style.setProperty('--rows', this.rows);
        this.container.style.setProperty('--cols', this.columns);

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.container.appendChild(cell);
            }
        }
    }

    startInput() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const cell = this.container.children[i * this.columns + j];
                cell.onclick = () => this.update(i, j);
            }
        }
    }

    stopInput() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const cell = this.container.children[i * this.columns + j];
                cell.onclick = null;
            }
        }
    }

    render() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                const cell = this.container.children[i * this.columns + j];
                cell.classList.remove('p1', 'p2');
                cell.classList.add(this.board.board[i][j].owner);
                cell.dataset.dots = this.board.board[i][j].value;
            }
        }
    }
}
