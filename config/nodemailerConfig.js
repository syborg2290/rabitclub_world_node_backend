"use strict";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const NODEMAINLERUSERNAME = process.env.NODEMAINLER_USERNAME;
const NODEMAILERPASSWORD = process.env.NODEMAILER_PASSWORD;

const SendEmail = async (to, subject, html) => {
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAINLERUSERNAME,
        pass: NODEMAILERPASSWORD,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: NODEMAINLERUSERNAME, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    throw new Error(error);
  }
};

export default SendEmail;
