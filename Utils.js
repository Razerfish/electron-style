module.exports = {
    parse_data: function(data, dataBox) {
        if (data["type"] === "status_update") {
            dataBox.innerHTML = "Status: " + data["status"];
        } else if (data["type"] === "dataset_info") {
            global.dataset = data["dataset_length"];
            dataBox.innerHTML = "Dataset length: " + dataset;
        } else if (data["type"] === "training_progress") {
            dataBox.innerHTML = "Progress: " + data["progress"] + "/" + dataset + " " + data["percent"] + "%";
        } else if (data["type"] === "log") {
            console.log(data["message"]);
        } else {
            dataBox.innerHTML = "Unknown type: " + data["type"];
        }
    },

    isDev: function() {
        return process.mainModule.filename.indexOf('app.asar') === -1;
    },

    isCUDA: function() {
        const execFile = require('child_process').execFile;
        const isDev = module.exports.isDev();

        let path;
        if (isDev) {
            path = "./Assets/bin/neural_style/check_cuda.exe";
        } else {
            path = "./resources/app.asar.unpacked/Assets/bin/neural_style/check_cuda.exe";
        }

        const get_CUDA = execFile(path, []);
        let cuda;

        get_CUDA.stdout.on('data', (data) => {
            data = JSON.parse(data.toString());
            if (data["cuda_available"] === "True") {
                console.log("CUDA is available.");
                cuda = true;
            } else {
                console.log("CUDA is not available.");
                cuda = false;
            }
        });

        get_CUDA.stderr.on('data', (data) => {
            console.error(data.toString());
            console.error("Assuming that CUDA is unavailable.");
            cuda = false;
        });
    }
};
