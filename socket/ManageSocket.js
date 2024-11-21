const io = require('socket.io-client');
const { MANAGEMENT_OPTION } = require('../config');

const APP_MODE = process.env.REACT_APP_MODE === 'dev';

module.exports = class ManageSocket {
    socket = null;

    

    constructor() {
        this.socket = io.connect(APP_MODE ? `http://127.0.0.1:${MANAGEMENT_OPTION.port}` : `https://manage-services.minusplay.com`);
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
}