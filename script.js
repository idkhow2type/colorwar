class Cell {
    /**
     * @param {number} row
     * @param {number} column
     * @param {number} value
     * @param {string} owner
     */
    constructor(row, column, value = 0, owner = null) {
        this.row = row;
        this.column = column;
        this.value = value;
        this.owner = owner;
    }

    /**
     * Updates the cell's value and owner.
     * @param {number} value
     * @param {string} owner
     */
    update(value, owner) {
        this.value = value;
        this.owner = owner;
    }
}

class Board {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     */
    constructor(rows, columns) {
        this.board = [];
        this.rows = rows;
        this.columns = columns;
        this.#createBoard();
    }

    /**
     * Creates the game board by initializing the cells.
     */
    #createBoard() {
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.board[i][j] = new Cell(i, j);
            }
        }
    }

    /**
     * Gets the cells that match the given predicate.
     * @param {function} predicate - The predicate function used to filter the cells.
     * @returns {Array} - The filtered cells.
     */
    getCells(predicate) {
        predicate = predicate || (() => true);
        return this.board.flat().filter(predicate);
    }

    /**
     * Spreads the dots to the adjacent cells.
     * @param {Cell} cell - The cell to spread the dots from.
     */
    spread(cell) {
        const owner = cell.owner;
        const queue = [cell];
        while (queue.length > 0) {
            const current = queue.shift();
            current.update(0, null);
            const neighbors = this.getCells(
                (neighbor) =>
                    Math.abs(current.row - neighbor.row) +
                        Math.abs(current.column - neighbor.column) ===
                    1
            );
            for (const neighbor of neighbors) {
                neighbor.update(neighbor.value + 1, owner);
                if (neighbor.value >= 4) {
                    queue.push(neighbor);
                }
            }
            if (
                this.getCells((cell) => cell.value > 0).every(
                    (cell) => cell.owner === this.currentPlayer
                )
            )
                return;
        }
    }
}

class IOHandler {
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

class DOMIOHandler extends IOHandler {
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

class Game {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     * @param {string} player - The current player.
     * @param {typeof IOHandler} io - The input/output handler constructor.
     * @param {...any} ioArgs - The arguments to pass to the io constructor.
     */
    constructor(rows, columns, player, io, ...ioArgs) {
        this.board = new Board(rows, columns, this);
        this.currentPlayer = player;
        this.turn = 0;
        this.io = new io(
            this.board.rows,
            this.board.columns,
            this.board,
            this.update.bind(this),
            ...ioArgs
        );
        this.io.render();
        this.io.startInput();
    }

    /**
     * Updates the game state.
     * @param {number} i - The row index of the cell.
     * @param {number} j - The column index of the cell.
     */
    update(i, j) {
        const cell = this.board.board[i][j];
        if (this.turn < 2) {
            if (cell.value !== 0) return;
            cell.update(3, this.currentPlayer);
        } else {
            if (cell.value === 0) return;
            if (cell.owner !== this.currentPlayer) return;
            cell.update(cell.value + 1, cell.owner);

            if (cell.value >= 4) {
                this.board.spread(cell);
            }
        }

        this.currentPlayer = this.currentPlayer === 'p1' ? 'p2' : 'p1';
        this.turn++;

        this.io.render();
    }

    /**
     * Checks if the game is over.
     * @returns {boolean} - True if the game is over, false otherwise.
     */
    gameOver() {
        return this.board
            .getCells((cell) => cell.value > 0)
            .every((cell) => cell.owner === this.currentPlayer);
    }
}

const game = new Game(
    5,
    5,
    'p1',
    DOMIOHandler,
    document.querySelector('.grid')
);

// TODO: split logic into 2 parts, one for the game and one for the UI
