const config = require('./config');
const app = require('./app').createApp(config);
const socketManager = require('./manager/SocketManager');

const server = socketManager.createServer(app);
server.listen(config.serverInfo.port, function () {
    console.log(`Management Server started on ${config.serverInfo.port}`);
});