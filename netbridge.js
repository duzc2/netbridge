const WebSocket = require('ws');
const net = require('net');
const EventEmitter = require('events');
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

class SoEmitter extends EventEmitter {}

const soEmitter = new SoEmitter();

if (argv.l) {
    const server = net.createServer({}, (socket) => {
        console.log('connection')
        // console.log(socket)
        soEmitter.emit('connection', socket)
    });
    server.on('error', (e) => {
        console.log('server error')
        console.log(e)
    })
    server.listen(argv.l, () => {
        console.log('server bound on port ' + argv.l)
    });
}

function parseHostPort(arg) {
    let host = '127.0.0.1'
    let port = 0;
    if (typeof (argv.t) == 'string' && argv.t.indexOf(':')) {
        let sp = argv.t.split(':')
        host = sp[0]
        port = parseInt(sp[1])
    } else {
        port = parseInt(argv.t)
    }
    return {
        host: host,
        port: port
    }
}
if (argv.c) {
    let handles = {
        end: function (data, sSocket, wsClient) {
            sSocket.end()
        },
        data: function (data, sSocket, wsClient) {
            sSocket.write(data.data)
        }
    }

    function handleWsCommand(data, sSocket, wsClient) {
        handles[data.cmd](data, sSocket, wsClient)
    }
    let socketId = 0;
    let wsClient = null
    const wss = new WebSocket.Server({
        port: argv.c
    });
    wss.on('connection', (ws) => {
        wsClient = ws;
    })
    soEmitter.on('connection', (sSocket) => {
        let ws_id = socketId++
        sSocket.ws_id = ws_id
        wsClient.send(JSON.stringify({
            cmd: 'connect',
            id: ws_id
        }))
        sSocket.on('data', (data) => {
            wsClient.write(JSON.stringify({
                id: ws_id,
                cmd: 'received',
                data: data
            }))
        })
        wsClient.on('message', (data) => {
            if (typeof (data) === 'string') {
                let json = JSON.parse(data)
                handleWsCommand(json, sSocket, wsClient)
            }
        })
        sSocket.on('end', () => {
            wsClient.send(JSON.stringify({
                cmd: 'end',
                id: ws_id
            }))
        })
    })
}
if (argv.t) {
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