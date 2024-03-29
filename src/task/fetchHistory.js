// ===================================
const moment = require('moment');

const {isEmpty} = require('rambda');

const Record = require('../database/mongo/model/record');
const getHistoryCounts = require('../database/mysql/func/getHistoryCounts');
const getHistory = require('../database/mysql/func/getHistory');

const MySQL = require('../database/mysql');
const Mongo = require('../database/mongo');

const {DB} = require('../../config');

// ===================================

async function syncDBData(gameDB) {
    const date = moment().format('YYYYMMDD');

    const count = await Record.countDocuments({date});
    const currentCount = await getHistoryCounts(gameDB, date);

    if (currentCount === count) return;

    const history = await getHistory(gameDB, date);
    await Record.deleteMany({date});
    await Record.insertMany(history);
}

async function fetchHistory(req) {
    const game = req.params.game;

    const [gameDB] =
        await Promise.all([
            MySQL(DB.GAME[game]),
            Mongo(DB.CMS[game]),
        ]);

    await syncDBData(gameDB);

    if (isEmpty(req.query)) {
        const history = await findLatest();

        return process.send(history);
    }

    const {
        uid, userID, timeStart, timeEnd
    } = req.query;

    const history = await (
        (uid) ? findByUID :
            (userID || timeStart || timeEnd) ? findByUserOrTime :
                findByRange
    )(req.query);

    return process.send(history);
}

function findLatest() {
    return Record.find()
        .sort({time: -1})
        .limit(100);
}

function findByUID({uid}) {
    uid = String(uid);

    return Record.find({uid})
        .sort({time: -1});
}

function findByUserOrTime({userID, timeStart, timeEnd}) {

    const $lte = timeEnd ? moment(timeEnd, 'YYYYMMDDHHmm').toDate() : undefined;
    const $gte = timeStart ? moment(timeStart, 'YYYYMMDDHHmm').toDate() : undefined;

    const time = {};
    if ($gte) time.$gte = $gte;
    if ($lte) time.$lte = $lte;

    const filter = {};
    if (userID) filter.userID = userID;
    if (!isEmpty(time)) filter.time = time;

    return Record.find(filter)
        .sort({time: -1});
}

function findByRange({from, limit}) {
    from = Number(from);
    limit = Number(limit);

    return Record.find()
        .skip(from)
        .sort({time: -1})
        .limit(limit);
}

function main() {
    process.on('message', fetchHistory);
}

main();
