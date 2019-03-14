const WebSocket = require('ws');
const net = require('net');
const {
    parseHostPort
} = require('./util')
const EventEmitter = require('events');

class DummySocket extends EventEmitter {}

module.exports = function (argv, soEmitter) {

    const sockets = {}
    const {
        host,
        port
    } = parseHostPort(argv.c)

    const ws = new WebSocket('ws://' + host + ':' + port)

    let handles = {
        connect: function (data) {
            let socket = new DummySocket()
            let id = data.id
            socket.end = function () {
                if (wsClient.readyState == WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        cmd: 'end',
                        id: id
                    }))
                }
                sockets[id] = null
            }
            socket.write = function (data) {
                ws.send(JSON.stringify({
                    cmd: 'send',
                    id: id,
                    data: data
                }))
            }
            sockets[id] = socket
            soEmitter.emit('connection', socket)
        },
        end: function (data) {
            let s = sockets[data.id]
            if (s) {
                s.emit('end')
                sockets[data.id] = null
            }
        },
        received: function (data) {
            // sockets[data.id].write(Buffer.from(data.data.data))
            let s = sockets[data.id]
            if (s) {
                s.emit('data', Buffer.from(data.data.data))
            }

        }
    }

    function handleWsCommand(data) {
        handles[data.cmd](data)
    }
    ws.on('message', function incoming(data) {
        if (typeof (data) === 'string') {
            let json = JSON.parse(data)
            handleWsCommand(json)
        }
    });
    ws.on('error', (e) => {
        //throw e
        console.error(e)
    })
    ws.on('end', () => {
        console.log('websocket connection ended.')
    })
}