const mongoose = require('mongoose');

const ModelSchema = mongoose.Schema({
    userId: { type: String, default: '' }, // ID de l'utilisateur associé
    txId: { type: String, default: '' }, // ID de transaction blockchain entrante
    txId_out: { type: String, default: '' }, // ID de transaction blockchain sortante
    amount: { type: Number, default: 0 }, // Montant de la transaction
    price: { type: Number, default: 0 }, // Prix unitaire au moment de la transaction
    from: { type: String, default: '' }, // Adresse source (expéditeur) - Pour un dépôt: adresse externe / Pour un retrait: adresse de la plateforme
    fee_coin: { type: String, default: '' }, // Crypto-monnaie utilisée pour les frais
    to: { type: String, default: '' }, // Adresse destination (destinataire) - Pour un dépôt: adresse de la plateforme / Pour un retrait: adresse externe
    date: { type: Date, default: Date() }, // Date de création de la transaction
    date_confirm: { type: Date, default: Date() }, // Date de confirmation blockchain
    blockNumber: { type: String, default: '' }, // Numéro de bloc blockchain
    subscriptionType: { type: String, default: '' }, // Type d'abonnement associé
    currency: { type: Object }, // {coinType, type} - Détails de la crypto-monnaie
    uuid: { type: String, default: '' }, // Identifiant unique universel
    type_transaction: { type: String, default: '' }, // Type: 'deposit' ou 'withdraw'
    pending: { type: Number, default: -1 }, // Statut pending (1 = en attente, 0 = confirmé)
    withdraw_request: { type: Number, default: -1 }, // Demande de retrait (1 = en attente, 0 = crédité)

}, { autoIndex: true, timestamps: true });

ModelSchema.set('toObject', { virtuals: true });
ModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transactions', ModelSchema);