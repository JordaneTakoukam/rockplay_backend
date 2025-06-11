import { Box, Table, TableHead, TableRow, TableSortLabel, TableCell, TableBody, Select, MenuItem, IconButton, Modal, Typography, Button, Stack } from "@mui/material";
import PropTypes from 'prop-types';
import { useState, useContext, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { LoadingContext } from "layout/Context/loading";
import { useDispatch } from "react-redux";
import { getPendingWithdraws, payoutCrypto, sendCrypto } from "redux/action/report";
import { COINTYPES } from "config/constant";
import { Visibility } from "@mui/icons-material";
import { useToasts } from "react-toast-notifications";

const useStyles = makeStyles(() => ({
    PlayerContainer: {
        background: '#fff',
        borderRadius: '3px',
        borderTop: '3px solid #d2d6de',
        boxShadow: '0 1px 1px rgb(0 0 0 / 10%)',
        marginBottom: '20px',
        position: 'relative',
        width: '100%',
    },
    TableTitleBox: {
        color: '#444',
        padding: '10px',
        position: 'relative',
        display: 'inline-block',
        fontSize: '18px',
        lineHeight: '1',
    },
    TableMainBox: {
        padding: '10px',
        width: '100%'
    },
    TableHeaderCell: {
        background: 'rgb(231, 235, 240)',
        padding: '8px'
    },
    ActionButton: {
        padding: '3px'
    },
    TableRow: {
        "&>.MuiTableCell-root": {
            padding: '6px'
        }
    },
    ActionCell: {
        width: '25px'
    },
    CustomSelect: {
        background: 'transparent',
        "&>.MuiSelect-select": {
            background: 'transparent',
            fontSize: '14px',
            fontWeight: '700',
            padding: '0px 10px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '5px',
            minWidth: '100px'
        }
    },
    CustomMenuItem: {
        display: 'flex',
        gap: '5px',
        fontSize: '14px',
        fontWeight: '700',
        height: '30px',
        padding: '10px 16px'
    },
    CurrencyIcon: {
        width: '20px',
        height: '20px'
    },
    TableHeaderBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
        gap: '10px'
    },
    BalanceGroup: {
        display: 'flex',
        gap: '5px',
        marginTop: '3px'
    },
    ModalBox: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px'
    },
    DetailItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
        padding: '8px',
        borderBottom: '1px solid #eee'
    }
}));

const headCells = [
    { value: 'user', label: 'User ID', ischeck: true },
    { value: 'amount', label: 'Amount', ischeck: true },
    { value: 'coinType', label: 'Coin Type', ischeck: true },

    { value: 'createdAt', label: 'Created At', ischeck: true },
    { value: 'action', label: 'Action', ischeck: true },
];

const EnhancedTableHead = (props) => {
    let { order, orderBy, onRequestSort } = props;
    const classes = useStyles();

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell, key) => (
                    <TableCell key={key} className={classes.TableHeaderCell}>
                        {
                            headCell.ischeck ?
                                <TableSortLabel
                                    active={orderBy === headCell.value}
                                    direction={orderBy === headCell.value ? order : 'asc'}
                                    onClick={() => onRequestSort(headCell.value)}
                                >
                                    {headCell.label}
                                </TableSortLabel>
                                :
                                <>{headCell.label}</>
                        }
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
};

const TransactionDetailModal = ({ open, handleClose, transaction, onProcessPayment }) => {
    const classes = useStyles();
    const { showLoading, hideLoading } = useContext(LoadingContext);

    const handleProcess = async () => {
        await onProcessPayment();

        // showLoading();
        // try {
        //     handleClose();
        // } finally {
        //     hideLoading();
        // }
    };

    const handleCancel = async () => {
        // await onProcessPayment();

        // showLoading();
        // try {
        //     handleClose();
        // } finally {
        //     hideLoading();
        // }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box className={classes.ModalBox}>
                <Typography variant="h6" gutterBottom>
                    Transaction Details
                </Typography>

                {transaction && (
                    <Stack spacing={2}>
                        <div className={classes.DetailItem}>
                            <Typography variant="subtitle1">User ID:</Typography>
                            <Typography variant="body1">{transaction.userId}</Typography>
                        </div>
                        <div className={classes.DetailItem}>
                            <Typography variant="subtitle1">Username:</Typography>
                            <Typography variant="body1">
                                {transaction.username}
                            </Typography>
                        </div>
                        <div className={classes.DetailItem}>
                            <Typography variant="subtitle1">Email:</Typography>
                            <Typography variant="body1">
                                {transaction.email}
                            </Typography>
                        </div>
                        <div className={classes.DetailItem}>
                            <Typography variant="subtitle1">Amount:</Typography>
                            <Typography variant="body1">
                                {transaction.amount} {transaction.currency?.coinType}
                            </Typography>
                        </div>

                        <div className={classes.DetailItem}>
                            <Typography variant="subtitle1">Destination Address:</Typography>
                            <Typography variant="body1" style={{ wordBreak: 'break-all' }}>
                                {transaction.to}
                            </Typography>
                        </div>
                        <div className={classes.DetailItem}>
                            <Typography variant="subtitle1">Date:</Typography>
                            <Typography variant="body1">
                                {new Date(transaction.createdAt).toLocaleString()}
                            </Typography>
                        </div>

                        <Stack direction="row"
                            spacing={2}
                            sx={{ mt: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleClose}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                Close
                            </Button>

                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleCancel}
                            >
                                Cancel Payment
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleProcess}

                            >
                                Process Payment
                            </Button>

                        </Stack>

                    </Stack>
                )}
            </Box>
        </Modal>
    );
};

