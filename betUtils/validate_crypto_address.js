// utils/addressValidators.js

const validateBTCAddress = (address) => {
    const btcRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/;
    return btcRegex.test(address);
};

const validateETHAddress = (address) => {
    const ethRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethRegex.test(address);
};

const validateBNBAddress = (address) => {
    return validateETHAddress(address);
};

const validateTRXAddress = (address) => {
    const trxRegex = /^T[a-zA-Z0-9]{33}$/;
    return trxRegex.test(address);
};

const validateSOLAddress = (address) => {
    const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solRegex.test(address);
};

const cryptoAddressValidator = (currency, address) => {
    const validators = {
        btc: validateBTCAddress,
        eth: validateETHAddress,
        bnb: validateBNBAddress,
        trx: validateTRXAddress,
        sol: validateSOLAddress
    };

    const validator = validators[currency.toLowerCase()];
    return validator ? validator(address) : false;
};

module.exports = {
    cryptoAddressValidator
};
