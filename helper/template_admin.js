const emailConfig = require('./email-config');

exports.templateAdminNotification = (type, data) => {
  // type : 'new_user'
  // data = {
  //   email: 'nouvel.utilisateur@example.com',
  //   date: '30/04/2025 10:25'
  // }

  // type : 'new_deposit'
  // data = {
  //   amount: 250,
  //   coinType: 'USDT',
  //   address: '0x123abc456def789...',
  //   status: 0, // 0 = confirmé, 1 = en attente
  //   date: '30/04/2025 11:12',
  //   email: 'user@example.com' // ajout de l'email de l'utilisateur
  // }

  // type : 'new_ask_withdraw'
  // data = {
  //   amount: 120,
  //   coinType: 'BTC',
  //   toAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080',
  //   date: '30/04/2025 14:40'
  // }

  let title = '';
  let messageBody = '';

  switch (type) {
    case 'new_user':
      title = 'New User Registered';
      messageBody = `
        <p>A new user has registered.</p>
        <ul>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Registration Date:</strong> ${data.date || 'Not specified'}</li>
        </ul>
      `;
      break;

    case 'new_deposit':
      title = data.status === 0
        ? `Deposit Confirmed: ${data.amount} ${data.coinType.toUpperCase()}`
        : `Deposit Pending: ${data.amount} ${data.coinType.toUpperCase()}`;

      messageBody = `
        <p>A user has made a deposit.</p>
        <ul>
          <li><strong>Amount:</strong> ${data.amount} ${data.coinType.toUpperCase()}</li>
          <li><strong>Source Address:</strong><br /><span style="word-break: break-all;">${data.address}</span></li>
          <li><strong>Status:</strong> ${data.status === 0 ? 'Confirmed' : 'Pending Confirmation'}</li>
          <li><strong>Date:</strong> ${data.date || 'Not specified'}</li>
          <li><strong>User Email:</strong> ${data.email}</li> <!-- Email ajouté ici -->
        </ul>
      `;
      break;

    case 'new_ask_withdraw':
      title = 'New Withdrawal Request';

      messageBody = `
        <p>A user has requested a withdrawal.</p>
        <ul>
          <li><strong>Amount:</strong> ${data.amount} ${data.coinType.toUpperCase()}</li>
          <li><strong>Destination Address:</strong><br /><span style="word-break: break-all;">${data.toAddress}</span></li>
          <li><strong>Date:</strong> ${data.date || 'Not specified'}</li>
        </ul>
      `;
      break;

    default:
      title = 'Admin Notification';
      messageBody = '<p>An unidentified event has been triggered.</p>';
  }

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
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
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
          font-size: 22px;
          color: #1a237e;
          margin: 0;
        }
        .content {
          font-size: 16px;
          color: #333;
          line-height: 1.6;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #666;
          text-align: center;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        ul {
          list-style-type: none;
          padding: 0;
          margin: 15px 0;
        }
        li {
          margin: 8px 0;
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
        </div>
        <div class="footer">
          <p>This message is intended for the RockPlay administrator.<br />
          Please take appropriate action if necessary.</p>
         <p>Ce message a été généré automatiquement. Pour toute question, contactez le 
              <a href="mailto:${emailConfig.contactEmail}" style="color: #007BFF; text-decoration: none;">support technique</a>.
            </p>
            <p>© ${emailConfig.copyright} ${emailConfig.websiteName}. Tous droits réservés.</p>        </div>
      </div>
    </body>
    </html>
  `;
};
