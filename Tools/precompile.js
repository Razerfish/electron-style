const utils = require('./utils');
const exec = require('child_process').exec;
require('colors');

if (utils.checkPython()) {
    const precompile = exec("py Tools/precompile.py");

    precompile.stderr.on('data', (data) => {
        console.error(`${data.toString()}\n`.red);
    });

    precompile.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    precompile.on('exit', (code) => {
        if (code === 0) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    });
} else {
    console.error("Python is not available\n".red);
    process.exit(1);
}
