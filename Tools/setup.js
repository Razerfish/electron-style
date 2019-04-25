/**
 * @function remove_env
 * @returns Promise object that resolves once the ./env folder has been deleted or can reject with an error.
 * @description Deletes an existing python virtual environment found in env.
 */
function remove_env() {
    return new Promise((resolve, reject) => {
        const rimraf = require('rimraf');

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
 * @function create_env
 * @returns Promise object that resolves once a new python virtual environment with all packages installed is successfully
 * created at ./env, or rejects if it fails.
 * @description Creates a new python virtual environment at ./env and installs packages from ./requirements.txt.
 */
function create_env() {
    return new Promise((resolve, reject) => {
        const shell = require('shelljs');
        require('colors');

        // Create virtual environment.
        const create = shell.exec("python -m venv env", {async: true, silent: true});

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
                const execFile = require('child_process').execFile;

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

(async () => {
    const utils = require('./utils');
    require('colors');

    // Check if python is available.
    if (utils.check_python()) {
        // Check if env exists.
        const env_code = utils.check_env();
        if (env_code === 0) {
            // env already exists, do not proceed.
            process.exit(0);
        } else if (env_code === 1) {
            try {
                await create_env();
                process.exit(0);
            } catch (err) {
                console.error(err.toString().red + "\n");
                process.exit(1);
            }
        } else if (env_code === 2) {
            try {
                await remove_env();
                await create_env();
                console.log("\nDone!\n".green);
                process.exit(0);
            } catch (err) {
                console.error(err.toString().red + "\n");
                process.exit(1);
            }
        } else {
            console.error(`Expected code 0, 1 or 2. Got code ${env_code}`.red + "\n");
            process.exit(1);
        }
    } else {
        console.error("Python is not available\n".red);
        process.exit(1);
    }
})().catch(err => {
    require('colors');
    console.error(err.toString().red);
    process.exit(1);
});
