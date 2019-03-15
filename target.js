const net = require('net');
const {
    parseHostPort
} = require('./util')
module.exports = function (argv, soEmitter) {
    const {
        host,
        port
    } = parseHostPort(argv.t)
    console.dir({
        toHost: host,
        toPort: port
    })

    function Uint8ArrayToString(fileData) {
        var dataString = "";
        for (var i = 0; i < fileData.length; i++) {
            dataString += String.fromCharCode(fileData[i]);
        }

        return dataString

    }
    soEmitter.on('connection', (sSocket) => {
        console.log('connect to :' + host + ':' + port)
        const client = net.createConnection(port, host, () => {

        })
        client.setNoDelay()
        client.on('error', (e) => {
            console.log('client error')
            console.log(e)
        })
        client.on('data', (data) => {
            sSocket.write(data)
            console.log('write')
            console.log(Uint8ArrayToString(data))
        })
        sSocket.on('data', (data) => {
            client.write(data)
            console.log('read')
            console.log(Uint8ArrayToString(data))
        })
        client.on('end', () => {
            console.log('client end')
            sSocket.end()
        })
        sSocket.on('end', () => {
            console.log('server end')
            client.end()
        })
    });
}