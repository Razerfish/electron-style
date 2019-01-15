module.exports = {
    parse_data: function(data, dataBox) {
        if (data["type"] === "status_update") {
            dataBox.innerHTML = "Status: " + data["status"];
        } else if (data["type"] === "dataset_info") {
            global.dataset = data["dataset_length"];
            dataBox.innerHTML = "Dataset length: " + dataset;
        } else if (data["type"] === "training_progress") {
            dataBox.innerHTML = "Progress: " + data["progress"] + "/" + dataset + " " + data["percent"] + "%";
        } else {
            dataBox.innerHTML = "Unknown type: " + data["type"];
        }
    },

    isDev: function() {
        return process.mainModule.filename.indexOf('app.asar') === -1;
    }
};
