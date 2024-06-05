const nodemailer = require("nodemailer");
require('dotenv').config(); // Load environment variables from .env file

const sendMail = async (messageOption) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587, // Use port 587 for secure communication
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: messageOption.email,
      subject: messageOption.subject,
      text: messageOption.message,
    };

    // Send the email and wait for the result
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = sendMail;
