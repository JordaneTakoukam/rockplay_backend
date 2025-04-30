exports.templateMailDepositStatus = (amount, address, coinType, status) => {
    const statusText = status === 0
      ? `<span style="color:green; font-weight:bold;">confirmé</span>`
      : `<span style="color:#e69500; font-weight:bold;">en cours de validation</span>`;
  
    const title = `Notification de dépôt - ${coinType.toUpperCase()}`;
  
    const messageBody = `
      <p>Bonjour,</p>
      <p>Nous vous informons que nous avons détecté un dépôt effectué vers l'une de vos adresses de portefeuille.</p>
  
      <p><strong>Détails de la transaction :</strong></p>
      <ul>
        <li><strong>Montant :</strong> ${amount} ${coinType.toUpperCase()}</li>
        <li><strong>Adresse source :</strong><br /><span style="word-break: break-all;">${address}</span></li>
        <li><strong>Statut :</strong> ${statusText}</li>
      </ul>
  
      <p>
        ${
          status === 0
            ? 'Ce dépôt a été confirmé avec succès et le montant a été crédité sur votre compte.'
            : 'Votre dépôt est en attente de confirmation. Le montant sera crédité dès réception des confirmations réseau nécessaires.'
        }
      </p>
  
      <p>
        Pour toute question relative à cette opération, n'hésitez pas à contacter notre service d’assistance.
      </p>
  
      <p>Cordialement,<br>L’équipe RockPlay</p>
    `;
  
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
              font-size: 24px;
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
              <p>
                Ce message a été généré automatiquement. Si vous avez besoin d’assistance, veuillez contacter le 
                <a href="mailto:support@rockplay.fun" style="color: #007BFF; text-decoration: none;">support technique</a>.
              </p>
              <p>© 2024 RockPlay. Tous droits réservés.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  