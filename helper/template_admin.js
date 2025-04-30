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
    //   date: '30/04/2025 11:12'
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
            title = 'Nouvel utilisateur inscrit';
            messageBody = `
          <p>Un nouvel utilisateur vient de s'inscrire.</p>
          <ul>
            <li><strong>Email :</strong> ${data.email}</li>
            <li><strong>Date d'inscription :</strong> ${data.date || 'Non spécifiée'}</li>
          </ul>
        `;
            break;

        case 'new_deposit':
            title = data.status === 0
                ? `Dépôt confirmé : ${data.amount} ${data.coinType.toUpperCase()}`
                : `Dépôt en attente : ${data.amount} ${data.coinType.toUpperCase()}`;

            messageBody = `
          <p>Un utilisateur a effectué un dépôt.</p>
          <ul>
            <li><strong>Montant :</strong> ${data.amount} ${data.coinType.toUpperCase()}</li>
            <li><strong>Adresse source :</strong><br /><span style="word-break: break-all;">${data.address}</span></li>
            <li><strong>Statut :</strong> ${data.status === 0 ? 'Confirmé' : 'En attente de confirmation'}</li>
            <li><strong>Date :</strong> ${data.date || 'Non spécifiée'}</li>
          </ul>
        `;
            break;

        case 'new_ask_withdraw':
            title = 'Nouvelle demande de retrait';

            messageBody = `
          <p>Un utilisateur a demandé un retrait.</p>
          <ul>
            <li><strong>Montant :</strong> ${data.amount} ${data.coinType.toUpperCase()}</li>
            <li><strong>Adresse de destination :</strong><br /><span style="word-break: break-all;">${data.toAddress}</span></li>
            <li><strong>Date :</strong> ${data.date || 'Non spécifiée'}</li>
          </ul>
        `;
            break;

        default:
            title = 'Notification administrative';
            messageBody = '<p>Un événement non identifié a été déclenché.</p>';
    }

    return `
      <!DOCTYPE html>
      <html lang="fr">
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
            <p>Ce message est destiné à l'administrateur de RockPlay.<br />
            Merci de prendre les mesures appropriées si nécessaire.</p>
            <p>© 2024 RockPlay. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;
};
