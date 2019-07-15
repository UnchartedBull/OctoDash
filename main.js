const {
    app,
    BrowserWindow
} = require("electron");
const url = require('url')
const path = require('path')

const args = process.argv.slice(1);
const dev = args.some(val => val === '--serve');
const big = args.some(val => val === '--big-screen')

let window;

function createWindow() {
    const {
        screen
    } = require('electron')
    const mainScreen = screen.getPrimaryDisplay();
    window = new BrowserWindow({
        width: dev ? big ? 1000 : 1400 : mainScreen.size.width,
        height: dev ? big ? 342 : 502 : mainScreen.size.height,
        frame: dev ? true : false,
        fullscreen: dev ? false : true,
        webPreferences: {
            nodeIntegration: true
        }
    })

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

    if (dev) window.webContents.openDevTools();

    window.on('closed', () => {
        window = null;
    });
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
