const Axios = require('axios');
const config = require('../config');
const models = require('../models/index');
const Tatum = require('@tatumio/tatum');

const TatumAxios = Axios.create();
TatumAxios.defaults.timeout = 20000;
TatumAxios.defaults.baseURL = 'https://api.tatum.io/v3';
TatumAxios.defaults.headers.common['x-api-key'] = config.TATUM_OPTION[config.NETWORK].apikey;
TatumAxios.defaults.headers.common['Content-Type'] = 'application/json';
TatumAxios.defaults.headers.post['Content-Type'] = 'application/json';

const NativeData = {
    'erc-20': 'ETH',
    'bep-20': 'BNB',
    'trc-20': 'TRX'
};

const createSubscription = async (data, subscriptionType = Tatum.SubscriptionType.ADDRESS_TRANSACTION) => {
    try {

        const { address, chain, url } = data;
        const request = {
            type: subscriptionType,
            attr: {
                address,
                chain,
                url
            }
        };
        const response = await TatumAxios.post('/subscription', JSON.stringify(request));
        console.log("reponse = ", response.data);
    }
    catch (err) {
        console.error({ title: 'tatumController - createSubscription', message: err.message });
        return null;
    }
}

const getNetworkFromCoinType = (coinType) => {
    if (coinType.toUpperCase() === 'BTC') return 'bitcoin';
    else if (coinType.toUpperCase() === 'ETH') return 'ethereum';
    else if (coinType.toUpperCase() === 'TRX') return 'tron';
    else if (coinType.toUpperCase() === 'BNB') return 'bsc';
}

const generatePrivateKey = async (data) => {
    try {
        const { mnemonic, index, chain } = data;
        const response = await TatumAxios.post(`/${chain}/wallet/priv`, JSON.stringify({ index, mnemonic }));
        return response.data;
    }
    catch (err) {
        console.error({ title: 'tatumController - generatePrivateKey', message: err.message });
        return '';
    }
}

exports.getNativeData = async (data) => {
    try {
        const { type } = data;
        return NativeData[type];
    }
    catch (err) {
        console.error({ title: 'tatumController - getNativeData', message: err.message });
        return '';
    }
}

exports.createVirtualAccount = async (data) => {
    try {
        const { xpub, coinType } = data;
        const request = {
            currency: coinType,
            xpub: xpub,
            customer: {
                accountingCurrency: 'USD',
                customerCountry: 'US',
                externalId: config.TATUM_OPTION[config.NETWORK].virtualAccount,
                providerCountry: 'US'
            },
            compliant: true,
            accountCode: config.TATUM_OPTION[config.NETWORK].virtualAccount,
            accountingCurrency: 'USD',
            accountNumber: config.TATUM_OPTION[config.NETWORK].virtualAccount
        };
        const response = await TatumAxios.post('/ledger/account', JSON.stringify(request));
        return response.data;
    }
    catch (err) {
        console.error({ title: 'tatumController - createVirtualAccount', message: err.message });
        return null;
    }
}

exports.getBalanceFromAccount = async (data) => {
    try {
        const { coinType } = data;
        const keyName = `${coinType}WalletInfo`;
        const accountInfo = await models.settingModel.findOne({ key: keyName });
        if (accountInfo) {
            const response = await TatumAxios.get(`/ledger/account/${accountInfo.dataObject.virtualAccount.id}/balance`);
            return response.data;
        }
        else {
            console.log({ title: 'tatumController - getAccountBalance', message: 'AccountInfo Null' });
            return null;
        }
    }
    catch (err) {
        console.error({ title: 'tatumController - getAccountBalance', message: err.message });
        return null;
    }
}

