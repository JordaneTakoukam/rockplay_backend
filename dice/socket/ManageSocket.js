const io = require('socket.io-client');
const { DEV_MODE, MANAGEMENT_OPTION } = require('../../config');

module.exports = class ManageSocket {
    socket = null;

    constructor() {
        // this.socket = io.connect(DEV_MODE ? `http://127.0.0.1:${MANAGEMENT_OPTION.port}` : `https://www.manage-service.playzelo.com`);
        this.socket = io.connect(DEV_MODE ? `http://127.0.0.1:${MANAGEMENT_OPTION.port}` : `https://manages-services.rockplay.fun`);
        this.bind();
    }

    bind() {
        this.socket.on('connect', () => {
        });

        this.socket.on('disconnect', () => {
        });
    }

    userBalanceUpdated(data) {
        if (this.socket === null)
            return;

        this.socket.emit('balanceUpdated', data);
    }

    updateWargerAmount(data) {
        if (this.socket === null)
            return;

        this.socket.emit('updateWargerAmount', data);
    }

    newBetHistory(data) {
        this.socket.emit('newBetHistory', data);
    }
}