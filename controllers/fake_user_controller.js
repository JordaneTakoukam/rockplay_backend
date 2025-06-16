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

// Générer un seul historique de jeu aléatoire
async function generateFakeBetHistories(gameTypeParam = null) {
    try {
        const gameTypes = {
            1: 'scissor',
            2: 'turtle',
            3: 'mines',
            4: 'dice'
        };

        // Récupérer les utilisateurs depuis la base
        const users = await UserModel.find(
            { userName: { $in: fakeUsers.map(u => u.userName) } },
            { _id: 1, userNickName: 1 }
        );

        if (users.length === 0) {
            throw new Error('Aucun utilisateur fictif trouvé en base de données');
        }

        // Sélection aléatoire d'un utilisateur
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Trouver le coinTypePlay correspondant dans fakeUsers
        const userInFakeList = fakeUsers.find(u => u.userNickName === randomUser.userNickName);
        const coinTypePlay = userInFakeList?.coinTypePlay || 'bnb'; // Fallback si non trouvé

        // Récupérer la crypto config
        const userCrypto = cryptoAvailable[coinTypePlay];
        if (!userCrypto) {
            throw new Error(`Type de crypto non reconnu: ${coinTypePlay}`);
        }

        // Détermination du type de jeu
        let gameType;
        if (gameTypeParam && gameTypes[gameTypeParam]) {
            gameType = gameTypes[gameTypeParam];
        } else {
            const randomIndex = Math.floor(Math.random() * 4) + 1;
            gameType = gameTypes[randomIndex];
        }

        // Création de l'historique
        const history = {
            userId: randomUser._id,
            userNickName: randomUser.userNickName,
            gameType,
            roundNumber: `round_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            betAmount: getRandomBetAmount(userCrypto.coinType),
            coinType: userCrypto,
            payout: getRandomPayout(gameType),
            roundResult: 'finish', // finish, payout , lost
            roundState: true,
            createdAt: new Date()
        };


        // Sauvegarde en base de données
        await BetHistory.create(history);

    } catch (err) {
        console.error('Erreur lors de la création de l\'historique:', err);
        throw err;
    }
}





// Fonctions utilitaires restées identiques
function getRandomBetAmount(coinType) {
    const config = configPlayAmount[coinType];
    if (!config) throw new Error(`Crypto non supportée: ${coinType}`);

    let { min, max } = config;
    max = max / 3.5;
    const precision = precisionByCurrency[coinType] || 6;
    const rand = Math.random() * (max - min) + min;
    return parseFloat(rand.toFixed(precision));
}

function getRandomPayout(gameType) {
    const payouts = {
        scissor: 1.98,
        turtle: 1.94,
        mines: [
            1.08, 1.13, 1.17, 1.24, 1.29, 1.30, 1.37, 1.41, 1.56, 1.74,
            1.94, 2.18, 2.47, 2.62, 2.83, 3.00, 3.26, 3.81,
            3.70, 4.5, 5.06, 5.40, 6.60, 8.25, 9.10, 10.0, 11.0, 12.5, 14.0, 16.0, 18.5, 21.0, 24.75
        ],
        dice: [1.03, 1.14, 1.31, 1.62, 2.28, 3.42, 5.7, 11.4, 34.2]
    };
    if (['mines', 'dice'].includes(gameType)) {
        return payouts[gameType][Math.floor(Math.random() * payouts[gameType].length)];
    }
    return payouts[gameType] || 1;
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

        console.log(`${result.deletedCount} historiques fictifs supprimés.`);
        return result;
    } catch (err) {
        console.error('Erreur lors de la suppression des historiques :', err);
        throw err;
    }
}



// 2. Fonction pour vérifier le ratio de wins (inchangée)
async function checkWinRatio() {
    try {
        const lastHistories = await BetHistory.find().sort({ createdAt: -1 }).limit(10);
        console.log("Derniers résultats:", lastHistories.map(h => h.roundResult));

        const lossCount = lastHistories.filter(h => h.roundResult === 'lost').length;
        const winCount = lastHistories.filter(h => h.roundResult === 'win' || h.roundResult === 'payout' || h.roundResult === 'finish' || h.roundResult === null).length;

        console.log(`[DEBUG] Wins: ${winCount}, Losses: ${lossCount}`);

        // ✅ Autorisé si :
        // - 0, 1 ou 2 pertes (peu importe les wins)
        // - OU si on a au moins 8 wins ET exactement 2 pertes
        if (lossCount <= 2) {
            if (winCount >= 8 && lossCount === 2) {
                return true; // condition stricte avec 8 wins et 2 pertes
            } else if (lossCount < 2) {
                return true; // 0 ou 1 perte = toujours autorisé
            }
        }

        // ❌ Sinon on bloque
        return false;
    } catch (err) {
        console.error('Erreur vérification ratio:', err);
        throw err;
    }
}


// Votre fonction principale modifiée
async function generateFakeBetsSafely() {
    try {
        // Vérifier le ratio avant génération
        // const canGenerate = await checkWinRatio();

        // if (!canGenerate) {
        //     console.log('Trop de wins récents (8+/10), génération annulée');
        //     return;
        // }

        // Génération des 4 types de paris
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