exports.getDepositAddressFromAccount = async (data) => {
    try {
        const { coinType } = data;
        const keyName = `${coinType === 'TRX' ? 'TRON' : coinType === 'BNB' ? 'BSC' : coinType}WalletInfo`;
        const accountInfo = await models.settingModel.findOne({ key: keyName });
        if (accountInfo) {
            const chain = getNetworkFromCoinType(coinType);
            const addressData = await TatumAxios.post(`/offchain/account/${accountInfo.dataObject.virtualAccount.id}/address`);
            const privateKey = await generatePrivateKey({ index: addressData.data.derivationKey, chain, mnemonic: accountInfo.dataObject.mnemonic });

            // creer une souscription pour update le solde en cas de transaction depot ou retrait
            await createSubscription({ url: config.SUBSCRIBE_URL, chain: addressData.data.currency, address: addressData.data.address });
            return { ...addressData.data, ...privateKey };
        }
        else {
            console.log({ title: 'tatumController - getDepositAddressFromAccount', message: 'AccountInfo Null' });
            return null;
        }
    }
    catch (err) {
        console.error({ title: 'tatumController - getDepositAddressFromAccount', message: err.message });
        return null;
    }
}

exports.getGasPrice = async (data) => {
    try {
        const { coinType } = data;
        const response = await TatumAxios.get(`/blockchain/fee/${coinType}`);
        return response.data;
    }
    catch (err) {
        console.error({ title: 'tatumController - getGasPrice', message: err.message });
        return null;
    }
}

exports.createBitcoinWallet = async () => {
    // creation wallet depuis tatum
    try {
        const response = await TatumAxios.get('/bitcoin/wallet');
        const { mnemonic, xpub } = response.data;
        return { mnemonic, xpub };
    }
    catch (err) {
        console.error({ title: 'tatumController - createBitCoinAccount', message: err.message });
        return null;
    }
}

// exports.withdrawBTCFromAccount = async (data) => {
//     console.log("Tatum withdraw account");

//     try {
//         // Déstructuration des données reçues
//         const { address, amount, myAddress, currency } = data;

//         // Récupérer les informations du compte à partir de la base de données
//         const keyName = `BTCWalletInfo`;
//         const accountInfo = await models.settingModel.findOne({ key: keyName });

//         if (!accountInfo) {
//             console.log({ title: 'tatumController - withdrawBTCFromAccount', message: 'AccountInfo Null' });
//             return null;  // Retourne null si aucune info de compte n'est trouvée
//         }

//         // Préparer la requête avec les informations du compte et les données fournies
//         const request = {
//             senderAccountId: accountInfo.dataObject.virtualAccount.id,
//             address: address,
//             amount: Number(amount).toFixed(8),  // Assurez-vous que le montant est bien formaté à 8 décimales
//             mnemonic: accountInfo.dataObject.mnemonic,
//             xpub: accountInfo.dataObject.xpub,
//             fee: config.configWithdraw.btc.fee.toString()  // Utilisation des frais configurés
//         };

//         // Envoi de la requête pour transférer les BTC
//         let response;  // Déclaration de la variable response
//         try {
//             response = await TatumAxios.post(`/offchain/bitcoin/transfer`, JSON.stringify(request));
//             console.log("\nresponse = ", JSON.stringify(response));

//         } catch (e) {
//             // Gérer les erreurs de requête
//             console.error("\nErreur lors de la requête de transfert BTC : ", JSON.stringify(e.response ? e.response.data.cause : e));
//             return e.response ? e.response.data.cause : e;  // Retourne null si la requête échoue
//         }

//         // Vérification du succès de la transaction
//         if (response.data && response.data.completed) {
//             // Enregistrer la transaction dans la base de données
//             await new models.transactionModel({
//                 accountId: accountInfo.dataObject.virtualAccount.id,
//                 amount: Number(amount),
//                 reference: '',
//                 currency: currency,
//                 txId: response.data.txId,
//                 from: myAddress,
//                 to: address,
//                 date: new Date(),
//                 index: '',
//                 subscriptionType: '#'
//             }).save();

//             return response.data;  // Retourner les données de la réponse si la transaction est réussie
//         } else {
//             console.log("La transaction n'a pas pu être complétée.");
//             return null;
//         }

//     } catch (err) {
//         // Gestion des erreurs non liées à la requête axios
//         console.error({ title: 'tatumController - withdrawBTCFromAccount', message: err.message });
//         return null;  // Retourne null en cas d'erreur
//     }
// };


