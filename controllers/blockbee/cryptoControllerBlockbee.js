const models = require('../../models');
const blockbeeControler = require('./blockbeeController');
const { sendMsg } = require('../../helper/emailHelper');

const { templateSuccessCreateAddress } = require('../../helper/template_new_address_create');
const { templateMailDepositStatus } = require('../../helper/template_mail_deposit');
const { templateAdminNotification } = require('../../helper/template_admin');
const config = require('../../config');
const { cryptoAddressValidator } = require('../../betUtils/validate_crypto_address');
const { templateWihdrawInit } = require('../../helper/template_init_withdraw');
const { templateAdminPendingWithdraw } = require('../../helper/template_admin_pending_withdraw');
const { templateMailWithdrawalApproved } = require('../../helper/template_mail_approuved');


// generer une adresse de depot 
exports.getClientDepositBlockbeeAddress = async (req, res) => {
    try {
        const { coinType, userId } = req.body;
        if (!coinType || !userId) {
            return res.json({ status: false, data: null, message: 'Invalid Request' });
        }

        // Recherche d'un wallet existant pour cet utilisateur et ce coinType
        let walletData = await models.walletModel.findOne({ userId, currency: coinType });
        if (walletData) {
            return res.json({ status: true, data: walletData });
        } else {
            // Appel à BlockBee pour générer une nouvelle adresse de dépôt
            let response = await blockbeeControler.getDepositBlockbeeAddress({ coinType, userId });
            if (response !== null) {
                // Création d'un nouveau wallet dans la base de données avec les données reçues
                let data = await new models.walletModel({
                    address: response.address_in,
                    address_out: response.address_out,
                    minimum_transaction_coin: response.minimum_transaction_coin,
                    xpub: "",
                    derivationKey: "",
                    currency: coinType,
                    userId: userId,
                    privateKey: ""
                }).save();

                // Récupération de l'email de l'utilisateur depuis la collection userModel
                let user = await models.userModel.findOne({ _id: userId });
                let emailUser = user ? user.userEmail : "";


                if (emailUser) {
                    console.log(`send email deposit address = ${response.address_in}, ${coinType}, ${response.minimum_transaction_coin}`);
                    var minDeposit = config.configWithdraw[coinType.toLowerCase()].minDeposit;

                    // Envoi d'un message au client pour l'informer que son adresse a été créée avec succès
                    try {
                        console.log(`emailUser = ${emailUser}`);
                        console.log(`address_in = ${response.address_in}`);
                        console.log(`coinType = ${coinType}`);
                        console.log(`minDeposit = ${minDeposit}`);

                        sendMsg(
                            emailUser,
                            `Address ${coinType.toUpperCase()} Created Successfully`,
                            templateSuccessCreateAddress(response.address_in, coinType, minDeposit),
                            // address, coinType, minDeposit, maxDeposit
                        );
                    } catch (e) {
                        console.log("Un probleme est survenue lors de l'envoie du mail d'adresse creer");
                        console.log(`Probleme = ${e}`);


                    }
                }
                else {
                    console.log("Email non disponible");

                }

                return res.json({ status: true, data: data });
            } else {
                return res.json({ status: false, data: response, message: 'API Error' });
            }
        }
    } catch (err) {
        console.error({ title: 'blockbee controller - getDepositAddress', message: err });
        return res.json({ status: false, data: null, message: 'Server Error' });
    }
};



