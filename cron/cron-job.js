const mongoose = require('mongoose');
const config = require('../config');
const { models } = require('mongoose');
const { CronJob } = require('cron');
const TransactionModel = require('../models/TransactionModel');
const UserModel = require('../models/UserModel');

// CRON toutes les 5 minutes
// const job = new CronJob('*/5 * * * *', async () => { // toutes les 5 mintes 
const job = new CronJob('0 * * * *', async () => {

    console.log('🔁 [CRON] Vérification des bonus non traités…');

    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 🎯 Récupérer les bonus non traités uniquement
        const unprocessedBonuses = await TransactionModel.find({
            type_transaction: 'bonus',
            $or: [
                { bonus_processed: false },
                { bonus_processed: { $exists: false } }
            ]
        });

        if (unprocessedBonuses.length === 0) {
            console.log('✅ Aucun nouveau bonus à traiter.');
            return;
        }

        for (const bonus of unprocessedBonuses) {
            const user = await UserModel.findById(bonus.userId);
            if (!user) {
                console.warn(`❌ Utilisateur non trouvé pour bonus : ${bonus.userId}`);
                continue;
            }

            // Vérifie si le bonus est expiré (créé il y a plus de 24h)
            if (bonus.createdAt <= twentyFourHoursAgo) {
                const balanceEntry = user.balance.data.find(b =>
                    b.coinType === bonus.currency.coinType &&
                    b.type === bonus.currency.type.toLowerCase() &&
                    b.chain === 'BONUS'
                );

                if (!balanceEntry) {
                    console.log(`ℹ️ Aucun solde BONUS à ajuster pour ${user._id}`);
                    bonus.bonus_processed = true;
                    await bonus.save();
                    continue;
                }

                const oldBalance = Number(balanceEntry.balance);
                const bonusAmount = Number(bonus.amount);

                balanceEntry.balance = oldBalance - bonusAmount;
                if (balanceEntry.balance < 0) {
                    balanceEntry.balance = 0;
                    console.log(`⚠️ Solde négatif évité pour ${user._id}, solde BONUS mis à 0`);
                } else {
                    console.log(`💸 Bonus expiré retiré pour ${user._id} : -${bonusAmount} ${bonus.currency.coinType}`);
                }

                user.markModified('balance');
                await user.save();

                bonus.bonus_processed = true;
                await bonus.save();
            } else {
                console.log(`⏳ Bonus encore valide pour ${user._id}, pas encore expiré. bonus.createdAt = ${bonus.createdAt}`);
            }
        }

        console.log(`✅ ${unprocessedBonuses.length} bonus vérifiés.`);
    } catch (err) {
        console.error('❌ Erreur durant le cron des bonus non traités :', err.message);
    }
});

job.start();
