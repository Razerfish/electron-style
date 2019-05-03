const rimraf = require('rimraf');
const shell = require('shelljs');
const utils = require('./utils');
const execFile = require('child_process').execFile;

require('colors');


/**
 * @function removeEnv
 * @returns Promise object that resolves once the ./env folder has been deleted or can 
 * reject with an error.
 * @description Deletes an existing python virtual environment found in env.
 */
function removeEnv() {
    return new Promise((resolve, reject) => {
        rimraf("env", (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * @function createEnv
 * @returns Promise object that resolves once a new python virtual environment with all packages is
 * installed successfully.
 * created at ./env, or rejects if it fails.
 * @description Creates a new python virtual environment at ./env and installs packages from
 * ./requirements.txt.
 */
function createEnv() {
    /* eslint-disable no-shadow */
    return new Promise((resolve, reject) => {
        // Create virtual environment.
        const create = shell.exec("python -m venv env", { async: true, silent: true });

        create.stdout.on('data', (data) => {
            process.stdout.write(data.toString());
        });

        create.stderr.on('data', (data) => {
            process.stderr.write(data.toString().red);
        });

        create.on('exit', (code) => {
            if (code !== 0) {
                reject();
            } else {
                // Upgrade pip and setuptools
                const upgrade = execFile("./env/Scripts/python.exe", [
                    '-m',
                    'pip',
                    'install',
                    '-U',
                    'pip',
                    'setuptools'
                ]);

                upgrade.stdout.on('data', (data) => {
                    process.stdout.write(data.toString());
                });

                upgrade.stderr.on('data', (data) => {
                    process.stderr.write(data.toString().red);
                });

                upgrade.on('exit', (code) => {
                    if (code === 0) {
                        // Install packages from requirements.txt
                        const install = execFile("./env/Scripts/pip.exe", [
                            'install',
                            '-r',
                            'requirements.txt'
                        ]);

                        install.stdout.on('data', (data) => {
                            process.stdout.write(data.toString());
                        });

                        install.stderr.on('data', (data) => {
                            process.stderr.write(data.toString().red);
                        });

                        install.on('exit', (code) => {
                            if (code === 0) {
                                resolve();
                            } else {
                                reject();
                            }
                        });
                    } else {
                        reject();
                    }
                });
            }
        });
    });
}
/* eslint-enable no-shadow */

(async () => {
    // Check if python is available.
    if (utils.checkPython()) {
        // Check if env exists.
        const envCode = utils.checkEnv();
        if (envCode === 0) {
            // env already exists, do not proceed.
            process.exit(0);
        } else if (envCode === 1) {
            try {
                await createEnv();
                process.exit(0);
            } catch (err) {
                console.error(`${err.toString()}\n`.red);
                process.exit(1);
            }
        } else if (envCode === 2) {
            try {
                await removeEnv();
                await createEnv();
                console.log("\nDone!\n".green);
                process.exit(0);
            } catch (err) {
                console.error(`${err.toString()}\n`.red);
                process.exit(1);
            }
        } else {
            console.error(`Expected code 0, 1 or 2. Got code ${envCode}\n`.red);
            process.exit(1);
        }
    } else {
        console.error("Python is not available\n".red);
        process.exit(1);
    }
})().catch((err) => {
    console.error(err.toString().red);
    process.exit(1);
});
