const mongoose = require('mongoose');

const balanceObject = {
    data: [
        { coinType: 'BNB', chain: 'BNB', type: 'bep20', balance: 0 },
        { coinType: 'BTC', chain: 'BTC', type: 'native', balance: 0 },
        { coinType: 'BTC_LN', chain: 'BTC', type: 'lightning', balance: 0 },  // Bitcoin Lightning
        { coinType: 'BCH', chain: 'BCH', type: 'native', balance: 0 },        // Bitcoin Cash
        { coinType: 'LTC', chain: 'LTC', type: 'native', balance: 0 },        // Litecoin
        { coinType: 'DOGE', chain: 'DOGE', type: 'native', balance: 0 },      // Dogecoin
        { coinType: 'ETH', chain: 'ETH', type: 'native', balance: 0 },        // Ethereum (ERC20)
        { coinType: 'TRX', chain: 'TRON', type: 'native', balance: 0 },
        { coinType: 'SOL', chain: 'SOL', type: 'sol', balance: 0 },
        // { coinType: 'USDT', balance: 0, chain: 'BNB', type: 'bep-20' },
        // { coinType: 'USDT', balance: 0, chain: 'TRON', type: 'trc-20' },
        { coinType: 'RP', balance: 0, chain: '', type: '' }
    ]
}

const ModelSchema = mongoose.Schema({
    userName: { type: String },
    userAvatar: { type: String, default: 'avatar1.png' },
    userLevel: { type: Number, default: '0' },
    userEmail: { type: String },
    userPassword: { type: String },
    userToken: { type: String },
    loginType: { type: String, enum: ['Google', 'Wallet', 'Email', 'Apple'], default: 'Email' },
    userNickName: { type: String, required: [true, 'Please input userNickName'] },
    type: { type: String, enum: ['user', 'admin'], default: 'user' },
    balance: { type: Object, default: balanceObject },
    address: { type: Object },
    currency: { type: Object, default: { coinType: 'BNB', type: 'bep20' } },
    profileSet: { type: Boolean, default: false },
    campaignCode: { type: String, default: '' },
}, { autoIndex: true, timestamps: true });

ModelSchema.set('toObject', { virtuals: true });
ModelSchema.set('toJSON', { virtuals: true });

ModelSchema.methods.updateToken = function (token) {
    this.token = token;
    return this.save();
}

module.exports = mongoose.model('Users', ModelSchema);