"use strict";

const builder = require('electron-builder')
const Platform = builder.Platform
const packageJson = require('../package.json')

let options = {
    appId: packageJson.appId,
    artifactName: `${packageJson.name}-${packageJson.version}.exe`,
    productName: packageJson.productName,
    directories: {
        // buildResources: "./src",
        output: 'releases',
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
    extraFiles: ['./scripts']
}

builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: options,
}).then((res) => {
    console.log(res)
}).catch((e) => {
    console.error(e)
})