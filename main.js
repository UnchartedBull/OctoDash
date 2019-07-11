const {
  app,
  BrowserWindow
} = require("electron");

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');
const big = args.some(val => val === '--big-screen')

let window;

function createWindow() {

    if(!big) {
        window = new BrowserWindow({
          width: serve ? 1000 : 480,
          height: 320,
          frame: false,
          fullscreen: false
        })
    } else {
        window = new BrowserWindow({
            width: serve ? 1400 : 800,
            height: 480,
            frame: false,
            fullscreen: false
          })
    }

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    window.loadURL('http://localhost:4200');
  } else {
    window.loadFile('index.html')
  }

  if (serve) window.webContents.openDevTools();
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
