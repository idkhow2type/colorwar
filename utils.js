/**
 * Shuffles array in place. ES6 version
 * @param {Array} array items An array containing the items.
 * @returns {Array} shuffled array
 */
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Compares two numbers with an operator to a certain precision.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @param {string} operator - The operator.
 * @param {number} epsilon - The precision.
 * @returns {boolean} - The comparison result.
 */
export function nearCompare(a, b, operator, epsilon = 1e-6) {
    return operator === '>'
        ? a - epsilon > b
        : operator === '<'
        ? a + epsilon < b
        : operator === '>='
        ? a + epsilon >= b
        : operator === '<='
        ? a - epsilon <= b
        : operator === '=='
        ? (Math.abs(a - b) || 0) < epsilon
        : false;
}

/**
 * Returns a promise that resolves after a certain amount of time.
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Toggle a CSS class and resolve when the transition ends.
 * @param {HTMLElement} element - The element to animate.
 * @param {string} cssClass - The animation to play.
 * @param {string} propertyName - The property name to check for.
 * @returns {Promise<void>} - Resolves when the animation ends.
 */
export function toggleTransitionedClass(element, cssClass, propertyName) {
    return new Promise((resolve) => {
        element.ontransitionend = (e) => {
            if (propertyName && e.propertyName !== propertyName) return;
            element.ontransitionend = null;
            resolve();
        };
        element.classList.toggle(cssClass);
    });
}
