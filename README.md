-l 监听服务端口
-c 监听客户机通信端口
-s 连接服务器地址
-t 转发目标地址

端口转发：
node netbridge -l 80 -t www.baidu.com:80

跨网段转发：
    服务端：
    node netbridge -l 80 -c 9999

    客户端:
    node netbridge -s 127.0.0.1:9999 -t 127.0.0.1:80