exports.withdrawBTCFromAccount = async (data) => {
    console.log("Tatum withdraw account");

    try {
        const { address, amount, myAddress, currency } = data;

        // Validate inputs
        if (!address || !amount || isNaN(amount) || amount <= 0) {
            return { error: 'Invalid address or amount provided.' };
        }

        const keyName = `BTCWalletInfo`;
        const accountInfo = await models.settingModel.findOne({ key: keyName });

        if (!accountInfo) {
            console.error({ title: 'tatumController - withdrawBTCFromAccount', message: 'AccountInfo Null' });
            return { error: 'Account information not found.' };
        }

        const fee = parseFloat(config.configWithdraw.btc.fee);
        const minAmount = parseFloat(config.configWithdraw.btc.min);
        const maxAmount = parseFloat(config.configWithdraw.btc.max);

        // Validate amount against min/max and fee requirements
        const netAmount = amount - fee;
        if (amount < minAmount || amount > maxAmount) {
            return {
                error: `Amount must be between ${minAmount} and ${maxAmount} BTC.`,
            };
        }


        // Fetch account balance
        const balanceResponse = await TatumAxios.get(`/ledger/account/${accountInfo.dataObject.virtualAccount.id}/balance`);
        const currentBalance = parseFloat(balanceResponse.data.availableBalance);

        if (currentBalance < amount + fee) {
            return {
                error: `Insufficient balance. Available: ${currentBalance} BTC, Required: ${(amount + fee).toFixed(8)} BTC.`,
            };
        }

        const request = {
            senderAccountId: accountInfo.dataObject.virtualAccount.id,
            address,
            amount: amount.toFixed(8),
            mnemonic: accountInfo.dataObject.mnemonic,
            xpub: accountInfo.dataObject.xpub,
            fee: fee.toFixed(8),
        };

        let response;
        try {
            response = await TatumAxios.post(`/offchain/bitcoin/transfer`, JSON.stringify(request));
            console.log("\nresponse = ", JSON.stringify(response));
        } catch (e) {
            console.error(
                "\nError during BTC transfer request: ",
                JSON.stringify(e.response ? e.response.data : e)
            );
            return {
                error: e.response ? e.response.data.cause : e.message,
            };
        }

        if (response.data && response.data.completed) {
            await new models.transactionModel({
                accountId: accountInfo.dataObject.virtualAccount.id,
                amount: Number(amount),
                reference: '',
                currency,
                txId: response.data.txId,
                from: myAddress,
                to: address,
                date: new Date(),
                index: '',
                subscriptionType: '#',
            }).save();

            return response.data;
        } else {
            return { error: 'Transaction could not be completed.' };
        }
    } catch (err) {
        console.error({ title: 'tatumController - withdrawBTCFromAccount', message: err.message });
        return { error: err.message };
    }
};



exports.createEthereumWallet = async () => {
    try {
        const response = await TatumAxios.get('/ethereum/wallet');
        const { mnemonic, xpub } = response.data;
        return { mnemonic, xpub };
    }
    catch (err) {
        console.error({ title: 'tatumController - createEthereumAccount', message: err.message });
        return null;
    }
}

exports.withdrawETHFromAccount = async (data) => {
    try {
        const { address, amount, derivationKey, myAddress, currency } = data;
        const keyName = `ETHWalletInfo`;
        const accountInfo = await models.settingModel.findOne({ key: keyName });
        if (accountInfo) {
            const request = {
                senderAccountId: accountInfo.dataObject.virtualAccount.id,
                address: address,
                amount: Number(amount).toString(),
                index: derivationKey,
                mnemonic: accountInfo.dataObject.mnemonic,
                fee: config.configWithdraw.eth.fee.toString()

            }
            const response = await TatumAxios.post(`/offchain/ethereum/transfer`, JSON.stringify(request));
            if (response.data.completed) {
                await new models.transactionModel({
                    accountId: accountInfo.dataObject.virtualAccount.id,
                    amount: Number(amount),
                    reference: '',
                    currency: currency,
                    txId: response.data.txId,
                    from: myAddress,
                    to: address,
                    date: new Date(),
                    index: '',
                    subscriptionType: '#'
                }).save();
            }
            return response.data;
        }
        else {
            console.log({ title: 'tatumController - withdrawETHFromAccount', message: 'AccountInfo Null' });
            return null;
        }
    }
    catch (err) {
        console.error({ title: 'tatumController - withdrawETHFromAccount', message: err.message });
        return null;
    }
}

