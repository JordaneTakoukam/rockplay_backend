exports.templateSuccessCreateAddress = (address, coinType, minDeposit) => {
  // Titre en anglais indiquant la création réussie de l'adresse
  const title = `Adresse ${coinType.toUpperCase()} créée avec succès`;

  // Corps du message en anglais précisant l'adresse créée et le réseau utilisé
  const messageBody = `
    <p>Cher utilisateur,</p>
    <p>Votre nouvelle adresse de dépôt pour le <strong>${coinType.toUpperCase()}</strong> a été générée avec succès :</p>
    <p style="text-align: center; margin: 20px 0; font-size: 18px;">
      <strong style="word-break: break-all;">${address}</strong>
    </p>
    <p>Tout dépôt effectué sur cette adresse créditera automatiquement votre compte sous 3 confirmations réseau.</p>
    <p>⚠️ Restrictions de dépôt :</p>
    <ul>
      <li>Dépôt minimum : <strong>${minDeposit} ${coinType.toUpperCase()}</strong></li>
    </ul>
    <p style="color: #ff0000; font-weight: bold;">
      N'envoyez que des ${coinType.toUpperCase()} sur cette adresse !
    </p>
  `;

  // Retourne le template HTML complet en anglais, avec le même footer qu'auparavant
  return `
    <!DOCTYPE html>
    <html lang="fr">
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
            font-size: 26px;
            color: #1a237e;
            margin: 0;
          }
          .content {
            font-size: 16px;
            color: #444;
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
          .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
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
              <strong>Important :</strong> Vérifiez toujours l'adresse et le réseau avant d'effectuer un dépôt. 
              Les transactions envoyées sur une mauvaise adresse sont irrécupérables.
            </div>
          </div>
          <div class="footer">
            <p>Ce message a été généré automatiquement. Pour toute question, contactez le 
              <a href="mailto:support@rockplay.fun" style="color: #007BFF; text-decoration: none;">support technique</a>.
            </p>
            <p>© 2024 RockPlay. Tous droits réservés.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};