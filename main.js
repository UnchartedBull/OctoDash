const {
    app,
    BrowserWindow
} = require("electron");
const url = require('url')
const path = require('path')
const Store = require('electron-store');
const store = new Store();
const exec = require('child_process').exec;
const {
    ipcMain
} = require('electron')

const args = process.argv.slice(1);
const dev = args.some(val => val === '--serve');
const big = args.some(val => val === '--big')

let window;

function createWindow() {
    config = store.get("config");
    store.onDidChange("config", (newValue) => {
        config = newValue
    })
    const {
        screen
    } = require('electron')
    const mainScreen = screen.getPrimaryDisplay();
    window = new BrowserWindow({
        width: dev ? big ? 1400 : 1080 : mainScreen.size.width,
        height: dev ? big ? 502 : 342 : mainScreen.size.height,
        frame: dev ? true : false,
        backgroundColor: '#353b48',
        webPreferences: {
            nodeIntegration: true
        },
        icon: path.join(__dirname, 'src/assets/icon.png')
    })

    config = store.get("config")

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

    if (!dev) {
        window.setFullScreen(true)
    } else {
        window.webContents.openDevTools();
    }

    setTimeout(sendVersionInfo, 42 * 1000);
    activateScreenSleepListener();
    window.on('closed', () => {
        window = null;
    });
}

function activateScreenSleepListener() {
    ipcMain.on("screenSleep", () => {
        exec('xset dpms force standby')
    })

    ipcMain.on("screenWakeup", () => {
        exec('xset -dpms')
    })
}

function sendVersionInfo() {
    window.webContents.send("versionInformation", {
        version: app.getVersion()
    })
}

app.on('ready', createWindow)

app.on("window-all-closed", () => {
    app.quit()
});

app.on("activate", () => {
    if (window === null) {
        createWindow();
    }
});
