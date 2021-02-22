const { ipcMain, BrowserWindow } = require('electron');
const url = require("url");
const { getConnectionType } = require('../src/services/network')

ipcMain.on('success-login', (event, args) => {
    console.log('------HUIAC SI LOGIN-------')

    let afterLoginWindows = new BrowserWindow({
        width: 460,
        height: 700,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    const indexPath = url.format({
        protocol: "http:",
        host: "localhost:8080",
        pathname: "index.html",
        slashes: true,
    });

    afterLoginWindows.loadURL(indexPath)

    afterLoginWindows.once("ready-to-show", () => {
        afterLoginWindows.show();
        event.sender.destroy()
    });

    afterLoginWindows.on("closed", function () {
        afterLoginWindows = null;
    });
})


ipcMain.on('get-network-config', (event, args) => {
    event.returnValue = getConnectionType()
})

ipcMain.on('logout', (event, args) => {
    console.log('------HUIAC SI LOGOUT-------')

    let afterLogoutWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    const indexPath = url.format({
        protocol: "http:",
        host: "localhost:8080",
        pathname: "index.html",
        slashes: true,
    });
    afterLogoutWindow.loadURL(indexPath);

    afterLogoutWindow.once("ready-to-show", () => {
        afterLogoutWindow.show();
        event.sender.destroy()
    });

    afterLogoutWindow.on("closed", function () {
        afterLogoutWindow = null;
    });

})


