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

function load_training() {
    // Hide mode select
    $("#mode_select").hide();
    
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
        load_training();
    });
    $("#stylize_button").click(function () {
        load_stylize();
    });
});