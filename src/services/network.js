const ping = require('ping')
const { run, runSync } = require('node-cmd')
const whitespaceRegex = new RegExp(/\s{2,}/, 'g')
const connectionRegex = new RegExp(/Ethernet|Wi-Fi/, 'g')

const testPing = async (host) => {
    try {
        const res = await ping.promise.probe(host)
        const data = await res
        return data
    } catch (error) {
        console.log('error', error)
        return undefined
    }
}


const getConnectionType = () => {

    try {
        const command = 'cmd /c chcp 437 && netsh int show int'
        const { err, data } = runSync(command)

        if (err) {
            return undefined
        }

        const connections = data.split('\n').map(connection => connection.replace(whitespaceRegex, ' ')).filter(connection => {
            return connection.search(connectionRegex) !== -1
        })

        const config = {}

        connections.map(connection => {
            const splited = connection.split(' ')
            config[splited[3].toLowerCase().replace('-', '').trim()] = splited[1] === 'Connected' ? true : false
        })

        return config
    } catch (error) {
        console.log('error', error)
        return undefined
    }
}


module.exports = {
    testPing,
    getConnectionType
}