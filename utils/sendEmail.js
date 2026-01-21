const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For development, you can use a service like Mailtrap or a mock transporter
    // If you have real SMTP credentials, add them to your .env file

    let transporter;

    if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Fallback for demo: Log to console
        console.log('--- MOCK EMAIL START ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('--- MOCK EMAIL END ---');

        // return a resolved promise to simulate success
        return Promise.resolve({ messageId: 'mock-id' });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Practice App'} <${process.env.FROM_EMAIL || 'no-reply@practice.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