const WalletManagement = () => {
    const classes = useStyles();
    const { showLoading, hideLoading } = useContext(LoadingContext);
    const dispatch = useDispatch();
    const { addToast } = useToasts();

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('createdAt');
    const [data, setData] = useState([]);
    const [coinType, setCoinType] = useState('All');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        init();
    }, [coinType]);

    const init = async () => {
        showLoading();
        try {
            const response = await getPendingWithdraws({ coinType: coinType === 'All' ? null : coinType });
            setData(response.data);
        } finally {
            hideLoading();
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleOpenDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
    };

    const handleProcessPayment = async () => {
        try {
            showLoading();

            if (!selectedTransaction) {
                throw new Error("No transaction selected");
            }

            const payload = {
                userId: selectedTransaction.userId,
                userEmail: selectedTransaction.email,
                coin: selectedTransaction.currency?.coinType,
                address: selectedTransaction.to,
                value: selectedTransaction.amount
            };

            const response = await sendCrypto(payload);

            console.log(`REPONSE = ${JSON.stringify(response)}`);

            if (response?.status) {

                // Notification de succès
                addToast(`Payment of ${selectedTransaction.amount} ${selectedTransaction.currency?.coinType} processed successfully`, {
                    appearance: 'success',
                    autoDismiss: true
                });

                addToast(`Admin: Please check BlockBee to confirm and credit ${selectedTransaction.amount} ${selectedTransaction.currency?.coinType}`, {
                    appearance: 'info',
                    autoDismiss: false,  // Reste affiché jusqu'à action manuelle
                    action: {
                        name: 'Go to BlockBee',
                        onClick: () => window.open('https://dash.blockbee.io/payouts/requests', '_blank')  // Ouvre BlockBee dans un nouvel onglet
                    }
                });
                // Fermer la modale et rafraîchir les données
                setModalOpen(false);
                init();
            } else {
                throw new Error(response?.message || "Payment processing failed");
            }
        } catch (error) {
            console.error("Payment error:", error);
            addToast(error.message || "Failed to process payment", {
                appearance: 'error',
                autoDismiss: true
            });
        } finally {
            hideLoading();
        }

    };

    return (
        <Box className={classes.PlayerContainer}>
            <Box className={classes.TableHeaderBox}>
                <Box className={classes.TableTitleBox}>
                    All Pending Requests List
                </Box>
                <Box>
                    <Select
                        value={coinType}
                        onChange={(e) => setCoinType(e.target.value)}
                        className={classes.CustomSelect}
                    >
                        <MenuItem value={'All'}>All</MenuItem>
                        {Object.keys(COINTYPES).map((key) => (
                            <MenuItem key={key} value={key} className={classes.CustomMenuItem}>
                                <img className={classes.CurrencyIcon}
                                    src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${key.toLowerCase()}.svg`}
                                    alt='icon' />
                                {key}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            <Box className={classes.TableMainBox}>
                <Table>
                    <EnhancedTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={index} className={classes.TableRow}>
                                <TableCell>{item.userId}</TableCell>
                                <TableCell>{item.amount}</TableCell>
                                <TableCell>{item.currency?.coinType}</TableCell>

                                <TableCell>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className={classes.ActionCell}>
                                    <IconButton
                                        onClick={() => handleOpenDetail(item)}
                                        className={classes.ActionButton}
                                    >
                                        <Visibility />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <TransactionDetailModal
                open={modalOpen}
                handleClose={() => setModalOpen(false)}
                transaction={selectedTransaction}
                onProcessPayment={handleProcessPayment}
            />
        </Box>
    );
};

export default WalletManagement;