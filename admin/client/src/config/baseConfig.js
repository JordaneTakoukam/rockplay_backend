const isLocal = process.env.REACT_APP_MODE === 'dev' ? true : false;

// console.log("App Mode = ", process.env.REACT_APP_MODE);

// const pro = 'https://admin-services.playzelo.com/admin';
const pro = 'https://admin.rockplay.fun/admin';
const dev = 'http://localhost:6100/admin';
const url = isLocal ? dev : pro;

const Config = {
    Root: {
        apiUrl: `${url}`,
        // socketServerUrl: isLocal ? `http://localhost:6200` : 'https://admin-service.playzelo.com',
        // socketServerUrl: isLocal ? `http://localhost:6200` : 'https://admin-dashboard.minusplay.com',
        socketServerUrl: null,
        socket: null
    },
    token: 'EscapeX-Admin-Token',
    request: {
        userLogin: '/adminlogin',
        confirmAuth: '/confirmAuth',
        sessionCheck: '/sessionCheck',
        changePassword: '/changepwd',
        loadDashBoardData: '/countData',
        getPlayerdata: '/getGameUsers',
        deletePlayerData: '/deleteGameUser',
        getTurtleData: '/getTurtleData',
        getScissorsData: '/getScissorsData',
        getWalletList: '/getWalletList',
        getWalletDetail: '/getWalletDetail',
        getPlayerDetail: '/getPlayerDetail',
        getTurtleDetail: '/getTurtleDetail',
        withdrawFromAddress: '/withdrawFromAddress',
        getSeedData: '/getSeedData',
        newServerSeed: '/newServerSeed',
        getMinesData: '/getMinesData',
        getEnabledData: '/getEnabledData',
        enableRewardSetting: '/enableRewardSetting',
        getDepositSettingData: '/getDepositSettingData',
        saveDepositRewardSetting: '/saveDepositRewardSetting',
        getRewardHistoryData: '/getRewardHistoryData',
        addAdminReward: '/addAdminReward',
        getFreeSpinSetting: '/getFreeSpinSetting',
        insertFreeSpinSetting: '/insertFreeSpinSetting',
        updateFreeSpinSetting: '/updateFreeSpinSetting',
        deleteFreeSpinSetting: '/deleteFreeSpinSetting',
        getSpinHistoryData: '/getSpinHistoryData',
        addAdminSpin: '/addAdminSpin',
        getUnlockSetting: '/getUnlockSetting',
        updateUnlockSetting: '/updateUnlockSetting',
        getDiceData: '/getDiceData',
        getPlinkoData: '/getPlinkoData',
        insertGame: '/insertGame',
        removeGame: '/removeGame',
        updateGame: '/updateGame',
        readGame: '/readGame',
        insertCurrency: '/insertCurrency',
        removeCurrency: '/removeCurrency',
        updateCurrency: '/updateCurrency',
        readCurrency: '/readCurrency',
        getUserLevelList: '/getUserLevelList',
        saveUserLevelData: '/saveUserLevelData',
        getBannerText: '/getBannerText',
        updateBannerText: '/updateBannerText',
        addNewTournament: '/addNewTournament',
        getTournamentList: '/getTournamentList',
        updateTournament: '/updateTournament',
        deleteTournament: '/deleteTournament',
        getCrashData: '/getCrashData',
        getCrashDetail: '/getCrashDetail',
        getSlotData: '/getSlotData',


        getPendingWithdraws: '/getPendingWithdraws',
        sendCrypto: '/sendCrypto'
    }
};

export default Config;