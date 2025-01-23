const Axios = require('axios');
const config = require('../config');
const models = require('../models/index');
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
exports.getDepositAddress = async (data) => {
    const { coinType, userId } = data;

    let ticker;

    switch (coinType.toLowerCase()) {
        case 'btc':
            ticker = '/btc';
            break;
        case 'bnb':
            ticker = '/bep20/bnb';
            break;
        // You can add more coin types here if needed
        default:
            throw new Error(`Unsupported coin type: ${coinType}`);
    }

    try {
        const query = {
            apikey: process.env.BLOCKBEE_API_KEY,
            callback: `https://api-root.minusplay.com/api/v0/blockbee/payment/webhook/deposit?user_id=${userId}`,
        };

        const response = await BlockbeeAxios.get(`${ticker}/create`, { params: query });

        console.log(`Response from BlockBee: ${JSON.stringify(response.data)}`);

        // if (response.data.status === 'success') {
        //     return response.data;
        // } else {
        //     throw new Error(`BlockBee API Error: ${response.data.error}`);
        // }
        return { "reponse": "okay", }
    } catch (error) {

        console.error(`Error : ${error}`);
        console.error('Error generating deposit address:', error.message);
        // Optionally log the full error object or response for further debugging
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
        throw error;
    }
};









//
// 
// 
// 
// 
//  Retrait Bitcoin
exports.processWithdrawalBTC = async (data) => {
    const { toAddress, amount } = data;

    // try {
    //     const query = {
    //         apikey: config.BLOCKBEE_API_KEY, // Clé API BlockBee
    //         address: toAddress, // Adresse de retrait
    //         amount: amount, // Montant à retirer
    //         currency: 'btc', // Type de crypto (Bitcoin ici)
    //         callback: `${config.WEBHOOK_URL}/webhook/withdraw`, // URL pour recevoir les notifications
    //     };

    //     const response = await BlockbeeAxios.get('/send_payment', { params: query });

    //     if (response.data.status === 'success') {
    //         return {
    //             txid: response.data.txid, // Transaction ID
    //             message: response.data.message, // Message d'état
    //         };
    //     } else {
    //         throw new Error('Failed to process withdrawal: ' + response.data.message);
    //     }
    // } catch (error) {
    //     console.error('Error processing withdrawal:', error.message);
    //     throw error;
    // }
};
