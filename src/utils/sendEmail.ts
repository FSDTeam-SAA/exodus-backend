import nodemailer from 'nodemailer';
export const sendEmail = async (to: string,subject:string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
      user: 'snm.bdcalling@gmail.com',
      pass: 'rvkd lcjc gebc blvx',
    },
  });
  await transporter.sendMail({
    from: 'nm.bdcalling@gmail.com', // sender address
    to,
    subject: subject? subject:  'Password change Link : change it by 10 minutes',
    html,
  });
};
