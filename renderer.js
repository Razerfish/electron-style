function isDev() {
    // Checks and returns if the main process is running in a development environment or not.
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

function create_neural_style(args) {
    /* Creates a subprocess and passes the given args to it.
    Uses a different binary depending on whether or not it is running in a development environment. */
    const execFile = require('child_process').execFile;

    if (isDev()) {
        return execFile("./Assets/bin/neural_style/neural_style.exe", [JSON.stringify(args)]);
    } else {
        return execFile("./resources/app.asar.unpacked/Assets/bin/neural_style/neural_style.exe", [JSON.stringify(args)]);
    }
}

function isCUDA() {
    const execFile = require("child_process").execFile;
    
    let get_CUDA;
    if (isDev()) {
        get_CUDA = execFile("./Assets/bin/neural_style/check_cuda.exe");
    } else {
        get_CUDA = execFile("./resources/app.asar.unpacked/Assets/bin/neural_style/check_cuda.exe");
    }
    
    get_CUDA.stdout.on('data', (data) => {
        data = JSON.parse(data.toString());
        if (data["cuda_available"] === "True") {
            console.log("CUDA is available");
            return true;
        } else {
            console.log("CUDA is not available");
            return false;
        }
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