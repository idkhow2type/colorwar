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

let game, io, bot1Worker, bot2Worker;
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
while (true) {
    /**
     * @type {Cell}
     */
    let move;

    if (game.currentPlayer) {
        if (settings.p2.type === 'human') {
            move = await io.getCell();
        } else {
            const best = await bot1Worker.getBest();
            move = best[Math.floor(Math.random() * best.length)].cell;
        }
    } else {
        if (settings.p1.type === 'human') {
            move = await io.getCell();
        } else {
            const best = await bot2Worker.getBest();
            move = best[Math.floor(Math.random() * best.length)].cell;
        }
    }

    if (move) {
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
    }
    io.render();

    if (game.gameOver()) {
        await sleep(1000);
        init();
    }

    await sleep(settings.delay.move);
}
