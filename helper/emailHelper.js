// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.sendMsg = async (to, subject, html) => {
//     try {
//         const msg = {
//             to: to,
//             from: 'no-reply@playzelo.com',

//             user: "suport.resetpass@gmail.com",
//             pass: "nyxsjvahaavoilbg",

//             subject: subject,
//             html: html
//         };
//         const response = await sgMail.send(msg);
//         console.log('Email Successfully Sent!');
//         return { status: true };
//     }
//     catch (err) {
//         console.error({ title: 'emailHelper => sendMsg', message: err.message });
//         return { status: false };
//     }
// };

// exports.authenticationEmail = (code) => {
//     return `<b>${code}</b>`;
// }









const nodemailer = require('nodemailer');

exports.sendMsg = async (to, subject, html) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "suport.resetpass@gmail.com", // Assurez-vous de stocker cela de manière sécurisée
            pass: "nyxsjvahaavoilbg", // Utilisez des variables d'environnement pour les informations sensibles
        },
    });

    const mailOptions = {
        from: '"Support ResetPass" <suport.resetpass@gmail.com>', // L'expéditeur
        to: to, // Destinataire
        subject: subject, // Sujet de l'e-mail
        html: html, // Contenu HTML de l'e-mail
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email Successfully Sent!', info);
        return { status: true };
    } catch (err) {
        console.error({ title: 'sendMsg => Error', message: err.message });
        return { status: false };
    }
};

// Fonction pour générer le contenu HTML d'un email d'authentification avec un code
exports.authenticationEmail = (code) => {
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code d'authentification</title>
            <style>
                /* Ajoutez des styles pour l'e-mail si nécessaire */
            </style>
        </head>
        <body>
            <p>Votre code d'authentification est :</p>
            <b style="font-size: 24px;">${code}</b>
        </body>
        </html>
    `;
}
