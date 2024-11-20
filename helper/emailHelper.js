const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendMsg = async (to, subject, html) => {
    // Configure the Nodemailer transporter
    let transporter = nodemailer.createTransport({
        host: process.env.HOST, 
        port: 465, 
        secure: true, 
        auth: {
            user: process.env.EMAIL_PRO, 
            pass: process.env.PASSWORD, 
        },
    });

    // Email options
    const mailOptions = {
        from: `"Minusplay" <${process.env.NO_REPLY_SUB_EMAIL}>`,
        to: to,
        subject: subject,
        html: html,
    };
    

    try {
        const info = await transporter.sendMail(mailOptions);
        // console.log('Email successfully sent!', info);
        return { status: true };
    } catch (err) {
        console.error({ title: 'sendMsg => Error', message: err.message });
        return { status: false };
    }
};

// Function to generate the HTML content for an authentication email with a code
exports.authenticationEmail = (code) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Authentication Code - minusplay.com</title>
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
                .header img {
                    max-width: 150px;
                }
                .header h1 {
                    font-size: 24px;
                    color: #333;
                }
                .code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #007BFF;
                    text-align: center;
                    margin: 20px 0;
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
                    <h1>Your Authentication Code</h1>
                </div>
                <div class="content">
                    <p>Dear user,</p>
                    <p>Use the code below to complete your sign-in process on <strong>minusplay.com</strong>:</p>
                    <p class="code">${code}</p>
                    <p>This code is valid for the next 24 hours. Please do not share it with anyone.</p>
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

{/* <img src="https://api-root.minusplay.com/Logo.svg" alt="minusplay.com Logo" /> */}
