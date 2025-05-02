const models = require('../../models');
const blockbeeControler = require('./blockbeeController');
const { sendMsg } = require('../../helper/emailHelper');

const { templateSuccessCreateAddress } = require('../../helper/template_new_address_create');
const { templateMailDepositStatus } = require('../../helper/template_mail_deposit');
const { templateAdminNotification } = require('../../helper/template_admin');
const config = require('../../config');
const { cryptoAddressValidator } = require('../../betUtils/validate_crypto_address');
const { templateMailWithdrawalRequest } = require('../../helper/template_init_withdraw');
const { templateAdminPendingWithdraw } = require('../../helper/template_admin_pending_withdraw');


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

                    // Envoi d'un message au client pour l'informer que son adresse a été créée avec succès
                    sendMsg(
                        emailUser,
                        `Address ${coinType.toUpperCase()} Created Successfully`,
                        templateSuccessCreateAddress(response.address_in, coinType, response.minimum_transaction_coin),
                        // address, coinType, minDeposit, maxDeposit
                    );
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
                console.log("Transaction existante, mise à jour:", txData);
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
                            creditAmount,
                            address_in,
                            currency.coinType,
                            pending
                        ),
                        // amount, address, coinType, status
                    );
                    // -------------------------------- Envoi du message à l'adresse email de l'utilisateur
                }


                // -------------- notifier l'admin qu'un nouveau user a fait un depot
                sendMsg(
                    config.adminEmail,
                    `New user registered via Google`,
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












// Fonction pour récupérer toutes les transactions en attente (withdraw_request === 1)
exports.getPendingTransactionsAdmin = async (req, res) => {
    console.log("getPendingTransactionsAdmin CALL\n\n");
    return res.json({ status: false, message: 'getPendingTransactionsAdmin' });

    // try {
    //     const { userId } = req.body;
    //     if (!userId) {
    //         return res.status(400).json({ message: "userId manquant dans la requête" });
    //     }

    //     // Récupération de l'utilisateur pour obtenir son nom (ou email, selon vos besoins)
    //     const user = await models.userModel.findOne({ _id: userId });
    //     const userName = user ? user.userNickName : null;

    //     // Récupération de toutes les transactions dont withdraw_request vaut 1, triées de la plus récente à la plus ancienne
    //     const transactions = await models.transactionModel
    //         .find({ withdraw_request: 1 })
    //         .sort({ date: -1 });

    //     return res.status(200).json({ userName, transactions });
    // } catch (err) {
    //     console.error("Erreur dans getPendingTransactions :", err);
    //     return res.status(500).json({ message: "Server Error" });
    // }
};


// 
// 
// 
//  Retrait Bitcoin
// Fonction pour initialiser une demande de retrait en créant une transaction pending
exports.initWithDrawClient = async (req, res) => {
    console.log("INIT WITHDRAW CALL");

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
            fee: withdrawConfig.fee.toFixed(withdrawConfig.precision),
            finalAmount: (withdrawalAmount - withdrawConfig.fee).toFixed(withdrawConfig.precision),
            transactionId: transaction._id
        };

        // Email utilisateur
        sendMsg(
            user.userEmail,
            `Withdrawal Request Confirmation - ${new Date().toLocaleDateString()}`,
            templateMailWithdrawalRequest(emailData)
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











exports.payoutCrypto = async (req, res) => {
    console.log("payoutCrypto CALL\n\n");
    return res.json({ status: false, message: 'payoutCrypto' });

    // try {
    //     const { transactionId } = req.body;
    //     if (!transactionId) {
    //         return res.status(400).json({ message: "Le transactionId est requis." });
    //     }

    //     // Récupération des informations de la transaction
    //     const transaction = await models.transactionModel.findOne({ _id: transactionId });
    //     if (!transaction) {
    //         return res.status(404).json({ message: "Transaction non trouvée." });
    //     }

    //     // Extraction des informations depuis la transaction
    //     const userId = transaction.userId;
    //     // On suppose que le champ 'currency' contient un objet avec la propriété coinType
    //     const coinType = transaction.currency && transaction.currency.coinType ? transaction.currency.coinType : "";
    //     const to = transaction.to;
    //     const amount = transaction.amount;

    //     // Récupération de l'email de l'utilisateur depuis la collection userModel
    //     const user = await models.userModel.findOne({ _id: userId });
    //     if (!user) {
    //         return res.status(404).json({ message: "Utilisateur non trouvé." });
    //     }
    //     const emailUser = user.userEmail;

    //     // Appel de la méthode withdrawBlockbee avec les paramètres requis
    //     let responseData = await blockbeeControler.withdrawBlockbee({ coinType, to, value: amount });

    //     console.log(`responseData == ${responseData}`);

    //     if (responseData.data == true) {
    //         sendMsg(emailUser, "Withdrawal Pending", templateSendTransaction('withdrawal_confirmed', amount, coinType));
    //         return true;

    //     }
    // } catch (error) {
    //     console.error("Erreur dans payoutCrypto :", error);
    //     return res.status(500).json({ message: "Server Error", error: error.message });
    // }
};



