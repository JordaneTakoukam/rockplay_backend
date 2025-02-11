const mongoose = require('mongoose');
const models = require('../../models');
const blockbeeControler = require('./blockbeeController');
const Axios = require('axios');
const SocketManager = require('../../socket/Manager');
const { v4: uuidv4 } = require('uuid');


// generer une adresse de depot 
exports.getClientDepositBlockbeeAddress = async (req, res) => {
    try {
        let { coinType, type, userId } = req.body;
        // if (type !== 'native') {
        //     coinType = await tatumController.getNativeData({ type });
        // }

        console.log(`req body = ${req.body}`);


        if (coinType) {

            let walletData = await models.walletModel.findOne({ userId, currency: coinType });
            if (walletData) {
                console.log("Le wallet existe deja");

                return res.json({ status: true, data: walletData });
            }
            else {
                console.log("Le wallet n'existe pas encore");

                let response = await blockbeeControler.getDepositBlockbeeAddress({ coinType, userId });

                if (response !== null) {
                    let data = await new models.walletModel({
                        // address: response.address,
                        address: response.address_in,
                        address_out: response.address_out,
                        minimum_transaction_coin: response.minimum_transaction_coin,

                        xpub: "",
                        derivationKey: "",
                        currency: coinType,
                        userId: userId,
                        privateKey: "",
                    }).save();
                    // return res.json({ status: true, data: response.data });

                    console.log(`Wallet save = ${data}`);

                    return res.json({ status: true, data: data });
                }
                else {
                    return res.json({ status: false, data: response, message: 'API Error' });
                }
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




// exports.webHookDeposit = async (req, res) => {
//     console.log("\Blockbee webhook start");

//     try {
//         let { address, amount, counterAddress, asset, blockNumber, txId, type, subscriptionType, tokenId } = req.body; // reposes de blockbee
//         let currency = { coinType: '', type: '' };
//         if (type === 'native') {
//             currency = { coinType: asset === 'TRON' ? 'TRX' : asset === 'BSC' ? 'BNB' : asset, type: type };
//         }
//         else {
//             const matchedAsset = AssetList.find((item) => item.asset.toLowerCase() === asset.toLowerCase());
//             currency = { coinType: matchedAsset.coinType, type: matchedAsset.type };
//             if (tokenId === null) {
//                 let tempAddr = counterAddress;
//                 counterAddress = address;
//                 address = tempAddr;
//             }
//         }

//         let txData = await models.transactionModel.findOne({ txId });

//         if (!txData) {
//             const transaction = await new models.transactionModel({ txId, amount, from: counterAddress, to: address, date: new Date(), blockNumber, subscriptionType, currency }).save();
//             console.log("\nTransactions = " + transaction);


//             let walletData = await models.walletModel.findOne({ address: address });
//             if (walletData) {
//                 let userData = await models.userModel.findOne({ _id: walletData.userId });
//                 let balanceData = userData.balance.data.find((data) => data.coinType === currency.coinType && data.type === currency.type);
//                 balanceData.balance += Number(amount);
//                 await models.userModel.findOneAndUpdate({ _id: walletData.userId }, { balance: userData.balance });

//                 console.log("\nAmount add  = " + amount);
//                 console.log("New Balance  = " + userData.balance);

//             }
//             res.json({ "success": true })
//         } else {
//             console.log(' Tatum Webhook Already exist ===>');

//             res.json({ "success": false })

//         }
//     }
//     catch (err) {
//         console.error({ title: 'error - cryptoController - tatumWebhook', message: err.message });
//         return res.json({ status: false, data: null, message: 'Server Error' });
//     }
//     res.json({ status: true })

// }

exports.webHookDeposit = async (req, res) => {
    console.log("BlockBee webhook start");
    console.log("Request body:", JSON.stringify(req.body));

    try {
        // Extraction des paramètres de BlockBee
        const {
            uuid,             // Identifiant unique de la transaction
            address_in,       // Adresse générée par BlockBee (cible de dépôt)
            address_out,      // Adresse(s) de redirection de paiement
            txid_in,          // Hash de la transaction de paiement du client
            confirmations,    // Nombre de confirmations
            value_coin,       // Montant envoyé par le client avant déduction des frais
            coin,             // Ticker de la crypto (ex: btc, erc20_usdt, etc.)
            price,            // Prix de la coin en USD au moment du callback
            pending           // 1 pour callback pending, 0 pour confirmation
        } = req.body;

        console.log("Extracted parameters:", { uuid, address_in, address_out, txid_in, confirmations, value_coin, coin, price, pending });

        // Détermination de la devise en fonction du paramètre coin
        let currency = { coinType: '', type: '' };
        if (coin.includes('_')) {
            const parts = coin.split('_');
            const prefix = parts[0];
            const ticker = parts[1].toUpperCase();
            let tokenType = "";
            if (prefix === "erc20") tokenType = "ERC20";
            else if (prefix === "trc20") tokenType = "TRC20";
            else if (prefix === "bep20") tokenType = "BEP20";
            else if (prefix === "polygon") tokenType = "Polygon";
            currency = { coinType: ticker, type: tokenType };
        } else {
            currency = { coinType: coin.toUpperCase(), type: 'native' };
        }
        console.log("Determined currency:", currency);

        // Branching selon la valeur de "pending"
        if (pending == 1) {
            console.log("Pending callback received");

            // Vérifier si la transaction existe déjà
            let txData = await models.transactionModel.findOne({ uuid });
            if (!txData) {
                console.log("Aucune transaction existante trouvée. Création d'une transaction pending.");
                const transaction = await new models.transactionModel({
                    uuid,             // Identifiant unique fourni par BlockBee
                    txid_in,          // Transaction hash du paiement du client
                    amount: value_coin, // Montant envoyé (avant frais)
                    from: address_out,  // Adresse vers laquelle les fonds ont été redirigés
                    to: address_in,     // Adresse de dépôt générée (celle du wallet utilisateur)
                    date: new Date(),
                    confirmations,
                    price,
                    currency,
                    pending           // Valeur pending = 1
                }).save();
                console.log("Transaction pending enregistrée:", transaction);
            } else {
                console.log("Transaction pending déjà existante:", txData);
            }
            return res.send({ message: "Success payment init: pending" });
        }

        //
        //
        //
        else if (pending == 0) {
            console.log("Confirmation callback received");

            // Pour confirmation, on met à jour la transaction existante
            let txData = await models.transactionModel.findOne({ uuid });
            if (txData) {
                console.log("Transaction existante trouvée. Mise à jour avec les détails de confirmation.");
                // Mise à jour des informations (par exemple, confirmations et le flag pending)
                txData.confirmations = confirmations;
                txData.pending = pending; // Passage à 0 (confirmé)
                // Vous pouvez ajouter ici d'autres mises à jour si nécessaire (ex: txid_out)
                txData = await txData.save();
                console.log("Transaction mise à jour:", txData);
            } else {
                console.log("Aucune transaction trouvée pour confirmation. Création d'une nouvelle transaction confirmée.");
                const transaction = await new models.transactionModel({
                    uuid,
                    txid_in,
                    amount: value_coin,
                    from: address_out,
                    to: address_in,
                    date: new Date(),
                    confirmations,
                    price,
                    currency,
                    pending
                }).save();
                console.log("Transaction confirmée enregistrée:", transaction);
            }

            // Mise à jour du solde de l'utilisateur à partir du wallet (basé sur address_in)
            console.log("Mise à jour du solde du wallet pour address_in:", address_in);
            let walletData = await models.walletModel.findOne({ address: address_in });
            if (walletData) {
                console.log("Données du wallet trouvées:", walletData);
                let userData = await models.userModel.findOne({ _id: walletData.userId });
                console.log("Données de l'utilisateur trouvées:", userData);
                let balanceEntry = userData.balance.data.find((data) =>
                    data.coinType === currency.coinType && data.type === currency.type
                );
                if (balanceEntry) {
                    console.log("Entrée de solde existante trouvée. Ancien solde:", balanceEntry.balance);
                    balanceEntry.balance += Number(value_coin);
                    console.log("Nouveau solde pour", currency.coinType, ":", balanceEntry.balance);
                } else {
                    console.log("Aucune entrée de solde trouvée pour cette devise. Création d'une nouvelle entrée.");
                    userData.balance.data.push({ coinType: currency.coinType, type: currency.type, balance: Number(value_coin) });
                }
                await models.userModel.findOneAndUpdate({ _id: walletData.userId }, { balance: userData.balance });
                console.log("Solde mis à jour pour l'utilisateur:", walletData.userId);
            } else {
                console.log("Aucune donnée de wallet trouvée pour address_in:", address_in);
            }
            return res.send({ message: "Success payment confirmed" });
        } else {
            console.log("Valeur de 'pending' inconnue reçue:", pending);
            return res.status(400).send({ message: "Invalid pending value" });
        }
    } catch (err) {
        console.error({ title: 'error - cryptoController - blockbeeWebhook', message: err.message });
        return res.status(500).json({ status: false, data: null, message: 'Server Error' });
    }
};
