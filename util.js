function parseHostPort(address) {
    if (typeof (address) == 'number') {
        return {
            host: '127.0.0.1',
            port: address
        }
    }
    if (typeof (address) != 'string') {
        console.log(address)
        throw '地址必须是数字或者字符串:' + typeof (address)
    }
    let host = '127.0.0.1'
    let port = 0;
    if (address.indexOf(':')) {
        let sp = address.split(':')
        host = sp[0]
        port = parseInt(sp[1])
    } else {
        port = parseInt(address)
    }
    return {
        host: host,
        port: port
    }
}
module.exports = {
    parseHostPort: parseHostPort
}