// 
exports.webHookDeposit = async (req, res) => {
    // Récupération de l'ID de l'utilisateur depuis les paramètres de l'URL
    const { user_id } = req.query;

    try {
        // Extraction des paramètres de BlockBee depuis le body de la requête
        const {
            uuid,             // Identifiant unique de la transaction
            address_in,       // Adresse générée par BlockBee (cible de dépôt)
            address_out,      // Adresse(s) de redirection de paiement
            txid_in,          // Hash de la transaction de paiement du client
            txid_out,         // (Optionnel) Hash de la transaction de sortie (confirmation)
            confirmations,    // Nombre de confirmations
            value_coin,       // Montant envoyé par le client avant déduction des frais
            coin,             // Ticker de la crypto (ex: btc, erc20_usdt, etc.)
            price,            // Prix de la coin en USD au moment du callback
            fee_coin,         // (Optionnel) Frais de transaction
            pending           // 1 pour callback pending, 0 pour confirmation success
        } = req.body;


        var value_coin_number = parseFloat(value_coin);  // Convertir en nombre à virgule flottante (double)
        var fee_coin_number = parseFloat(fee_coin);      // Convertir en nombre à virgule flottante (double)
        var creditAmount = value_coin_number - fee_coin_number;

        // Détermination de la devise en fonction du paramètre "coin"
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
            currency = { coinType: ticker.toUpperCase(), type: tokenType.toLowerCase() };
        } else {
            currency = { coinType: coin.toUpperCase(), type: 'native' };
        }

        if (pending == 0) {

            // Pour confirmation, on met à jour la transaction existante
            let txData = await models.transactionModel.findOne({ uuid });
            if (txData) {
                // Mise à jour des informations de la transaction (confirmations, flag pending, etc.)
                txData.confirmations = confirmations;
                txData.pending = pending; // Passage à 0 (confirmé)
                if (txid_out) txData.txId_out = txid_out;
                if (fee_coin) txData.fee_coin = fee_coin;
                txData = await txData.save();
                // console.log("Transaction existante, mise à jour:", txData);
            } else {
                // Création d'une nouvelle transaction en cas d'absence de transaction existante
                var depositDate = new Date();


                const transaction = await new models.transactionModel({
                    userId: user_id,
                    uuid,
                    txId: txid_in,
                    txId_out: txid_out,
                    amount: creditAmount,
                    from: address_out,
                    to: address_in,
                    date: depositDate,
                    confirmations,
                    price: price,
                    fee_coin: fee_coin,
                    currency,
                    pending,
                    type_transaction: "deposit"
                }).save();

                // Récupération de l'utilisateur pour obtenir son email
                const user = await models.userModel.findOne({ _id: user_id });
                const emailUser = user ? user.userEmail : null;


                // Mise à jour du solde de l'utilisateur basé sur l'adresse_in
                let walletData = await models.walletModel.findOne({ address: address_in });
                if (walletData) {
                    let userData = await models.userModel.findOne({ _id: walletData.userId });
                    let balanceEntry = userData.balance.data.find((data) =>
                        data.coinType === currency.coinType && data.type.toLowerCase() === currency.type.toLowerCase()
                    );
                    if (balanceEntry) {
                        // console.log("Entrée de solde existante trouvée. Ancien solde:", balanceEntry.balance);
                        balanceEntry.balance = Number(balanceEntry.balance || 0) + Number(creditAmount);
                        // console.log("Nouveau solde pour", currency.coinType, ":", balanceEntry.balance);
                    } else {
                        console.log("Aucune entrée de solde trouvée pour cette devise. Création d'une nouvelle entrée.");
                        userData.balance.data.push({ coinType: currency.coinType, balance: Number(creditAmount), type: currency.type.toLowerCase(), chain: 'NEW CHAIN CREATE' });
                    }
                    await models.userModel.findOneAndUpdate({ _id: walletData.userId }, { balance: userData.balance });
                    // console.log("Solde mis à jour pour l'utilisateur:", walletData.userId, 'solde = ', creditAmount);
                } else {
                    console.log("Aucune donnée de wallet trouvée pour address_in:", address_in);
                }

                // -------------- notifier le user que sont compte vient d'etre crediter du montant - frais
                if (emailUser) {
                    // -------------------------------- Envoi du message à l'adresse email de l'utilisateur
                    sendMsg(
                        emailUser,
                        `Deposit confirmed - ${depositDate.toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Europe/Paris' // Ajustez selon le fuseau horaire du serveur
                        })} `,
                        templateMailDepositStatus(
                            {
                                amount: creditAmount,
                                address: address_in,
                                coinType: currency.coinType,
                            }
                        ),
                        // amount, address, coinType
                    );
                    // -------------------------------- Envoi du message à l'adresse email de l'utilisateur
                }


                // -------------- notifier l'admin qu'un nouveau user a fait un depot
                sendMsg(
                    config.adminEmail,
                    `Ne Deposit confirmed - ${depositDate.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Europe/Paris' // Ajustez selon le fuseau horaire du serveur
                    })} `,
                    templateAdminNotification("new_deposit", {
                        amount: creditAmount,
                        coinType: currency.coinType,
                        address: address_in,
                        status: 0,
                        email: emailUser,
                        date: depositDate.toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Europe/Paris' // Ajustez selon le fuseau horaire du serveur
                        }),
                    })
                    // type : 'new_deposit'
                    // data = {
                    //   amount: 250,
                    //   coinType: 'USDT',
                    //   address: '0x123abc456def789...',
                    //   status: 0, // 0 = confirmé, 1 = en attente
                    //   date: '30/04/2025 11:12',
                    //   email: 'user@example.com' // ajout de l'email de l'utilisateur
                    // }

                );


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














// 
// 
// 
//  Retrait Bitcoin
// Fonction pour initialiser une demande de retrait en créant une transaction pending
exports.initWithDrawClient = async (req, res) => {

    const { coinType, amount, address, userId } = req.body;
    const coinKey = coinType?.toLowerCase();

    // 1. Validation des champs requis
    if (!userId || !amount || !address || !coinType) {
        return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // 2. Validation du format de l'adresse
    if (!cryptoAddressValidator(coinKey, address)) {
        return res.status(400).json({ error: `Invalid ${coinType.toUpperCase()} address format` });
    }

    // Récupération utilisateur avec population du solde
    const user = await models.userModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });


    // Vérifier s'il existe déjà une demande de retrait en attente
    const existingPendingWithdraw = await models.transactionModel.findOne({
        userId,
        type_transaction: "withdraw",
        withdraw_request: 1
    });

    if (existingPendingWithdraw) {
        return res.status(400).json({
            error: "You already have a pending withdrawal request. Please wait until it is processed before making another."
        });
    }

    // Vérification solde
    const balanceEntry = user.balance.data.find(e => e.coinType.toUpperCase() === coinType.toUpperCase());
    if (!balanceEntry) return res.status(400).json({ error: `${coinType} balance not found` });
    //balance = {"coinType":"BNB","chain":"BNB","type":"bep20","balance":0.0076490408}

    const availableBalance = Number(balanceEntry.balance);
    const withdrawalAmount = Number(amount);
    const withdrawConfig = config.configWithdraw[coinKey];
    // pour le bnb Withdraw Config: { fee: 0.000085, min: 0.002, max: 0.5, precision: 5 }


    // Validations montants
    if (withdrawalAmount < withdrawConfig.min) {
        return res.status(400).json({ error: `Minimum withdrawal: ${withdrawConfig.min.toFixed(withdrawConfig.precision)} ${coinType}` });
    }
    if (withdrawalAmount > withdrawConfig.max) {
        return res.status(400).json({ error: `Maximum withdrawal: ${withdrawConfig.max.toFixed(withdrawConfig.precision)} ${coinType}` });
    }
    if (withdrawalAmount > availableBalance) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }


    // // Mise à jour du solde
    user.balance.data = user.balance.data.map(e => {
        if (e.coinType.toUpperCase() === coinType.toUpperCase()) {
            return { ...e, balance: (Number(e.balance) - withdrawalAmount).toFixed(withdrawConfig.precision) };
        }
        return e;
    });


    user.markModified('balance');
    await user.save();



    // on creer la transactions en attente
    const transactionData = {
        userId,
        amount: withdrawalAmount,
        to: address,
        date: new Date(),
        currency: {
            coinType: coinKey.toUpperCase(),
            type: coinKey === 'bnb' ? 'bep20' : 'native',
        },
        type_transaction: "withdraw",
        withdraw_request: 1, // 1 indique une demande de retrait en attente
    };

    const transaction = new models.transactionModel(transactionData);
    await transaction.save();



    // Envoi emails
    if (user.userEmail) {
        const emailData = {
            amount: withdrawalAmount.toFixed(withdrawConfig.precision),
            address,
            coinType: coinType.toUpperCase(),
            finalAmount: (withdrawalAmount - withdrawConfig.fee).toFixed(withdrawConfig.precision),
            transactionId: transaction._id
        };

        // Email utilisateur
        sendMsg(
            user.userEmail,
            `Withdrawal Request Confirmation - ${new Date().toLocaleDateString()}`,
            templateWihdrawInit(emailData)
        );

        // Email admin
        sendMsg(
            config.adminEmail,
            `New Withdrawal Request - ${coinType.toUpperCase()}`,
            templateAdminPendingWithdraw({
                ...emailData,
                userEmail: user.userEmail,
                userId: user._id
            })
        );
    }


    return res.status(200).json({
        status: true,
        message: "Withdrawal processed successfully",

    });

};













