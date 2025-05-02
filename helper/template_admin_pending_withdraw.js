const emailConfig = require('./email-config');

exports.templateAdminPendingWithdraw = ({ amount, address, coinType, userEmail, userId }) => {
  const coin = coinType.toUpperCase();
  const finalAmount = amount;
  const title = `New Withdrawal Request`;

  const requestDate = new Date().toLocaleString();

  const messageBody = `
    <p>Hello Admin,</p>
    <p>A new withdrawal request has been submitted by a user.</p>

    <p><strong>Request Details:</strong></p>
    <ul>
      <li><strong>User ID:</strong> ${userId}</li>
      <li><strong>User Email:</strong> ${userEmail}</li>
      <li><strong>Requested Amount:</strong> ${amount} ${coin}</li>
      <li><strong>Destination Address:</strong><br /><span style="word-break: break-all;">${address}</span></li>
      <li><strong>Request Date:</strong> ${requestDate}</li>
      <li><strong>Status:</strong> <span style="color: orange; font-weight: bold;">Pending</span></li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${emailConfig.websiteLink}/admin" style="
        background-color: #007BFF;
        color: #fff;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        display: inline-block;
      ">
        View in Admin Panel
      </a>
    </p>

    <p>Best regards,<br />The ${emailConfig.websiteName} System</p>
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
            font-size: 24px;
            color: #1a237e;
            margin: 0;
          }
          .content {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
          }
          ul {
            list-style-type: none;
            padding: 0;
            margin: 15px 0;
          }
          li {
            margin: 8px 0;
            background-color: #f8f9fa;
            padding: 8px;
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
