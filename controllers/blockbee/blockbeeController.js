const Axios = require('axios');
const config = require('../../config');
const models = require('../../models/index');
const { model } = require('mongoose');
const { cryptoAddressValidator } = require('../../betUtils/validate_crypto_address');

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
    const coinKey = coinType.toLowerCase();
    let ticker;


    if (coinKey == 'bnb') {
        ticker = '/bep20/bnb';
    }

    else {
        ticker = `/${coinKey}`;
    }

    try {
        const query = {
            apikey: process.env.BLOCKBEE_API_KEY_V2,
            // callback: `${process.env.BLOCKBEE_WEBHOOK_DEPOSIT}/?user_id=${userId}`, // avant
            callback: `${process.env.BLOCKBEE_WEBHOOK_DEPOSIT}/?coinType=${coinKey}&user_id=${userId}`,
            post: "1" // pour que la callback soit un POST
        };

        const response = await BlockbeeAxios.get(`${ticker}/create`, { params: query });

        // console.log(`Response from BlockBee: ${JSON.stringify(response.data)}`);

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
    if (!coinType || !to || !amount) {
        throw new Error("Les paramètres 'coinType', 'address' et 'value' sont requis.");
    }

    let ticker;

    console.log(`======================= ${coinType.toLowerCase()}`);

    if (coinType.toLowerCase() == 'bnb') {
        ticker = '/bep20/bnb';
    }

    else {
        ticker = `/${coinType.toLowerCase()}`;
    }


    // verifier si l'adresse est valide 
    // Valider l'adresse
    const isValidAddress = cryptoAddressValidator(coinType.toLowerCase(), to);


    if (!isValidAddress) {
        throw new Error("L'adresse du portefeuille est invalide pour la crypto : " + coinType);
    }

    try {
        const query = {
            apikey: process.env.BLOCKBEE_API_KEY_V2,
            address: to,   // Destination address for the payout
            value: amount      // Amount to send
        };

        const response = await BlockbeeAxios.get(`${ticker}/payout/request/create`, { params: query });

        if (response.data.status !== 'success') {
            throw new Error(response.data.error_message || 'Échec du retrait');
        }

        return {
            status: true,
            request_id: response.data.request_id,
        };
    } catch (error) {
        console.error(`Error creating payout request: ${error.message}`);
        if (error.response) {
            console.error(`API Response: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }

};







// validate and send payment
exports.payoutBlockbee = async (data) => {
    // const { payout_id } = data;

    // if (!payout_id) {
    //     throw new Error("Le paramètre 'payout_id' est requis.");
    // }

    // try {
    //     const query = {
    //         apikey: process.env.BLOCKBEE_API_KEY_V2
    //     };

    //     const payload = new URLSearchParams({
    //         payout_id
    //     }).toString();

    //     const response = await BlockbeeAxios.post(`/payout/process/?${new URLSearchParams(query).toString()}`, payload, {
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         }
    //     });

    //     console.log(`Response from BlockBee: ${JSON.stringify(response.data)}`);

    //     if (response.data.status === 'success') {
    //         return true;
    //     } else {
    //         throw new Error(`BlockBee API Error: ${response.data.error}`);
    //     }
    // } catch (error) {
    //     console.error(`Error processing payout: ${error.message}`);
    //     if (error.response) {
    //         console.error(`API Response: ${JSON.stringify(error.response.data.error)}`);
    //     }
    //     // throw error;
    //     return { status: false, message: `${error.response.data.error.toString()}` };
    // }
};

