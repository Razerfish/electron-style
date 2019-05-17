// Get isDev
let isDev;
try {
    isDev = process.mainModule.filename.indexOf('app.asar') === -1;
} catch (err) {
    isDev = true;
}

module.exports = {
    isDev
}
