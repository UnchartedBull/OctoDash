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

    if (!big) {
        window = new BrowserWindow({
            width: dev ? 1000 : 480,
            height: 320,
            frame: false,
            fullscreen: false
        })
    } else {
        window = new BrowserWindow({
            width: dev ? 1400 : 800,
            height: 480,
            frame: false,
            fullscreen: false
        })
    }

    if (dev) {
        require('electron-reload')(__dirname, {
            electron: require(`${__dirname}/node_modules/electron`)
        });
        window.loadURL('http://localhost:4200');
    } else {
        window.loadURL(url.format({
            pathname: path.join(__dirname, 'dist/OctoPrintDash/index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }

    if (dev) window.webContents.openDevTools();
    //   window.webContents.openDevTools();

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
