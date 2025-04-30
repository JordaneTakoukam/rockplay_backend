const emailConfig = require('./email-config');

exports.templateSuccessCreateAddress = (address, coinType, minDeposit) => {
  const coin = coinType.toUpperCase();
  const title = `${coin} Deposit Address Successfully Created`;

  const messageBody = `
    <p>Dear user,</p>
    <p>Your new deposit address for <strong>${coin}</strong> has been successfully generated:</p>
    <p style="text-align: center; margin: 20px 0; font-size: 18px;">
      <strong style="word-break: break-all;">${address}</strong>
    </p>
    <p>Any deposit sent to this address will be credited to your account after 3 network confirmations.</p>
    <p><strong>⚠️ Deposit Restrictions:</strong></p>
    <ul>
      <li>Minimum deposit: <strong>${minDeposit} ${coin}</strong></li>
    </ul>
    <p style="color: #ff0000; font-weight: bold;">
      Send only ${coin} to this address!
    </p>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          max-width: 650px;
          width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #007BFF;
          padding-bottom: 15px;
        }
        .header h1 {
          font-size: 24px;
          color: #1a237e;
          margin: 0;
        }
        .content {
          font-size: 16px;
          color: #444;
          line-height: 1.6;
        }
        ul {
          list-style-type: none;
          padding: 0;
          margin: 15px 0;
        }
        li {
          margin: 10px 0;
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        .warning-box {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 15px;
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
          ${messageBody}
          <div class="warning-box">
            <strong>Important:</strong> Always double-check the address and network before making a deposit. 
            Transactions sent to an incorrect address are irreversible.
          </div>
        </div>
        <div class="footer">
          <p>This message was generated automatically. If you have any questions, contact our 
            <a href="mailto:${emailConfig.contactEmail}">support team</a>.
          </p>
          <p>© ${emailConfig.copyright} ${emailConfig.websiteName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
