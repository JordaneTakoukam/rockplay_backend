const UserModel = require('../models/UserModel');
const BetHistory = require('../models/BetHistoryModel');
const { configPlayAmount, precisionByCurrency } = require('../betUtils/price_config');

// Liste des 10 utilisateurs fictifs
const fakeUsers = [
    { userName: "fake_user_1", userNickName: "Kofi Mensa", coinTypePlay: 'bnb' },
    { userName: "fake_user_2", userNickName: "Ayo Diop", coinTypePlay: "btc" },
    { userName: "fake_user_3", userNickName: "Lamine Keba", coinTypePlay: "eth" },
    { userName: "fake_user_4", userNickName: "Nia Zola", coinTypePlay: "trx" },
    { userName: "fake_user_5", userNickName: "Tari Obi", coinTypePlay: "sol" },
    { userName: "fake_user_6", userNickName: "Zein frank", coinTypePlay: "bnb" },
    { userName: "fake_user_7", userNickName: "Femi Bako", coinTypePlay: "btc" },
    { userName: "fake_user_8", userNickName: "Muna Yaro", coinTypePlay: "eth" },
    { userName: "fake_user_9", userNickName: "Sira Diallo", coinTypePlay: "trx" },
    { userName: "fake_user_10", userNickName: "Yemi Kossi", coinTypePlay: "sol" },
];

// Cryptomonnaies disponibles
const cryptoAvailable = {
    bnb: { coinType: 'bnb', type: 'bep20' },
    btc: { coinType: 'btc', type: 'native' },
    eth: { coinType: 'eth', type: 'native' },
    trx: { coinType: 'trx', type: 'native' },
    sol: { coinType: 'sol', type: 'sol' }
};

// Créer les utilisateurs fictifs s'ils n'existent pas
async function createFakeUsersIfNotExist() {
    try {
        const existingUsers = await UserModel.find({
            userName: { $in: fakeUsers.map(u => u.userName) }
        }).select('userName');

        const existingUserNames = new Set(existingUsers.map(u => u.userName));
        const usersToCreate = fakeUsers.filter(u => !existingUserNames.has(u.userName));

        if (usersToCreate.length === 0) {
            console.log('Tous les utilisateurs fictifs existent déjà.');
            return;
        }

        const inserted = await UserModel.insertMany(usersToCreate.map(user => ({
            ...user,
            userEmail: `${user.userName.replace('_', '.')}@example.com`,
            userPassword: user.userName // À hasher en production
        })));

        console.log(`${inserted.length} utilisateurs fictifs créés.`);
        return inserted;
    } catch (err) {
        console.error('Erreur création utilisateurs fictifs:', err);
        throw err;
    }
}

// Fonction utilitaire générique pour choisir un élément aléatoire dans une liste
function getRandomFromList(list) {
    if (!Array.isArray(list) || list.length === 0) {
        throw new Error('Le paramètre doit être un tableau non vide');
    }
    return list[Math.floor(Math.random() * list.length)];
}

// Fonction spécifique pour les multiplicateurs de payout
function getRandomPayout(gameType) {
    const payoutsConfig = {
        scissor: 1.98,
        turtle: 1.94,
        mines: [
            1.08, 1.13, 1.17, 1.24, 1.29, 1.30, 1.37, 1.41, 1.56, 1.74,
            1.94, 2.18, 2.47, 2.62, 2.83, 3.00, 3.26, 3.81,
            3.70, 4.5, 5.06, 5.40, 6.60, 8.25, 9.10, 10.0, 11.0, 12.5, 14.0, 16.0, 18.5, 21.0, 24.75
        ],
        dice: [1.03, 1.14, 1.31, 1.62, 2.28, 3.42, 5.7, 11.4, 34.2]
    };

    const payout = payoutsConfig[gameType];

    if (Array.isArray(payout)) {
        return getRandomFromList(payout);
    }

    return payout || 1; // Fallback si le gameType n'existe pas
}

