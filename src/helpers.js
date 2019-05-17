const fs = require('fs');

// Get isDev
let isDev;
try {
    isDev = process.mainModule.filename.indexOf('app.asar') === -1;
} catch (err) {
    isDev = true;
}

/**
 * @function verifyPath
 * @description Check if the item a path points to actually exists.
 * @param {*} path String. Path to item.
 * @returns Promise that resolve true if the item exists and false if it doesn't.
 */
function verifyPath(path) {
    return fs.existsSync(path);
}

module.exports = {
    isDev,
    verifyPath
}
