const emailConfig = require("./email-config");


exports.templateMailBonusCredit = ({ montantDeposer, montantBonus, coinType, numeroDepot }) => {
  const coin = coinType.toUpperCase();
  const formattedBonus = montantBonus.toFixed(8);
  const formattedDeposit = montantDeposer.toFixed(8);

  const title = `🎉 Deposit Bonus #${numeroDepot} Credited !`;

  const messageBody = `
    <p>Hello,</p>

    <p>Following your <strong>${numeroDepot === 1 ? 'first' : numeroDepot + 'ᵗʰ'}</strong> deposit of <strong>${formattedDeposit} ${coin}</strong>, your bonus has been successfully credited to your main balance and is <strong>valid for 24 hours</strong>.</p>

    <h2 style="color:#2ecc71; margin-top: 20px;">+ ${formattedBonus} ${coin}</h2>

    <p>Make sure to wager this bonus amount within the next 24 hours to take full advantage of it. Unused bonuses will expire automatically.</p>

    <p>Start betting now to maximize your earnings on our platform.</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${emailConfig.websiteLink}" style="
        background-color: #28a745;
        color: #fff;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        display: inline-block;
      ">
        Access My Account and Bet Now
      </a>
    </p>

    <p>If you have any questions, feel free to contact our support team.</p>
    <p>Best regards,<br />The ${emailConfig.websiteName} Team</p>
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
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
            max-width: 650px;
            width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #28a745;
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
          h2 {
            font-size: 28px;
            color: #2ecc71;
            text-align: center;
            margin: 25px 0;
          }
          a {
            transition: background-color 0.3s ease;
          }
          a:hover {
            background-color: #218838 !important;
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
            color: #28a745;
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
          </div>
          <div class="footer">
            <p>
              This is an automated message. If you need assistance, please contact our 
              <a href="mailto:${emailConfig.contactEmail}">support team</a>.
            </p>
            <p>© ${emailConfig.copyright} ${emailConfig.websiteName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