// Fonction pour récupérer toutes les transactions en attente (withdraw_request === 1)
exports.getPendingTransactionsAdmin = async (req, res) => {
    try {
        const transactions = await models.transactionModel.aggregate([
            {
                $match: {
                    type_transaction: 'withdraw',
                    withdraw_request: 1
                }
            },
            {
                $sort: { updatedAt: 1 }
            },
            {
                $addFields: {
                    userObjectId: { $toObjectId: "$userId" } // 👈 conversion string -> ObjectId
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userObjectId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    txId: 1,
                    txId_out: 1,
                    amount: 1,
                    to: 1,
                    from: 1,
                    currency: 1,
                    type_transaction: 1,
                    withdraw_request: 1,
                    pending: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    email: '$user.userEmail',
                    username: '$user.userName'
                }
            }
        ]);

        return res.json({ status: true, data: transactions });
    } catch (err) {
        console.error({ title: 'getPendingTransactionsAdmin', message: err.message });
        return res.json({ status: false, message: 'Server Error' });
    }
};







// fonction pour payer user 
exports.validatePayment = async (req, res) => {
    const { userId, userEmail, coin, address, value } = req.body;

    let response = await blockbeeControler.withdrawBlockbee({ coinType: coin, to: address, amount: value });

    if (response.status) {
        // mettre a jour la transactions et envoyer un email au users
        try {
            const result = await models.transactionModel.findOneAndUpdate(
                {
                    userId,
                    pending: -1,  // Transaction en attente de traitement
                    withdraw_request: 1  // Demande de retrait initiée
                },
                {
                    $set: {
                        uuid: response.request_id,  // ID de la requête BlockBee
                        pending: 0,                          // 0 = transaction confirmée
                        withdraw_request: 0,                 // 0 = retrait terminé
                        date_confirm: new Date(),            // Date de confirmation
                    },
                    $push: {
                        logs: {
                            date: new Date(),
                            event: 'withdraw_processed',
                            message: 'Retrait confirmé par BlockBee'
                        }
                    }
                },
                {
                    new: true,       // Retourne le document mis à jour
                    upsert: false     // Ne pas créer si inexistant
                }
            );

            if (!result) {
                throw new Error('Transaction introuvable ou déjà traitée');
            }

            // envoyer le mail de retrait approuver
            // Email admin
            sendMsg(
                userEmail,
                `New Withdrawal Request - ${coin.toUpperCase()}`,
                templateMailWithdrawalApproved({
                    amount: value,
                    address,
                    coinType: coin,
                })
            );

        } catch (err) {
            console.error("Erreur lors de la mise à jour de la transaction :", err.message);
            throw err;
        }

    }


    return res.json({ status: true, data: response });


};





