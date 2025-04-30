const models = require('../../models');
const blockbeeControler = require('./blockbeeController');
const { sendMsg } = require('../../helper/emailHelper');

const { templateSuccessCreateAddress } = require('../../helper/template_new_address_create');
const { templateMailDepositStatus } = require('../../helper/template_mail_deposit');
const { templateAdminNotification } = require('../../helper/template_admin');
const config = require('../../config');


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


                // Envoi d'un message au client pour l'informer que son adresse a été créée avec succès
                sendMsg(
                    emailUser,
                    `Address ${coinType.toUpperCase()} Created Successfully`,
                    templateSuccessCreateAddress(response.address_in, coinType, response.minimum_transaction_coin),
                    // address, coinType, minDeposit, maxDeposit
                );

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
        // console.log("Determined currency:", currency);

        // Traitement en fonction de la valeur de "pending"
        if (pending == 1) {
            console.log("\n --> Pending deposit callback received");

            // // Vérification si la transaction existe déjà
            // let txData = await models.transactionModel.findOne({ uuid });
            // if (!txData) {
            //     console.log("Aucune transaction existante trouvée. Création d'une transaction pending.");
            //     const transaction = await new models.transactionModel({
            //         userId: user_id,
            //         uuid,
            //         txId: txid_in,
            //         amount: value_coin,
            //         from: address_out,
            //         to: address_in,
            //         date: new Date(),
            //         confirmations,
            //         price: price,
            //         currency,
            //         pending
            //     }).save();
            //     console.log("Transaction pending enregistrée:", transaction);

            //     sendMsg(
            //         emailUser,
            //         `Deposit in ${currency.coinType.toUpperCase()} detected`,
            //         templateMailDepositStatus(
            //             value_coin,
            //             address_out,
            //             currency.coinType,
            //             pending
            //         ),
            //         // amount, address, coinType, status
            //     );
            // } else {
            //     console.log("Transaction pending déjà existante:", txData);
            // }
            // return res.send({ message: "Success payment init: pending" });
        } else if (pending == 0) {

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
                    pending
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
                        console.log("Entrée de solde existante trouvée. Ancien solde:", balanceEntry.balance);
                        balanceEntry.balance += Number(creditAmount);
                        console.log("Nouveau solde pour", currency.coinType, ":", balanceEntry.balance);
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
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'UTC',
                            hour12: false
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
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'UTC',
                            hour12: false
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
    console.log("INIT WITHDRAW CALL\n\n");
    return res.json({ status: false, message: 'initWithDrawClient' });

    // try {
    //     const { userId, amount, to, coinType, fee } = req.body;
    //     if (!userId || !amount || !to || !coin || !fee) {
    //         return res.status(400).json({ message: "Certains paramètres sont manquants (userId, amount, to, coinType, fee)" });
    //     }

    //     // Récupération de l'utilisateur pour obtenir son nom (ou email)
    //     const user = await models.userModel.findOne({ _id: userId });
    //     if (!user) {
    //         return res.status(404).json({ message: "Utilisateur non trouvé" });
    //     }
    //     const userName = user.userNickName;

    //     // Récupération du wallet correspondant à l'utilisateur et à la crypto spécifiée
    //     const wallet = await models.walletModel.findOne({ userId, currency: coinType });
    //     if (!wallet) {
    //         return res.status(404).json({ message: `Wallet non trouvé pour la crypto ${coinType}` });
    //     }

    //     // Vérification du montant minimum autorisé pour la transaction selon la crypto
    //     const minAmount = parseFloat(wallet.minimum_transaction_coin) || 0;
    //     if (parseFloat(amount) < minAmount) {
    //         return res.status(400).json({
    //             message: `Montant insuffisant pour ${coinType}. Le montant minimum est ${minAmount}.`
    //         });
    //     }

    //     // Vérification des frais minimum en utilisant la configuration de retrait
    //     const coinKey = coinType.toLowerCase();
    //     if (!configWithdraw[coinKey]) {
    //         return res.status(400).json({
    //             message: `Configuration de retrait non définie pour ${coinType}.`
    //         });
    //     }
    //     const minFee = configWithdraw[coinKey].fee;
    //     if (parseFloat(fee) < minFee) {
    //         return res.status(400).json({
    //             message: `Frais insuffisants pour ${coinType}. Les frais minimum sont ${minFee}.`
    //         });
    //     }

    //     // Création d'une nouvelle transaction pending pour le retrait
    //     // On marque le retrait pending en fixant withdraw_request à 1.
    //     const transactionData = {
    //         userId,
    //         amount,
    //         to,
    //         date: new Date(),
    //         currency: {
    //             coinType: coinKey,
    //             type: coinKey === 'bnb' ? 'bep20' : 'native',
    //         },
    //         withdraw_request: 1, // 1 indique une demande de retrait en attente
    //     };

    //     const transaction = await new models.transactionModel(transactionData).save();

    //     // envoyer un email 
    //     // Récupération de l'utilisateur pour obtenir son email
    //     const emailUser = user ? user.userEmail : null;
    //     if (!emailUser) {
    //         console.error("Email introuvable pour l'utilisateur avec l'id:", userId);
    //     } else {
    //         // Envoi du message à l'adresse email de l'utilisateur
    //         sendMsg(emailUser, "Withdrawal Pending", templateSendTransaction('withdrawal_pending', amount, currency.coinType));
    //     }
    //     // Retourne un objet combinant le nom de l'utilisateur et les données de la transaction créée
    //     return res.status(200).json({ userName, ...transaction.toObject() });
    // } catch (err) {
    //     console.error("Erreur dans initWithDraw :", err);
    //     return res.status(500).json({ message: "Server Error" });
    // }
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



