const { run } = require('node-cmd')
const path = require('path')
console.log('__dirname', __dirname)
const IPERF_PATH = path.resolve('./scripts/iperf3.exe')

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
        return {}
    }
}

const testConnection = (raspIp, callback) => {
    try {
        const command = `${IPERF_PATH} -c ${raspIp} -J`
        run(command, (err, data, stderr) => {
            if (err) {
                console.log('err', err)
                return callback(null, 'Iperf service is unavailable!')
            }

            let parsedData = {}

            try {
                parsedData = JSON.parse(data)
            } catch (err) {
                console.log('err', err)
                return callback(null, 'Invalid iperf response!')
            }

            const host = parsedData.start.connecting_to.host
            return callback(formatData(parsedData, host), null)
        })
    } catch (err) {
        console.log('------------------------------err------------------------------\n', err)
        rcallback(null, 'Error ocured while net test!')
    }
}

module.exports = {
    testConnection
}