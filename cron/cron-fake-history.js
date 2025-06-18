const { CronJob } = require('cron');


// jeux scissor
const ScissorController = require('./../scissors/controller/ScissorsController');
const ScissorSocketManager = require('./../scissors/manager/SocketManager');

// jeux turtle
const TurtleController = require('./../turtlerace/controllers/TurtleController');
const TurtleSocketManager = require('./../turtlerace/manager/SocketManager');

// jeux mines
const MinesController = require('./../mines/controller/MinesController');
const MineSocketManager = require('./../mines/manager/SocketManager');


// jeux dice
const DiceController = require('./../dice/controller/DiceController');
const DiceSocketManager = require('./../dice/manager/SocketManager');
const { deleteAllFakeHistories, generateFakeBetsSafely, createFakeUsersIfNotExist } = require('../controllers/fake_user_controller');









// 1. Exécution toutes les 15 minutes (Génération de paris)
const betGenerationJob = new CronJob(
    '*/15 * * * *',
    async () => {
        console.log('⏰ Début de la génération des paris (toutes les 15 minutes)');
        try {
            await generateFakeBetsSafely();
        } catch (err) {
            console.error('❌ Erreur lors de la génération des paris:', err);
        }
    },
    null,
    true,
    'Europe/Paris'
);


// 2. Nettoyage quotidien à 02h00
const cleanupJob = new CronJob(
    '0 2 * * *',
    async () => {
        console.log('🧹 Début du nettoyage des historiques (quotidien à 02h00)');
        try {
            await deleteAllFakeHistories();
        } catch (err) {
            console.error('❌ Erreur lors du nettoyage:', err);
        }
    },
    null,
    true,
    'Europe/Paris'
);



betGenerationJob.start();
cleanupJob.start();


// ------
//deleteAllFakeHistories();
// ------
generateFakeBetsSafely();


createFakeUsersIfNotExist();

console.log('🚀 Cron job gestion fake profil');