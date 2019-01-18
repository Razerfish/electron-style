const electron = require('electron');

const {app, BrowserWindow, Menu, MenuItem, ipcMain} = electron;

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

    // Set custom menu
    
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: "Toggle Devtools",
            accelerator: 'F12',
            click: () => {mainWindow.webContents.toggleDevTools();}
        }
    ]));

    // Load html
    mainWindow.loadFile('./Assets/HTML/mode_select.html');

    mainWindow.on('closed', function() {
        app.quit();
    });
});
