"use strict";
const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

require('./ipc/mainWindow')

//create electrone-store instance
let Store = require('electron-store')
const store = new Store({
  defaults: {
    apiVersion: "2",
    netTest: {
      netTestErrorStr: null,
      netTestError: false,
      lostPackages: false,
      ping: null,
      min: null,
      max: null,
      data: [],
    },
    isClientConfigured: false
  }
})

let dev = false;
let mainWindow;

if (
  process.defaultApp ||
  /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
  /[\\/]electron[\\/]/.test(process.execPath)
) {
  dev = true;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 470,
    height: 700,
    show: false,
    center: true,
    // resizable: false,
    title: 'XPlay client | Beta',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  let indexPath;
  if (dev && process.argv.indexOf("--noDevServer") === -1) {
    indexPath = url.format({
      protocol: "http:",
      host: "localhost:8080",
      pathname: "index.html",
      slashes: true,
    });
  } else {
    indexPath = url.format({
      protocol: "file:",
      pathname: path.join(__dirname, "dist", "index.html"),
      slashes: true,
    });
  }

  mainWindow.loadURL(indexPath);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    if (dev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
