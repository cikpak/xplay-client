"use strict";

const builder = require('electron-builder')
const Platform = builder.Platform
const packageJson = require('../package.json')

let options = {
    appId: packageJson.appId,
    artifactName: `${packageJson.name}-setup-${packageJson.version}.exe`,
    productName: packageJson.productName,
    directories: {
        output: 'builds',
    },
    win: {
        target: [
            {
                target: "nsis",
                arch: [
                    "x64",
                ]
            },
        ],
        icon: "../src/assets/images/icon.ico",
    },
}

builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: options,
}).then((res) => {
    console.log(res)
}).catch((e) => {
    console.error(e)
})