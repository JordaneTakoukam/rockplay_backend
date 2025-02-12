const Axios = require('axios');
const config = require('../../config');
const models = require('../../models/index');
const { model } = require('mongoose');

require('dotenv').config();

const BlockbeeAxios = Axios.create();
BlockbeeAxios.defaults.timeout = 20000;
BlockbeeAxios.defaults.baseURL = 'https://api.blockbee.io';
BlockbeeAxios.defaults.headers.common['Content-Type'] = 'application/json';
BlockbeeAxios.defaults.headers.post['Content-Type'] = 'application/json';

//
// 
// 
// 
// 
//  Service to generate a deposit address
exports.getDepositBlockbeeAddress = async (data) => {
    const { coinType, userId } = data;

    let ticker;

    if (coinType.toLowerCase() == 'bnb') {
        ticker = '/bep20/bnb';
    }
    else {
        ticker = `/${coinType.toLowerCase()}`;
    }

    try {
        const query = {
            apikey: process.env.BLOCKBEE_API_KEY,
            callback: `https://api-root.minusplay.com/api/v0/payment/webhook/deposit?user_id=${userId}`,
            post: "1" // pour que la callback soit un POST
        };

        const response = await BlockbeeAxios.get(`${ticker}/create`, { params: query });

        console.log(`Response from BlockBee: ${JSON.stringify(response.data)}`);

        if (response.data.status === 'success') {
            return response.data;
        } else {
            throw new Error(`BlockBee API Error: ${response.data.error}`);
        }
    } catch (error) {
        console.error(`Error : ${error}`);
        console.error('Error generating deposit address:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        throw error;
    }
};




exports.withdrawBlockbee = async (data) => {
    const { coinType, to, amount } = data;
    if (!coinType || !address || !value) {
        throw new Error("Les paramètres 'coinType', 'address' et 'value' sont requis.");
    }

    let ticker;

    if (coinType.toLowerCase() == 'bnb') {
        ticker = '/bep20/bnb';
    }
    else {
        ticker = `/${coinType.toLowerCase()}`;
    }

    try {
        const query = {
            apikey: process.env.BLOCKBEE_API_KEY,
            address: to,   // Destination address for the payout
            value: amount      // Amount to send
        };

        const response = await BlockbeeAxios.get(`${ticker}/payout/request/create`, { params: query });

        console.log(`Response from BlockBee: ${JSON.stringify(response.data)}`);

        if (response.data.status === 'success') {
            return true;
        } else {
            throw new Error(`BlockBee API Error: ${response.data.error}`);
        }
    } catch (error) {
        console.error(`Error creating payout request: ${error.message}`);
        if (error.response) {
            console.error(`API Response: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};
