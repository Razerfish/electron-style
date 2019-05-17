const helpers = require('./helpers');

const execFile = require('child_process').execFile;
const fs = require('fs');

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

/**
 * @function createNeuralProcess
 * @description Creates a Neural style process.
 * @param {*} args JSON object. Arguments to pass to Neural Style.
 * @returns Childprocess with Neural Style running.
 */
function createNeuralProcess(args) {
    // Get torchbrain binary location.
    let torchPath;
    if (helpers.isDev) {
        torchPath = "./src/bin/torchbrain/torchbrain.exe";
    } else {
        torchPath = "./resources/app.asar.unpacked/src/bin/torchbrain/torchbrain.exe";
    }

    // Verify that binary exists.
    if (helpers.verifyPath(torchPath)) {
        // If the binary is present, then create and return Neural Style process.
        return execFile(torchPath, ["neural_style", JSON.stringify(args)]);
    } else {
        // Otherwise, throw an error.
        throw new Error("Could not find torchbrain binary");
    }
}

class NeuralStyle extends EventEmitter {
    constructor(args) {
        this.dataset;
        this.errors = [];
        this.
    }
}

module.exports = {
    checkCuda
}
