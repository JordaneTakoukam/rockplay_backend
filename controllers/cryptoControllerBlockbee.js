const mongoose = require('mongoose');
const models = require('../models');
const blockbeeControler = require('./blockbeeController');
const Axios = require('axios');
const SocketManager = require('../socket/Manager');
const { v4: uuidv4 } = require('uuid');


// generer une adresse de depot 
exports.getDepositAdress = async (req, res) => {
    try {
        let { coinType, type, userId } = req.body;
        // if (type !== 'native') {
        //     coinType = await tatumController.getNativeData({ type });
        // }

        if (coinType) {

            let walletData = await models.walletModel.findOne({ userId, currency: coinType });
            if (walletData) {
                console.log("Le wallet existe deja");

                return res.json({ status: true, data: walletData });
            }
            else {
                console.log("Le wallet n'existe pas encore");

                let response = await blockbeeControler.getDepositAddress({ coinType, userId });

                // console.log("response = ", JSON.stringify(response));

                // if (response !== null) {
                //     let data = await new models.walletModel({
                //         address: response.address,
                //         xpub: response.xpub,
                //         derivationKey: response.derivationKey,
                //         currency: coinType,
                //         userId: userId,
                //         privateKey: response.key
                //     }).save();
                return res.json({ status: true, data: response });
                // }
                // else {
                //     return res.json({ status: false, data: response, message: 'API Error' });
                // }
            }
        }
        else {
            return res.json({ status: false, data: null, message: 'Invalid Request' });
        }
    }
    catch (err) {
        console.error({ title: 'blockbee controller - getDepositAddress', message: err });
        return res.json({ status: false, data: null, message: 'Server Error' });
    }
}



exports.processWithdrawal = async (req, res) => {
}


exports.withdrawBTCFromAccount = async (req, res) => {
}





exports.webHookDeposit = async (req, res) => {
    console.log("Web hook deposit is calling");

    res.json({ status: true })

}

exports.webHookWithdraw = async (req, res) => {
    console.log("Web hook webHookWithdraw is calling");

    res.json({ status: true })

}