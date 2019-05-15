/**
 * @function isDev
 * @description Checks if the main process is running in a development or
 * release environment.
 * @returns True if in a development environment, false if in a release
 * environment.
 */
function isDev() {
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

module.exports = {
    isDev
}
