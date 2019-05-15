const $ = require('jquery');
const electron = require('electron');
const helpers = require('./helpers');
const torchbrain = require('./torchbrain');

const execFile = require("child_process").execFile;

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');

function ensureModel() {
    return new Promise((resolve, reject) => {
        // Disable mode select buttons.
        $("#train_button").off("click");
        $("#train_button").prop("disabled", true);
        $("#stylize_button").off("click");
        $("#stylize_button").prop("disabled", true);

        // Check if vgg16 training model exists.
        fs.exists(path.join(os.homedir(), ".torch/models/vgg16-397923af.pth"), (exists) => {
            // Hide mode select.
            $("#mode_select").hide();

            if (exists) {
                // If the model file exists, resolve as true.
                resolve(true);
            } else {
                // If it can't be found, download it.
                $("#download").css("display", "block");

                /* eslint-disable no-shadow */
                // Ensure that the path to the model exists.
                new Promise((resolve, reject) => {
                    // Check if C:/Users/<username>/.torch exists.
                    fs.exists(path.join(os.homedir(), ".torch"), (exists) => {
                        if (!exists) {
                            // If it doesn't, create it and .torch/models and then resolve.
                            fs.mkdir(path.join(os.homedir(), ".torch"), (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    fs.mkdir(path.join(os.homedir(), ".torch/models"), (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve();
                                        }
                                    });
                                }
                            });
                        } else {
                            // If it does exist, check if .torch/models exists.
                            fs.exists(path.join(os.homedir(), ".torch/models"), (exists) => {
                                if (!exists) {
                                    // If it doesn't, create it and then resolve.
                                    fs.mkdir(path.join(os.homedir(), ".torch/models"), (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve();
                                        }
                                    });
                                } else {
                                    // If it does exist, resolve.
                                    resolve();
                                }
                            });
                        }
                    });
                }).then(() => {
                    // Download model
                    // Make sure that a temp model file doesn't already exist.
                    fs.unlink(path.join(os.homedir(), ".torch/models/vgg16-397923af.pth.tmp"), (err) => {
                        if (err && !err.code === "ENOENT") {
                            reject(err);
                        } else {
                            // Create a write stream to the model file.
                            const modelFile = fs.createWriteStream(path.join(os.homedir(), ".torch/models/vgg16-397923af.pth.tmp"));

                            // Create a get request for the model from download.pytorch.org.
                            const req = https.get("https://download.pytorch.org/models/vgg16-397923af.pth", (res) => {
                                // Pipe the data from the request to the write stream.
                                res.pipe(modelFile);

                                // Track the download progress of the model.
                                let downloaded = 0;
                                let last = 0;
                                let now;
                                res.on('data', (chunk) => {
                                    downloaded += chunk.length;
                                    now = Math.floor((downloaded / res.headers['content-length']) * 100);

                                    // Update the download progress box if it's behind.
                                    if (now > last) {
                                        $("#download_progress").text(`${now}%`);
                                    }
                                    last = now;
                                });

                                /*
                                Once the download is done, disable and hide elements and
                                resolve as true.
                                */
                                res.on('end', () => {
                                    // Rename temp file to the proper model name 
                                    fs.rename(path.join(os.homedir(), ".torch/models/vgg16-397923af.pth.tmp"),
                                    path.join(os.homedir(), ".torch/models/vgg16-397923af.pth"), (err) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            // Cleanup and resolve
                                            $("#cancel_download").prop("disabled", true);
                                            $("#cancel_download").off("click");
                                            $("#download").hide();
                                            resolve(true);
                                        }
                                    });
                                });
                            });

                            // Handle canceling of the download.
                            $("#cancel_download").click(() => {
                                // Abort the get request.
                                req.abort();
                                // End the write stream.
                                modelFile.end();
                                
                                // Cleanup the unfinished temp file.
                                fs.unlink(path.join(os.homedir(), ".torch/models/vgg16-397923af.pth.tmp"), (err) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(false);
                                    }
                                });
                            });
                            // Enable the cancel download button.
                            $("#cancel_download").prop("disabled", false);
                        }
                    });
                }).catch((err) => {
                    reject(err);
                });
            }
        });
    });
}
/* eslint-enable no-shadow */

function loadTraining() {
    // Stop listening to and disable mode select
    // Show training
    $("#training").css("display", "block");

    /* Training sample arguments
    {
        subcommand: "train",
        dataset: "./Testing_Assets/Testing_Assets/dataset",
        style_image: "./Testing_Assets/Testing_Assets/style_image.jpg",
        save_model_dir: path.join(os.homedir(), "Desktop", "Models"),
        name: "Test_Model",
        cuda: 1
    }
    */
}

function loadStylize() {
    // Hide mode select
    $("#mode_select").hide();

    // Show stylize
    $("#stylize").css("display", "block");

    /* Stylize sample arguments
    {
        subcommand: "eval",
        content_image: "./Testing_Assets/Testing_Assets/content.jpg",
        output_image: path.join(os.homedir(), "Desktop", "Test_Output.jpg"),
        model: "./Testing_Assets/Testing_Assets/model.pth",
        cuda: 1
    }
    */
}

// Ensure that the cwd is correct
if (!helpers.isDev()) {
    process.chdir(path.join(__dirname, "../../.."));
}

/* eslint-disable no-undef */
$(document).ready(() => {
/* eslint-enable no-undef */
    $("#train_button").click(() => {
        ensureModel().then((completed) => {
            if (completed) {
                // Make SURE that the model file is present.
                fs.exists(path.join(os.homedir(), ".torch/models/vgg16-397923af.pth"), (exists) => {
                    if (!exists) {
                        console.error("Model file not found");
                        electron.remote.getCurrentWindow().reload();
                    } else {
                        loadTraining();
                    }
                });
            } else {
                electron.remote.getCurrentWindow().reload();
            }
        }).catch((err) => {
            throw err;
        });
    });
    $("#stylize_button").click(() => {
        loadStylize();
    });
});
