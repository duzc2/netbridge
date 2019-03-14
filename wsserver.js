const WebSocket = require('ws');
module.exports = function (argv, soEmitter) {

    let sSockets = {}
    let socketId = 0;
    let wsClient = null
    console.log('ws server on port:' + argv.s)
    const wss = new WebSocket.Server({
        port: argv.s
    });
    let handles = {
        end: function (data, wsClient) {
            let s = sSockets[data.id]
            if (!s) {
                return;
            }
            s.end()
        },
        send: function (data, wsClient) {
            let s = sSockets[data.id]
            if (!s) {
                return;
            }
            s.write(Buffer.from(data.data.data))
        }
    }

    function handleWsCommand(data, wsClient) {
        handles[data.cmd](data, wsClient)
    }
    wss.on('connection', (ws) => {
        wsClient = ws
        wsClient.on('message', (data) => {
            if (typeof (data) === 'string') {
                let json = JSON.parse(data)
                handleWsCommand(json, wsClient)
            }
        })
    })
    wss.on('end', () => {
        wsClient = null
    })
    soEmitter.on('connection', (sSocket) => {
        if (!wsClient) {
            sSocket.end()
            console.log("没有客户端连接，断开请求")
            return
        }
        let ws_id = socketId++
        sSocket.ws_id = ws_id
        sSockets[ws_id] = sSocket
        wsClient.send(JSON.stringify({
            cmd: 'connect',
            id: ws_id
        }))
        sSocket.on('data', (data) => {
            wsClient.send(JSON.stringify({
                id: ws_id,
                cmd: 'received',
                data: data
            }))
        })

        function onClientClose() {
            sSocket.end()
        }
        wsClient.on('close', onClientClose)
        sSocket.on('end', () => {
            // wsClient.off('close', onClientClose)
            if (wsClient.readyState == WebSocket.OPEN) {
                wsClient.send(JSON.stringify({
                    cmd: 'end',
                    id: ws_id
                }))
            }
        })
    })
}