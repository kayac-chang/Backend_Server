// ===================================
const Record = require('../database/mongo/model/record');

const Mongo = require('../database/mongo');

const {DB} = require('../../config');

// ===================================

async function fetchHistoryCounts(req) {
    const game = req.params.game;

    await Mongo(DB.CMS[game]);

    const counts = await Record.countDocuments({});

    return process.send({counts});
}

function main() {
    process.on('message', fetchHistoryCounts);
}

main();
