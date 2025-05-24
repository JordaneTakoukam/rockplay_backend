const emailConfig = require('./email-config');

exports.templateWelcomeNewUser = (data) => {
  const title = 'Welcome to ' + emailConfig.websiteName + '!';
  const messageBody = `
    <p>Hello ${data.username || 'dear player'},</p>
    <p>Welcome to <strong>${emailConfig.websiteName}</strong> — your new destination for fun, rewards, and real wins.</p>
    <p>Thousands of players are already hitting jackpots. Ready to join them?</p>
    <p><strong>🎁 Enjoy up to 300% bonus on your 1st deposit — no matter the amount!</strong></p>
    <p><strong>💰 Plus, get a 200% bonus on your 2nd deposit!</strong></p>
    <p>Log in now, grab your welcome bonus, and start playing!</p>
    <p><strong>Big wins happen here.</strong></p>
    <p>The <strong>${emailConfig.websiteName}</strong> Team</p>
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
          <p>Need help? Contact our 
            <a href="mailto:${emailConfig.contactEmail}" style="color: #007BFF; text-decoration: none;">support team</a>.
          </p>
          <p>© ${emailConfig.copyright} ${emailConfig.websiteName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
