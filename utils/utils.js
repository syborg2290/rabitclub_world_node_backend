import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SendEmail from "../config/nodemailerConfig.js";
import EmailTemplateForEmailVerification from "./email_templates/verification_code.js";

//Utility functions
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload) => {
  return await jwt.sign(payload, process.env.APP_SECRET, { expiresIn: "30d" });
};

export const GetIdFromSignature = async (token) => {
  return await jwt.decode(token, process.env.APP_SECRET);
};

export const ValidateSignature = async (req) => {
  const signature = req.cookies.token;

  if (signature) {
    const payload = await jwt.verify(signature, process.env.APP_SECRET);
    if (Date.now() >= payload.exp * 1000) {
      return false;
    }
    return true;
  }

  return false;
};

export const FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

export const SendVerificationCodeToEmail = async (code, to) => {
  try {
    await SendEmail(
      to,
      "Verify your email",
      EmailTemplateForEmailVerification(code)
    );
  } catch (error) {
    throw new Error(error);
  }
};
