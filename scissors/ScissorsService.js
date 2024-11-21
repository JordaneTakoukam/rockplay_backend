const config = require('./config');
const app = require('./app').createApp(config);
const socketManager = require('./manager/SocketManager');

process.env.REACT_APP_MODE = 'dev';
const server = socketManager.createServer(app);
server.listen(config.serverInfo.port, function () {
    console.log(`Scissors Server started on ${config.serverInfo.port}`);
});