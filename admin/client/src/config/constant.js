export const COINTYPES = {
    BTC: { code: 'BTC', fullname: 'Bitcoin', token: '', decimal: 8 },
    ETH: { code: 'ETH', fullname: 'Ethereum', token: 'erc20', decimal: 6 },
    TRX: { code: 'TRX', fullname: 'TRON', token: 'trc20', decimal: 6 },
    BNB: { code: 'BNB', fullname: 'Binance Coin', token: 'bep20', decimal: 6 },
    // ZELO: { code: 'ZELO', fullname: 'PlayZelo', token: 'erc20', decimal: 4 } 
    MUP: { code: 'MUP', fullname: 'MinusPlay', token: 'erc20', decimal: 4 } 
};

export const CURRENCIES = {
    BTC: 'BTC',
    ETH: 'ETH',
    TRX: 'TRX',
    TRX: 'BNB',
    MUP: 'MUP'
}


//The equivalent of 0.5$.
export const Fee = { 
    BTC: 0.00000545,
    ETH: 0.0000961,
    TRX: 5.5,
    MUP: 1
}

export const TxScanLink = {
    Mainnet: {
    },
    Testnet: {
        BTC: 'https://sochain.com/tx/BTCTEST/',
        ETH: 'https://sepolia.etherscan.io/tx/',
        TRX: 'https://shasta.tronscan.org/#/transaction/'
    }
}

export const AddressScanLink = {
    Mainnet: {
        BTC: 'https://sochain.com/address/BTC/',
        ETH: 'https://etherscan.io/address/',
        TRX: 'https://tronscan.org/#/address/'
    },
    Testnet: {
        BTC: 'https://sochain.com/address/BTCTEST/',
        ETH: 'https://sepolia.etherscan.io/address/',
        TRX: 'https://shasta.tronscan.org/#/address/'
    }
}

export const NETWORK = 'Testnet';