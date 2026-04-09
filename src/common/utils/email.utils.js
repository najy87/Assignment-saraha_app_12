import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html } = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "najy10710@gmail.com",
      pass: "lhee iwnz qtyj zbjt",
    },
  });
  await transporter.sendMail({
    from: '"saraha_app_najy"<najy10710@gmail.com>',
    to,
    subject,
    html,
  });
};
