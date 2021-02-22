const { run } = require('node-cmd')
const path = require('path')
// const IPERF_PATH = path.normalize('../../scripts/iperf3.exe')
const IPERF_PATH = 'C:\\Users\\cikpak\\Desktop\\xplay-client\\scripts\\iperf3.exe'

const formatData = (data, host) => {
    let lostPackages = false

    try {
        const formatedData = []
        data.intervals.map((interval, index) => {
            const { bits_per_second, } = interval.sum

            if (bits_per_second == 0) { lostPackages = true }
            let mbts = Math.floor((bits_per_second / 1000000) * 10) / 10

            formatedData.push({
                name: `nr.${index + 1}`,
                speed: mbts
            })
        })

        const response = {
            host,
            ticks: formatedData,
            lostPackages
        }

        return response
    } catch (err) {
        console.log('err', err)
    }
}


const testConnection = async (raspIp, callback) => {
    try {
        const command = `${IPERF_PATH} -c ${raspIp} -J`
        run(command, (err, data, stderr) => {
            console.log('data', data)

            if (err) {
                return callback(null, 'huiac si eroareeeeeee :(')
            }

            let parsedData = {}

            try {
                parsedData = JSON.parse(data)
            } catch (err) {
                console.log('err', err)
                return callback(null, 'huiac si eroare!!')
            }

            const host = parsedData.start.connecting_to.host
            console.log('host', host)
            return callback(formatData(parsedData, host), null)
        })
    } catch (err) {
        console.log('------------------------------err------------------------------\n', err)
        return undefined
    }
}

module.exports = {
    testConnection
}