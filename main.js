/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow, ipcMain } = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");

const store = new Store();
const exec = require("child_process").exec;

const args = process.argv.slice(1);
const dev = args.some((val) => val === "--serve");
const big = args.some((val) => val === "--big");

app.commandLine.appendSwitch("touch-events", "enabled");
app.allowRendererProcessReuse = true;

let window;

function createWindow() {
  config = store.get("config");
  store.onDidChange("config", (newValue) => {
    config = newValue;
  });

  const { screen, session } = require("electron");

  if (!dev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          // TODO: re-enable
          // "Content-Security-Policy": ["script-src 'self'"],
        },
      });
    });
  }

  const mainScreen = screen.getPrimaryDisplay();

  window = new BrowserWindow({
    width: dev ? (big ? 1400 : 1080) : mainScreen.size.width,
    height: dev ? (big ? 502 : 342) : mainScreen.size.height,
    frame: dev ? true : false,
    backgroundColor: "#353b48",
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, "src", "assets", "icon", "icon.png"),
  });

  if (dev) {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
    });
    window.loadURL("http://localhost:4200");
    window.webContents.openDevTools();
  } else {
    window.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
    window.setFullScreen(true);
  }

  activateAppInfoListener();
  activateScreenSleepListener();
  activateReloadListener();
  activateUpdateListener();

  window.on("closed", () => {
    window = null;
  });
}

function activateScreenSleepListener() {
  ipcMain.on("screenSleep", () => {
    exec("xset dpms force standby");
  });

  ipcMain.on("screenWakeup", () => {
    exec("xset s off");
    exec("xset -dpms");
    exec("xset s noblank");
  });
}

function activateReloadListener() {
  ipcMain.on("reload", () => {
    window.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  });
}

function activateAppInfoListener() {
  ipcMain.on("appInfo", () => {
    sendCustomStyles();
    sendVersionInfo();
  });
}

function activateUpdateListener() {
  ipcMain.on("update", (_, updateInfo) => {
    downloadUpdate(updateInfo);
  });
}

function sendCustomStyles() {
  fs.readFile(path.join(app.getPath("userData"), "custom-styles.css"), "utf-8", (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.writeFile(path.join(app.getPath("userData"), "custom-styles.css"), "", (err) => {
          if (err) {
            window.webContents.send("customStylesError", err);
          } else {
            window.webContents.send("customStyles", "");
          }
        });
      } else {
        window.webContents.send("customStylesError", err);
      }
    } else {
      window.webContents.send("customStyles", data);
    }
  });
}

function sendVersionInfo() {
  window.webContents.send("versionInformation", {
    version: app.getVersion(),
  });
}

function downloadUpdate(updateInfo) {
  exec("arch", (err, stdout, stderr) => {
    if (err) {
      console.log(err);
    }
    if (stderr) {
      console.error(stderr);
    }
    console.log(stdout);
    console.log(updateInfo);
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (window === null) {
    createWindow();
  }
});
