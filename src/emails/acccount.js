const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxd1ddb8fad74a4c4080f2f0861685f239.mailgun.org';
const mg = mailgun({apiKey: process.env.API_KEY, domain: DOMAIN});

const sendWelcomeEmail = (email, name) => {
    const data = {
        from: ' Task-App  o.moshud10@gmail.com',
        to: email,
        subject: 'Thanks for Joining',
        text: `Welcome to the app, ${name}. Let me know how you get along with the App.`
    }
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

const sendCanceleEmail = (email, name) => {
    const data = {
        from: ' Task-App  o.moshud10@gmail.com',
        to: email,
        subject: 'Good Bye',
        text: `Sad to see you leave, ${name}. Is there anything you would like to let us know about our service? `
    }
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCanceleEmail
}