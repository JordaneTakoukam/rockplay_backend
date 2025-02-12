
exports.templateSendTransaction = (type, amount, coinType) => {
  let title = '';
  let messageBody = '';

  switch (type) {
    case 'deposit':
      title = "Deposit Confirmed";
      messageBody = `We are pleased to inform you that your deposit of ${amount} ${coinType.toUpperCase()} has been successfully confirmed and credited to your account. Thank you for choosing our service!`;
      break;
    case 'withdrawal_pending':
      title = "Withdrawal Request Received";
      messageBody = `Your withdrawal request of ${amount} ${coinType.toUpperCase()} is currently pending review. Our team is processing your request and will notify you as soon as it is approved.`;
      break;
    case 'withdrawal_confirmed':
      title = "Withdrawal Confirmed";
      messageBody = `Your withdrawal of ${amount} ${coinType.toUpperCase()} has been successfully processed and confirmed. The funds have been transferred to your designated wallet address.`;
      break;
    default:
      title = "Transaction Update";
      messageBody = "There is an update regarding your transaction.";
  }

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .email-container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #333;
          }
          .content {
            font-size: 16px;
            color: #555;
            text-align: center;
            line-height: 1.5;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
            text-align: center;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          .footer a {
            color: #007BFF;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>Dear user,</p>
            <p>${messageBody}</p>
          </div>
         <div class="footer">
            <p>If you did not request this code, please ignore this email or contact our support team.</p>
            <p>Thank you for choosing <a href="https://minusplay.com">minusplay.com</a>!</p>
         </div>
       </div>
      </body>
      </html>
    `;
};
