const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email SMTP configuration is missing');
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: email,
    subject: 'Verify your School Management System account',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
  });
};

module.exports = sendVerificationEmail;
