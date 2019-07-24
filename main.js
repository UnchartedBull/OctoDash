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
const big = args.some(val => val === '--big')

let window;
let config;

function createWindow() {
    config = store.get("config");
    store.onDidChange("config", (newValue, _) => {
        config = newValue
    })
    const {
        screen
    } = require('electron')
    const mainScreen = screen.getPrimaryDisplay();
    window = new BrowserWindow({
        width: dev ? big ? 1080 : 1400 : mainScreen.size.width,
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

    if (config && config.octodash && config.octodash.temperatureSensor !== null) {
        queryTemperatureSensor();
    }

    window.on('closed', () => {
        window = null;
    });
}

function queryTemperatureSensor() {
    if (process.platform !== "linux") {
        sensor.initialize({
            test: {
                fake: {
                    temperature: 23.4,
                    humidity: 54.0
                }
            }
        })
    }
    sensor.read(config.octodash.temperatureSensor.type, config.octodash.temperatureSensor.gpio, (err, temperature, humidity) => {
        if (!err) {
            window.webContents.send("temperatureReading", {
                temperature: temperature.toFixed(1),
                humidity: humidity.toFixed(1)
            });
        } else {
            window.webContents.send("temperatureReading", {
                temperature: 0.0,
                humidity: 0.0
            });
            console.log(err);
        }
        setTimeout(queryTemperatureSensor, 10000)
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
