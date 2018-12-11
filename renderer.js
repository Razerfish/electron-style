const electron = require('electron');

const {ipcRenderer, remote} = electron;

function load_train_window() {
    console.log("Training requested.");
    remote.getCurrentWindow().loadFile('./Assets/HTML/training_window.html');
}

function load_stylize_window() {
    console.log("Stylize requested.");
    remote.getCurrentWindow().loadFile('./Assets/HTML/stylize_window.html');
}

document.querySelector('#train_button').addEventListener('click', load_train_window);

document.querySelector('#stylize_button').addEventListener('click', load_stylize_window);
