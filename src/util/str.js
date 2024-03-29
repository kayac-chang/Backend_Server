// =============================

// =============================
function slice(origin, pos) {
    const first = origin.slice(0, pos);

    const last = origin.slice(pos);

    return [first, last];
}

function log(msg) {
    return process.stdout.write(msg)
}

// =============================
module.exports = {
    slice, log,
};
