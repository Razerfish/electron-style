module.exports = {
    /**
     * @function check_python
     * @description Synchronously checks if the correct python version is available on the host system.
     * @returns Boolean. If python is available returns true, if python is not available returns false.
     */
    check_python: function () {
        const shell = require('shelljs');

        // Check if python is installed.
        if (shell.which("python")) {
            // If python is available check it's version.

            var version = shell.exec("python --version", {silent: true}).stdout.replace(/\r|\n/g, "");

            if (version.match(/^Python 3\.7\.\d$/g)) {
                // If the versions match, return true.
                return true;
            } else {
                // If they don't match, return false.
                return false;
            }
        } else {
            // If python is not available, return false.
            return false;
        }
    },

    /**
     * @function check_env
     * @description Checks if ./env exists and if it does, asks the user if they want to overwrite it and returns the result.
     * @returns Int of either 1, 2 or 3. With 0 meaning do not proceed, 1 meaning proceed and 2 meaning delete existing env and then
     * proceed.
     */
    check_env: function () {
        const fs = require('fs');
        require('colors');

        // Check if virtual environment already exists.
        if (fs.existsSync("./env")) {
            // If env exists, ask the user if they want to overwrite it.
            const readline = require('readline');

            overwrite = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            overwrite.question("env already exists. Do you want to overwrite it? y/n\n", (answer) => {
                overwrite.close();
                if (answer.toLowerCase() === "y") {
                    return 2;
                } else if (answer.toLowerCase() === "n") {
                    return 0;
                } else {
                    console.error(("Unknown option: " + answer + "\n").red);
                    return 0;
                }
            });
        } else {
            return 1;
        }
    }
}
