function isDev() {
    // Checks and returns if the main process is running in a development environment or not.
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

function create_neural_style(args) {
    /*
    Creates a subprocess and passes the given args to it.
    Uses a different binary depending on whether or not it is running in a development environment.
    The process starts paused, to start it write '\n' to stdin.
    */
    const execFile = require('child_process').execFile;

    if (isDev()) {
        return execFile("./src/bin/neural_style/neural_style.exe", [JSON.stringify(args), "-A"]);
    } else {
        return execFile("./resources/app.asar.unpacked/src/bin/neural_style/neural_style.exe", [JSON.stringify(args), "-A"]);
    }
}

function cuda_available() {
    return new Promise((resolve, reject) => {
        const execFile = require("child_process").execFile;
    
        let get_CUDA;
        if (isDev()) {
            get_CUDA = execFile("./src/bin/neural_style/check_cuda.exe");
        } else {
            get_CUDA = execFile("./resources/app.asar.unpacked/src/bin/neural_style/check_cuda.exe");
        }
        
        get_CUDA.stderr.on('data', (data) => {
            reject(data.toString());
        });

        get_CUDA.stdout.on('data', (data) => {
            data = JSON.parse(data.toString());
            if (data["cuda_available"] === "True") {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    
        // Alert the child process that we're ready for output.
        get_CUDA.stdin.write("\n");
    });
}

function parse_data(data) {
    if (data["type"] === "status_update") {
        return "Status: " + data["status"];
    } else if (data["type"] === "dataset_info") {
        global.dataset = data["dataset_length"];
        return "Dataset length: " + dataset;
    } else if (data["type"] === "training_progress") {
        return "Progress: " + data["progress"] + "/" + dataset + " " + data["percent"] + "%";
    } else if (data["type"] === "log") {
        console.log(data["message"]);
    } else {
        return "Unknown type: " + data["type"];
    }
}

function ensure_model() {
    return new Promise((resolve, reject) => {
        // Disable mode select buttons.
        $("#train_button").off("click");
        $("#train_button").prop("disabled", true);
        $("#stylize_button").off("click");
        $("#stylize_button").prop("disabled", true);

        const fs = require('fs');
        const join = require('path').join;
        const homedir = require('os').homedir();

        // Check if vgg16 training model exists.
        fs.exists(join(homedir, ".torch/models/vgg16-397923af.pth"), (exists) => {
            // Hide mode select.
            $("#mode_select").hide();

            if (exists) {
                // If the model file exists, resolve as true.
                resolve(true);
            } else {
                // If it can't be found, download it.
                $("#download").css("display", "block");

                // Ensure that the path to the model exists.
                new Promise((resolve, reject) => {
                    // Check if C:/Users/<username>/.torch exists.
                    fs.exists(join(homedir, ".torch"), (exists) => {
                        if (!exists) {
                            // If it doesn't, create it and .torch/models and then resolve.
                            fs.mkdir(join(homedir, ".torch"), (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    fs.mkdir(join(homedir, ".torch/models"), (err) => {
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
                            fs.exists(join(homedir, ".torch/models"), (exists) => {
                                if (!exists) {
                                    // If it doesn't, create it and then resolve.
                                    fs.mkdir(join(homedir, ".torch/models"), (err) => {
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
                    const https = require('https');

                    // Make sure that a temp model file doesn't already exist.
                    fs.unlink(join(homedir, ".torch/models/vgg16-397923af.pth.tmp"), (err) => {
                        if (err && !err.code === "ENOENT") {
                            reject(err);
                        } else {
                            // Create a write stream to the model file.
                            const model_file = fs.createWriteStream(join(homedir, ".torch/models/vgg16-397923af.pth.tmp"));

                            // Create a get request for the model from download.pytorch.org.
                            const req = https.get("https://download.pytorch.org/models/vgg16-397923af.pth", (res) => {
                                // Pipe the data from the request to the write stream.
                                res.pipe(model_file);

                                // Track the download progress of the model.
                                let downloaded = 0, last = 0, now;
                                res.on('data', (chunk) => {
                                    downloaded += chunk.length;
                                    now = Math.floor((downloaded / res.headers['content-length']) * 100);

                                    // Update the download progress box if it's behind.
                                    if (now > last) {
                                        $("#download_progress").text(now + "%");
                                    }
                                    last = now;
                                });

                                // Once the download is done, disable and hide elements and resolve as true.
                                res.on('end', () => {
                                    // Rename temp file to the proper model name 
                                    fs.rename(join(homedir, ".torch/models/vgg16-397923af.pth.tmp"),
                                    join(homedir, ".torch/models/vgg16-397923af.pth"), (err) => {
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
                            $("#cancel_download").click(function() {
                                // Abort the get request.
                                req.abort();
                                // End the write stream.
                                model_file.end();
                                
                                // Cleanup the unfinished temp file.
                                fs.unlink(join(homedir, ".torch/models/vgg16-397923af.pth.tmp"), (err) => {
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

function load_training() {
    // Stop listening to and disable mode select
    // Show training
    $("#training").css("display", "block");

    let args;
    if (isDev()) {
        args = {
            "subcommand":"train",
            "dataset":"./Testing_Assets/Testing_Assets/dataset",
            "style_image":"./Testing_Assets/Testing_Assets/style_image.jpg",
            "save_model_dir":require('path').join(require('os').homedir(), 'Desktop') + "\\Models",
            "name":"Test_Model",
            "cuda":1
        };
    } else {
        args = {
            "subcommand":"train",
            "dataset":"resources/app.asar.unpacked/Testing_Assets/Testing_Assets/dataset",
            "style_image":"resources/app.asar.unpacked/Testing_Assets/Testing_Assets/style_image.jpg",
            "save_model_dir":require('path').join(require('os').homedir(), 'Desktop') + "\\Models",
            "name":"Test_Model",
            "cuda":1
        };
    }

    const neural_style = create_neural_style(args);

    neural_style.stdout.on('data', (data) => {
        data = parse_data(JSON.parse(data.toString()));
        $("#training_databox").text(data);

        neural_style.stdin.write("\n");
    });

    neural_style.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    neural_style.on('exit', (code) => {
        console.log("neural style exited with code: " + code.toString());
        if (!code === 0) {
            $("#training_infobox").text("Fatal Error");
        } else {
            $("#training_infobox").text("Done");
        }
    });

    // Start neural style
    neural_style.stdin.write("\n");
}

function load_stylize() {
    // Hide mode select
    $("#mode_select").hide();

    // Show stylize
    $("#stylize").css("display", "block");

    let args;
    if (isDev()) {
        args = {
            "subcommand":"eval",
            "content_image":"./Testing_Assets/Testing_Assets/content.jpg",
            "output_image":require('path').join(require('os').homedir(), 'Desktop') + "\\Test_Output.jpg",
            "model":"./Testing_Assets/Testing_Assets/model.pth",
            "cuda":1
        };
    } else {
        args = {
            "subcommand":"eval",
            "content_image":"resources/app.asar.unpacked/Testing_Assets/Testing_Assets/content.jpg",
            "output_image":require('path').join(require('os').homedir(), 'Desktop') + "\\Test_Output.jpg",
            "model":"resources/app.asar.unpacked/Testing_Assets/Testing_Assets/model.pth",
            "cuda":1
        };
    }

    const neural_style = create_neural_style(args);

    neural_style.stdout.on('data', (data) => {
        data = parse_data(JSON.parse(data.toString()));
        $("#stylize_databox").text(data);

        neural_style.stdin.write("\n");
    });

    neural_style.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    neural_style.on('exit', (code) => {
        console.log("neural style exited with code: " + code.toString());
        if (!code === 0) {
            $("#stylize_infobox").text("Fatal Error");
        } else {
            $("#stylize_infobox").text("Done");
        }
    });

    // Start nerual style
    neural_style.stdin.write("\n");
}

// Ensure that the cwd is correct
if (!isDev()) {
    process.chdir(require('path').join(__dirname, "../../.."));
}

$(document).ready(function () {
    $("#train_button").click(function () {
        ensure_model().then((completed) => {
            if (completed) {
                // Make SURE that the model file is present.
                require('fs').exists(require('path').join(require('os').homedir(), ".torch/models/vgg16-397923af.pth"), (exists) => {
                    if (!exists) {
                        console.error("Model file not found");
                        require('electron').remote.getCurrentWindow().reload();
                    } else {
                        load_training();
                    }
                });
            } else {
                require('electron').remote.getCurrentWindow().reload();
            }
        }).catch((err) => {
            throw err;
        });
    });
    $("#stylize_button").click(function () {
        load_stylize();
    });
});