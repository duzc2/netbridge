const net = require('net');

module.exports = function (argv, soEmitter) {
    const server = net.createServer({}, (socket) => {
        console.log('connection')
        // console.log(socket)
        socket.on('error', (e) => {
            //console.error(e)
        })
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