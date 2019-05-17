const helpers = require('./helpers');

const execFile = require('child_process').execFile;

/**
 * @function checkCuda
 * @description Checks if CUDA is available on the host system.
 * @returns A promise that resolves true if cuda is available, false if it isn't or can reject with an error.
 */
function checkCuda() {
    return new Promise((resolve, reject) => {
        // Get location of torchbrain binary
        let torchPath;
        if (helpers.isDev) {
            torchPath = "./src/bin/torchbrain/torchbrain.exe";
        } else {
            torchPath = "./resources/app.asar.unpacked/src/bin/torchbrain/torchbrain.exe";
        }

        const torchProcess = execFile(torchPath, ["check_cuda"]);

        torchProcess.stdout.on('data', (data) => {
            data = JSON.parse(data.toString());

            if (data.type === "cuda_available") {
                resolve(data.data);
            } else {
                reject(`Unknown datatype: ${data.type}`);
            }
        });

        torchProcess.stderr.on('data', (data) => {
            try {
                parsedData = JSON.parse(parsedData.toString());

                if (parsedData.type === "error") {
                    reject(parsedData.data);
                } else {
                    reject(JSON.stringify(parsedData));
                }
            } catch (err) {
                reject(data.toString());
            }
        });
    });
}

module.exports = {
    checkCuda
}
