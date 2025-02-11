const mongoose = require('mongoose');

const ModelSchema = mongoose.Schema({
    address: { type: String, default: '', required: [true, 'Please input address'] },
    address_out: { type: String, default: '' },


    currency: { type: String, default: 'ETH', enum: ['BTC', 'ETH', 'TRX', 'BNB'] },
    derivationKey: { type: Number, default: 1 },
    xpub: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    privateKey: { type: String, default: '' },
    minimum_transaction_coin: { type: String, default: '' }
}, { autoIndex: true, timestamps: true });

ModelSchema.set('toObject', { virtuals: true });
ModelSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Wallets', ModelSchema);