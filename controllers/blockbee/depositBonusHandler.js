const mongoose = require("mongoose");
const { sendMsg } = require("../../helper/emailHelper");
const config = require("../../config");
const { templateMailBonusCredit } = require("../../helper/template_mail_bonus_credit");
const TransactionModel = require("../../models/TransactionModel");
const UserModel = require("../../models/UserModel");

exports.handleDepositBonus = async ({
    user_id,
    montantDeposer,
    price,
    currency,
    emailUser,
}) => {
    console.log("handleDepositBonus started ===\n");

    try {
        const montantUSD = montantDeposer * parseFloat(price);

        // 🔍 Recherche des anciens dépôts confirmés
        const anciensDepots = await TransactionModel.find({
            userId: user_id,
            type_transaction: "deposit",
            pending: 0,
        });

        const nombreDepots = anciensDepots.length;

        // 📦 Bonus limité aux 4 premiers dépôts (ou selon la config)
        if (nombreDepots < config.depositBonuns.length) {

            const bonusData = config.depositBonuns[nombreDepots];

            if (bonusData && montantUSD >= bonusData.min && montantUSD <= bonusData.max) {

                const pourcentage = bonusData.pourcentage;
                const montantBonus = (montantDeposer * pourcentage) / 100;

                // 🧑 Récupération des données utilisateur
                let userData = await UserModel.findOne({ _id: user_id });

                if (!userData) {
                    console.error("❌ Utilisateur non trouvé :", user_id);
                    return;
                }

                // ✅ Mise à jour du solde avec le bonus
                let balanceEntry = userData.balance.data.find(
                    (data) =>
                        data.coinType === currency.coinType &&
                        data.type.toLowerCase() === currency.type.toLowerCase()
                );

                if (balanceEntry) {
                    balanceEntry.balance = Number(balanceEntry.balance || 0) + Number(montantBonus);
                }

                // 💾 Sauvegarde du solde mis à jour
                await UserModel.findOneAndUpdate(
                    { _id: user_id },
                    { balance: userData.balance },
                    { new: true }
                );

                // 💸 Enregistrement de la transaction BONUS
                const newTransaction = new TransactionModel({
                    userId: user_id,
                    amount: montantBonus,
                    price,
                    date: new Date(),
                    currency,
                    pending: 0,
                    type_transaction: "bonus"
                });
                await newTransaction.save();


                // 📧 Notification email
                if (emailUser) {
                    const depositDate = new Date();
                    const emailSubject = `🎉 Bonus #${nombreDepots} Credited Successfully on ${depositDate.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'Europe/Paris'
                    })}`;

                    const emailContent = templateMailBonusCredit({
                        montantDeposer: montantDeposer,
                        montantBonus: montantBonus,
                        coinType: currency.coinType,
                        numeroDepot: nombreDepots,
                    });

                    await sendMsg(emailUser, emailSubject, emailContent);
                } else {
                    console.log("email introuvable, email bonus non envoyer");

                }


            } else {
                console.log(`ℹ️ Aucun bonus applicable pour le dépôt #${nombreDepots}`);
            }
        } else {
            console.log(`ℹ️ Dépôt #${nombreDepots} ignoré pour les bonus (limite atteinte)`);
        }
    } catch (errBonus) {
        console.error(`❌ Erreur lors de l'attribution du bonus pour l'utilisateur ${user_id} :`, errBonus.message);
        console.error(errBonus.stack); // Affiche la stack trace complète
        throw errBonus; // Propage l'erreur pour une gestion ultérieure
    }
};