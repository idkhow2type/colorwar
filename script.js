import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import { BotWorker } from './Bot.js';
import { sleep } from './utils.js';

const settings = {
    rows: 7,
    columns: 7,
    p1: {
        type: 'bot',
        depth: 5,
        scalers: [3, 1.6, 1.3],
    },
    p2: {
        type: 'human',
        depth: 5,
        scalers: [3, 1.6, 1.3],
    },
    delay: {
        move: 200,
        animation: 200,
    },
};

/**
 * @type {Game}
 */
let game;
/**
 * @type {DOMIOHandler}
 */
let io;
/**
 * @type {BotWorker}
 */
let bot1Worker;
/**
 * @type {BotWorker}
 */
let bot2Worker;

function init() {
    game = new Game({
        rows: settings.rows,
        columns: settings.columns,
        player: false,
    });

    io = new DOMIOHandler(game, document.querySelector('.grid'), document.body);

    bot1Worker = new BotWorker('bot1', game, settings.p1.scalers, settings.p1.depth);
    bot2Worker = new BotWorker('bot2', game, settings.p2.scalers, settings.p2.depth);

    window.game = game;
    window.io = io;
    window.bot1 = bot1Worker;
    window.bot2 = bot2Worker;

    io.render();
}

init();

let interrupt;
document.onkeyup = (event) => {
    if (event.key === 'Enter') {
        interrupt();
        init();
    }
};
while (true) {
    await new Promise(async (resolve) => {
        interrupt = resolve;

        // yes this is worse than before
        // but it's funny
        /**
         * @type {Cell}
         */
        const move = game.currentPlayer
            ? settings.p2.type === 'human'
                ? await io.getCell()
                : await (async () => {
                      let best = await bot1Worker.getBest();
                      return best[Math.floor(Math.random() * best.length)].cell;
                  })()
            : settings.p1.type === 'human'
            ? await io.getCell()
            : await (async () => {
                  let best = await bot1Worker.getBest();
                  return best[Math.floor(Math.random() * best.length)].cell;
              })();

        await game.update(
            move.row,
            move.column,
            (() => {
                let depth = 0;
                let spreaded = [];
                return async (queue) => {
                    spreaded.push(queue[0].cell);
                    if (queue.length > 1 && depth === queue[1].depth) return;
                    await io.render(spreaded);
                    if (queue.length > 1) await sleep(settings.delay.animation);
                    depth++;
                    spreaded = [];
                };
            })()
        );
        io.render();

        resolve();
    });

    if (game.gameOver()) {
        await sleep(1000);
        init();
    } else {
        await sleep(settings.delay.move);
    }
}
