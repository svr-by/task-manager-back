import { createTransport } from 'nodemailer';
import config from '@/common/config';
import { logger } from '@/middlewares/logEvents';

const { EMAIL_HOST, EMAIL_PORT, AUTH_EMAIL_USERNAME, AUTH_EMAIL_PASSWORD, EMAIL_FROM } = config;

interface ISendEmail {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ISendConfirmationEmail {
  email: string;
  confUrl: string;
}

export const sendEmail = async ({ email, subject, text, html }: ISendEmail) => {
  const transporter = createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
      user: AUTH_EMAIL_USERNAME,
      pass: AUTH_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL_FROM,
    to: email,
    subject,
    text,
    html,
  };

  try {
    return transporter.sendMail(mailOptions);
  } catch (err) {
    logger.error(err);
    return;
  }
};

export const sendConfirmationEmail = async ({ email, confUrl }: ISendConfirmationEmail) => {
  const subject = 'Подтверждение email';

  const content = `
  <html>
    <h2>Благодарим вас за регистрацию на нашем сайте!</h2>
    <p>
      Для завершения процесса регистрации и подтверждения вашего email, пожалуйста, перейдите по следующей ссылке:
    </p>
    <p>
      <a href=${confUrl} clicktracking=off>${confUrl}</a>
    </p>
    <p>
      <em>
        Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
      </em>
    </p>
  </html>
  `;

  return sendEmail({ email, subject, html: content });
};
