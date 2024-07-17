import nodemailer from 'nodemailer';

const {MAILGUN_USER, MAILGUN_PASS} = process.env;
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 2525,
  secure: false,
  auth: {
    user: MAILGUN_USER,
    pass: MAILGUN_PASS,
  },
});

const main = async (recipient, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `'"Maddison Foo Koch 👻" <Kamil Mrówka@ethereal.email>'`,
      to: recipient,
      subject,
      html,
    });

    return info;
  } catch (err) {
    throw err;
  }
};

export default main;

