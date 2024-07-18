import nodemailer from "nodemailer";

const { M_USER, M_PASS } = process.env;

const transporter = nodemailer.createTransport({
    host: "smtp.mailgun.org",
    port: 587,
    secure: false,
    auth: {
        user: M_USER,
        pass: M_PASS,
    },
});

const main = async (html, subject, to) => {
    const info = await transporter.sendMail({
        from: '"Maddison Foo Koch 👻" <contactcompany@gmail.com>',
        to,
        subject,
        html,
    });

}

export default main;