class Cell {
    /**
     * @param {number} row
     * @param {number} column
     * @param {Game} game
     * @param {number} value
     * @param {string} owner
     */
    constructor(row, column, game, value = 0, owner = null) {
        this.row = row;
        this.column = column;
        this.game = game;
        this.value = value;
        this.owner = owner;
        this.element = document.createElement('div');
        this.element.classList.add('cell');
        this.element.onclick = () => this.game.update(this);
    }

    /**
     * Updates the cell's value and owner.
     * @param {number} value
     * @param {string} owner
     */
    update(value, owner) {
        this.value = value;
        this.owner = owner;
        this.element.classList.remove('p1', 'p2');
        this.element.classList.add(owner);
        this.element.dataset.dots = value;
    }
}

/**
 * Represents a game board.
 * @class
 */
class Board {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     * @param {Game} game - The game instance.
     * @param {HTMLElement} element - The HTML element representing the board.
     */
    constructor(rows, columns, game, element) {
        this.board = [];
        this.rows = rows;
        this.columns = columns;
        this.game = game;
        this.element = element;
        this.element.style.setProperty('--cols', this.columns);
        this.element.style.setProperty('--rows', this.rows);
        this.createBoard();
    }

    /**
     * Creates the game board by initializing the cells.
     */
    createBoard() {
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.columns; j++) {
                this.board[i][j] = new Cell(i, j, this.game);
                this.element.appendChild(this.board[i][j].element);
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
                neighbor.update(neighbor.value + 1, game.currentPlayer);
                if (neighbor.value >= 4) {
                    queue.push(neighbor);
                }
            }
            if (this.game.gameOver()) return
        }
    }
}

class Game {
    /**
     * @param {number} rows - The number of rows in the board.
     * @param {number} columns - The number of columns in the board.
     * @param {HTMLElement} element - The HTML element representing the board.
     * @param {string} player - The current player.
     */
    constructor(rows, columns, element, player) {
        this.board = new Board(rows, columns, this, element);
        this.currentPlayer = player;
        document.body.classList.add(this.currentPlayer);
        this.turn = 0;
    }

    /**
     * Updates the game state.
     * @param {Cell} cell - The cell that was clicked.
     */
    update(cell) {
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

            if (this.gameOver()) {
                alert(`Player ${this.currentPlayer} wins!`);
            }
        }

        this.currentPlayer = this.currentPlayer === 'p1' ? 'p2' : 'p1';
        document.body.classList.remove('p1', 'p2');
        document.body.classList.add(this.currentPlayer);
        this.turn++;
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

const game = new Game(5, 5, document.querySelector('.grid'), 'p1');

// TODO: split logic into 2 parts, one for the game and one for the UI
