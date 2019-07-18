const {
    app,
    BrowserWindow
} = require("electron");
const url = require('url')
const path = require('path')
const sensor = require('node-dht-sensor')
const Store = require('electron-store');
const store = new Store();


const args = process.argv.slice(1);
const dev = args.some(val => val === '--serve');
const big = args.some(val => val === '--big-screen')

let window;
let config;

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

    if (dev) window.webContents.openDevTools();

    queryTemperatureSensor();

    window.on('closed', () => {
        window = null;
    });
}

function queryTemperatureSensor() {
    console.log("Sending Temperature")
    window.webContents.send("temperatureReading", {
        temperature: 21.4,
        humidity: 54.0
    });
    setTimeout(queryTemperatureSensor, 1500)

    // sensor.read(22, 26, (err, temperature, humidity) => {
    //     if (!err) {
    //         console.log("no-err");
    //         ipcMain.emit("temperatureReading", "tastasttsta");
    //     } else {
    //         window.webContents.send("temperatureReading", {
    //             msg: "Hello There"
    //         });
    //         console.log(err);
    //     }
    // })
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
