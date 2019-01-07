const electron = require('electron');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

function load_training() {
    // Load html
    mainWindow.loadFile('./Assets/HTML/training_window.html');
};

app.on('ready', function() {
    // Create new browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700
    });

    // Load html
    mainWindow.loadFile('./Assets/HTML/mode_select_window.html');

    // Open DevTools
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
        app.quit();
    });
});
