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
        })
        sSocket.on('data', (data) => {
            client.write(data)
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