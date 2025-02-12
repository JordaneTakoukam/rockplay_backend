const mongoose = require('mongoose');

const ModelSchema = mongoose.Schema({
    userId: { type: String, default: '' },
    txId: { type: String, default: '' },
    txId_out: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    from: { type: String, default: '' },
    fee_coin: { type: String, default: '' },
    to: { type: String, default: '' },
    date: { type: Date, default: Date() },
    date_confirm: { type: Date, default: Date() },
    blockNumber: { type: String, default: '' },
    subscriptionType: { type: String, default: '' },
    currency: { type: Object }, // {coinType , type}
    // new
    uuid: { type: String, default: '' },
    pending: { type: Number, default: -1 }, // deposit
    withdraw_request: { type: Number, default: 0 }, // 1 = pending withdraw, 0 = no pending withdraw


}, { autoIndex: true, timestamps: true });

ModelSchema.set('toObject', { virtuals: true });
ModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Transactions', ModelSchema);