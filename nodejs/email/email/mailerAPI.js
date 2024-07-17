import nodemailer from 'nodemailer';
import mt from 'nodemailer-mailgun-transport';

const {MAILGUN_API_KEY, MAILGUN_DOMAIN} = process.env;
const auth = {
  auth: {
    api_key: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN,
  },
};
const transporter = nodemailer.createTransport(mt(auth));

// async..await is not allowed in global scope, must use a wrapper
async function main(sender, recipient, subject, html) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: sender,
    to: recipient,
    subject,
    html,
  });
  console.log(info);

  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}