// Version optimisée de generateFakeBetHistories
async function generateFakeBetHistories(gameTypeParam = null) {
    try {
        const gameTypes = {
            1: 'scissor',
            2: 'turtle',
            3: 'mines',
            4: 'dice'
        };

        // Récupération des utilisateurs
        const users = await UserModel.find(
            { userName: { $in: fakeUsers.map(u => u.userName) } },
            { _id: 1, userNickName: 1 }
        );

        if (users.length === 0) {
            throw new Error('Aucun utilisateur fictif trouvé en base de données');
        }

        // Sélection aléatoire
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const userInFakeList = fakeUsers.find(u => u.userNickName === randomUser.userNickName);
        const coinTypePlay = userInFakeList?.coinTypePlay || 'bnb';

        // Validation crypto
        const userCrypto = cryptoAvailable[coinTypePlay];
        if (!userCrypto) {
            throw new Error(`Type de crypto non reconnu: ${coinTypePlay}`);
        }

        // Détermination du type de jeu
        const gameType = gameTypeParam && gameTypes[gameTypeParam]
            ? gameTypes[gameTypeParam]
            : gameTypes[Math.floor(Math.random() * 4) + 1];

        // Calcul des montants
        const betAmount = getRandomBetAmount(userCrypto.coinType);
        const payoutMultiplier = getRandomPayout(gameType);
        const roundResult = 'win'

        // Création de l'historique
        const history = {
            userId: randomUser._id,
            gameType,
            roundNumber: `round_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            betAmount,
            coinType: userCrypto,
            payout: payoutMultiplier,
            roundResult,
            roundState: true,
        };

        await BetHistory.create(history);
        return history;

    } catch (err) {
        console.error('Erreur lors de la génération de l\'historique:', err);
        throw err;
    }
}

// Fonction pour les montants de pari (inchangée)
function getRandomBetAmount(coinType) {
    const config = configPlayAmount[coinType];
    if (!config) throw new Error(`Crypto non supportée: ${coinType}`);

    let { min, max } = config;
    max = max / 4;
    const precision = precisionByCurrency[coinType] || 6;
    const rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(precision));
}

async function deleteAllFakeHistories() {
    try {
        // Étape 1 : Trouver les utilisateurs dont userName commence par "fake_"
        const fakeUsers = await UserModel.find({
            userName: { $regex: /^fake_user/, $options: 'i' }
        }).select('_id');

        const fakeUserIds = fakeUsers.map(user => user._id);

        if (fakeUserIds.length === 0) {
            console.log('Aucun utilisateur fictif trouvé.');
            return { deletedCount: 0 };
        }

        // Étape 2 : Supprimer les historiques associés à ces utilisateurs
        const result = await BetHistory.deleteMany({
            userId: { $in: fakeUserIds }
        });

        // console.log(`${result.deletedCount} historiques fictifs supprimés.`);
        return result;
    } catch (err) {
        console.error('Erreur lors de la suppression des historiques :', err);
        throw err;
    }
}


async function generateFakeBetsSafely() {
    try {

        await generateFakeBetHistories(1); // Scissor
        await generateFakeBetHistories(2); // Turtle
        await generateFakeBetHistories(3); // Mines
        await generateFakeBetHistories(4); // Dice


        await generateFakeBetHistories(1); // Scissor
        await generateFakeBetHistories(2); // Turtle
        await generateFakeBetHistories(3); // Mines
        await generateFakeBetHistories(4); // Dice


        await generateFakeBetHistories(1); // Scissor
        await generateFakeBetHistories(2); // Turtle
        await generateFakeBetHistories(3); // Mines
        await generateFakeBetHistories(4); // Dice

        console.log('Generated !!\n');
    } catch (err) {
        console.error('Erreur dans generateFakeBetsSafely:', err);
    }
}

// Exports
module.exports = {
    createFakeUsersIfNotExist,
    deleteAllFakeHistories,
    generateFakeBetsSafely
};