exports.createTronWallet = async () => {
    try {
        const response = await TatumAxios.get('/tron/wallet');
        const { mnemonic, xpub } = response.data;
        return { mnemonic, xpub };
    }
    catch (err) {
        console.error({ title: 'tatumController - createTronWallet', message: err.message });
        return null;
    }
}

exports.withdrawTRONFromAccount = async (data) => {
    try {
        const { address, amount, derivationKey, myAddress, currency } = data;
        const keyName = `TRONWalletInfo`;
        const accountInfo = await models.settingModel.findOne({ key: keyName });
        if (accountInfo) {
            const request = {
                senderAccountId: accountInfo.dataObject.virtualAccount.id,
                address: address,
                amount: Number(amount).toString(),
                mnemonic: accountInfo.dataObject.mnemonic,
                index: derivationKey,
                fee: config.configWithdraw.trx.fee.toString()
            }
            const response = await TatumAxios.post(`/offchain/tron/transfer`, JSON.stringify(request));
            if (response.data.completed) {
                await new models.transactionModel({
                    accountId: accountInfo.dataObject.virtualAccount.id,
                    amount: Number(amount),
                    reference: '',
                    currency: currency,
                    txId: response.data.txId,
                    from: myAddress,
                    to: address,
                    date: new Date(),
                    index: '',
                    subscriptionType: '#'
                }).save();
            }
            return response.data;
        }
        else {
            console.log({ title: 'tatumController - withdrawTRONFromAccount', message: 'AccountInfo Null' });
            return null;
        }
    }
    catch (err) {
        console.error({ title: 'tatumController - withdrawTRONFromAccount', message: err.message });
        return null;
    }
}

exports.createBSCWallet = async () => {
    try {
        const response = await TatumAxios.get('/bsc/wallet');
        const { mnemonic, xpub } = response.data;
        return { mnemonic, xpub };
    }
    catch (err) {
        console.error({ title: 'tatumController - createTronWallet', message: err.message });
        return null;
    }
}

// new add'

// exports.withdrawBNBFromAccount = async (data) => {
//     try {
//         const { address, amount, derivationKey, myAddress, currency } = data;
//         const keyName = `BNBWalletInfo`;  // Nom de la clé pour les informations sur le portefeuille BNB
//         const accountInfo = await models.settingModel.findOne({ key: keyName });

//         if (accountInfo) {
//             // Construction de la requête pour la transaction
//             const request = {
//                 senderAccountId: accountInfo.dataObject.virtualAccount.id,
//                 address: address,
//                 amount: Number(amount).toString(),
//                 index: derivationKey,
//                 mnemonic: accountInfo.dataObject.mnemonic,
//                 fee: config.configWithdraw.bnb.fee.toString()  // Utilisation des frais de BNB dans la configuration
//             };

//             // Envoi de la requête à l'API Tatum pour effectuer le retrait BNB
//             const response = await TatumAxios.post(`/offchain/bnb/transfer`, JSON.stringify(request));

//             if (response.data.completed) {
//                 // Sauvegarde de la transaction dans la base de données
//                 await new models.transactionModel({
//                     accountId: accountInfo.dataObject.virtualAccount.id,
//                     amount: Number(amount),
//                     reference: '',
//                     currency: currency,
//                     txId: response.data.txId,
//                     from: myAddress,
//                     to: address,
//                     date: new Date(),
//                     index: '',
//                     subscriptionType: '#'
//                 }).save();
//             }

//             return response.data;
//         } else {
//             console.log({ title: 'tatumController - withdrawBNBFromAccount', message: 'AccountInfo Null' });
//             return null;
//         }
//     } catch (err) {
//         console.error({ title: 'tatumController - withdrawBNBFromAccount', message: err.message });
//         return null;
//     }
// };
