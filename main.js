const {
    app,
    BrowserWindow
} = require("electron");
const url = require('url')
const path = require('path')
const ipcMain = require('electron').ipcMain

const args = process.argv.slice(1);
const dev = args.some(val => val === '--serve');
const big = args.some(val => val === '--big-screen')


let window;

function createWindow() {

    setupIPC();

    if (!big) {
        window = new BrowserWindow({
            width: dev ? 1000 : 1000,
            height: dev ? 342 : 320,
            frame: dev ? true : false,
            fullscreen: dev ? false : true,
            webPreferences: {
                nodeIntegration: true
            }
        })
    } else {
        window = new BrowserWindow({
            width: dev ? 1400 : 800,
            height: dev ? 502 : 480,
            frame: dev ? true : false,
            fullscreen: dev ? false : true,
            webPreferences: {
                nodeIntegration: true
            }
        })
    }

    if (dev) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`)
        });
        window.loadURL('http://localhost:4200');
    } else {
        window.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    // if (dev) window.webContents.openDevTools();
    window.webContents.openDevTools();

    window.on('closed', () => {
        window = null;
    });
}

function setupIPC() {
    ipcMain.on("config", (event, arg) => {
        console.log("Received config request");
        event.returnValue = "test123";
    })
}

app.on('ready', createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (window === null) {
        createWindow();
    }
});
