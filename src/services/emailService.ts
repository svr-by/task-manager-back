import { createTransport } from 'nodemailer';
import { logger } from '@/middlewares/logEvents';
import config from '@/common/config';

const {
  EMAIL_HOST,
  EMAIL_PORT,
  AUTH_EMAIL_USERNAME,
  AUTH_EMAIL_PASSWORD,
  EMAIL_FROM,
  JWT_INVITE_EXPIRE_TIME,
} = config;

interface ISendEmail {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ISendConfEmail {
  email: string;
  confUrl: string;
}

interface ISendInvEmail {
  email: string;
  invUrl: string;
  title: string;
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
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    logger.error(err);
    return;
  }
};

export const sendConfEmail = async ({ email, confUrl }: ISendConfEmail) => {
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

export const sendInvMemberEmail = async ({ email, invUrl, title }: ISendInvEmail) => {
  const subject = `Приглашение в проект "${title}"`;
  const content = `
    <html>
      <h2>Вас приглашают присоеденится к проекту!</h2>
      <p>Вы получили это письмо потому, что руководитель проекта <strong>"${title}"</strong> приглашает Вас стать частью команды.<br/>
        Пожалуйста, перейдите по следующей ссылке, чтобы присоеденится к проекту.
      </p>
      <p>
        <a href=${invUrl} clicktracking=off>${invUrl}</a>
      </p>
      <p>
        <em>
          Если вы не запрашивали этого или отказываетесь присоедениться к проекту, можете просто проигнорировать это письмо.
        </em>
      </p>
      <p>
      <small>
        <em>
          Срок действия этой ссылки <strong>истекает через ${JWT_INVITE_EXPIRE_TIME / 60 / 60} часа</strong> с момента получения данного письма.
        </em>
      <small/>
      </p>
    </html>
    `;
  return sendEmail({ email, subject, html: content });
};

export const sendInvOwnerEmail = async ({ email, invUrl, title }: ISendInvEmail) => {
  const subject = `Приглашение возглавить проект "${title}"`;
  const content = `
  <html>
    <h2>Вас приглашают стать руководителем проекта!</h2>
    <p>Вы получили это письмо потому, что руководитель проекта <strong>"${title}"</strong> предлагает Вам принять управление на себя.<br/>
      Пожалуйста, перейдите по следующей ссылке, чтобы возглавить проект.
    </p>
    <p>
      <a href=${invUrl} clicktracking=off>${invUrl}</a>
    </p>
    <p>
      <em>
        Если Вы отказываетесь от предложения, можете просто проигнорировать это письмо.
      </em>
    </p>
    <p>
    <small>
      <em>
        Срок действия этой ссылки <strong>истекает через ${JWT_INVITE_EXPIRE_TIME / 60 / 60} часа</strong> с момента получения данного письма.
      </em>
    <small/>
    </p>
  </html>
  `;
  return sendEmail({ email, subject, html: content });
};
