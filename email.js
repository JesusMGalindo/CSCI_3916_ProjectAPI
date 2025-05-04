const sgMail = require('@sendgrid/mail');
const FROM = process.env.MAIL_FROM;

if (process.env.SENDGRID_API_KEY) sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, subject, text) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[email->${to}] ${subject}\n${text}`);
    return;
  }
  await sgMail.send({ to, from: FROM, subject, text });
};