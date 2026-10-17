import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    const error = new Error("GMAIL_USER and GMAIL_APP_PASSWORD are required");
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD.replace(/\s/g, ""),
    },
  });

  await transporter.sendMail({
    from: { name: "TravelNetWorth", address: GMAIL_USER },
    to,
    subject,
    html,
  });
};
