const nodemailer = require('nodemailer');
const emailConfig = require('./email-config');
require('dotenv').config();

exports.sendMsg = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"${emailConfig.websiteName}" <${process.env.NO_REPLY_SUB_EMAIL}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { status: true };
  } catch (err) {
    console.error({ title: 'sendMsg => Error', message: err.message });
    return { status: false };
  }
};

exports.authenticationEmail = (code) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authentication Code - ${emailConfig.websiteName}</title>
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
          text-align: center;
          line-height: 1.6;
        }
        .code {
          font-size: 32px;
          font-weight: bold;
          color: #007BFF;
          margin: 20px 0;
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
          <h1>Your Authentication Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Use the code below to complete your sign-in process on <strong>${emailConfig.websiteName}</strong>:</p>
          <p class="code">${code}</p>
          <p>This code is valid for 24 hours. Please do not share it with anyone.</p>
        </div>
        <div class="footer">
          <p>If you did not request this code, you can safely ignore this message or contact our <a href="mailto:${emailConfig.contactEmail}">support team</a>.</p>
          <p>Thank you for using <a href="${emailConfig.websiteUrl}">${emailConfig.websiteName}</a>.</p>
          <p>© ${emailConfig.copyright} ${emailConfig.websiteName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