// fonction pour payer user 
exports.payoutCrypto = async (req, res) => {
    // const { payout_id } = req.body;

    // console.log(`payloadCrypto ==== ${payout_id}`);

    // // const { userId, userEmail, coin, address, value } = req.body;

    // let response = await blockbeeControler.payoutBlockbee({ payout_id });

    // console.log(`response = ${JSON.stringify(response)}`);


    // if (response.status == true) {
    //     return res.json({
    //         status: true,
    //         data: "response",
    //         message: response.message
    //     });
    // } else {

    //     return res.json({
    //         status: false,
    //         data: "response",
    //         message: response.message
    //     });
    // }



    // if (response.status) {
    //     // mettre a jour la transactions et envoyer un email au users
    //     try {
    //         const result = await models.transactionModel.findOneAndUpdate(
    //             { userId }, // on identifie la transaction via uuid
    //             {
    //                 $set: {
    //                     uuid: response.request_id,
    //                     pending: 0,               // 0 = confirmé
    //                     withdraw_request: 0,      // 0 = retrait terminé/crédité
    //                     date_confirm: date_confirm || new Date()
    //                 }
    //             },
    //             { new: true } // retourne le document mis à jour
    //         );

    //         if (!result) {
    //             throw new Error("Transaction non trouvée avec cet UUID");
    //         }


    //         // envoyer le mail de retrait approuver
    //         // Email admin
    //         sendMsg(
    //             userEmail,
    //             `New Withdrawal Request - ${coin.toUpperCase()}`,
    //             templateMailWithdrawalApproved({
    //                 amount,
    //                 address,
    //                 coinType,
    //             })
    //         );

    //     } catch (err) {
    //         console.error("Erreur lors de la mise à jour de la transaction :", err.message);
    //         throw err;
    //     }



    // }




};
