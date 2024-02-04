export default class Cell {
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
