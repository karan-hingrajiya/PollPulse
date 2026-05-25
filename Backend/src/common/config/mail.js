import nodemailer from "nodemailer";
import ApiError from "../utils/api-error.js";

let devTransporter;
let gmailTransporter;
let brevoTransporter;

const appName = process.env.APP_NAME || "PollPulse";

const getAppUrl = () => {
  return process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
};

const getFrontendUrl = () => {
  // Prefer explicit frontend URL if provided (better UX: sends user to app pages)
  return process.env.CLIENT_URL || getAppUrl();
};

// const getClientUrl = () => {
//     return process.env.CLIENT_URL || process.env.FRONTEND_URL || getAppUrl();
// };//it will be useful when i am creating full service with frontend integrated

const createLink = (baseUrl, path) => {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

const createHtmlLayout = ({
  title,
  message,
  buttonText,
  buttonUrl,
  footerText,
}) => {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f5f7fb; font-family:Arial, Helvetica, sans-serif; color:#222;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f7fb; padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px; background-color:#ffffff; border:1px solid #e5e7eb; border-radius:8px;">
            <tr>
              <td style="padding:22px 28px; border-bottom:1px solid #e5e7eb;">
                <h2 style="margin:0; font-size:20px; color:#111827;">${appName}</h2>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 16px; font-size:24px; line-height:1.3; color:#111827;">${title}</h1>

                <div style="font-size:16px; line-height:1.6; color:#374151;">
                  ${message}
                </div>

                <div style="margin:28px 0;">
                  <a href="${buttonUrl}" style="display:inline-block; background-color:#2563eb; color:#ffffff; padding:12px 18px; border-radius:6px; text-decoration:none; font-size:15px; font-weight:bold;">
                    ${buttonText}
                  </a>
                </div>

                <p style="margin:0 0 8px; font-size:14px; line-height:1.5; color:#6b7280;">
                  If the button does not work, copy and paste this link into your browser:
                </p>

                <p style="margin:0; font-size:14px; line-height:1.5; word-break:break-all;">
                  <a href="${buttonUrl}" style="color:#2563eb;">${buttonUrl}</a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px; background-color:#f9fafb; border-top:1px solid #e5e7eb; border-radius:0 0 8px 8px;">
                <p style="margin:0; font-size:13px; line-height:1.5; color:#6b7280;">
                  ${footerText}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const createVerificationEmail = (token) => {
  // Build a frontend verification link when possible so users see a friendly UI
  const frontend = getFrontendUrl();
  const verificationUrl = createLink(frontend, `/verify-email/${token}`);

  return {
    subject: `Verify your ${appName} email`,
    html: createHtmlLayout({
      title: "Verify your email",
      message: `
            <p style="margin:0 0 12px;">Hello,</p>
            <p style="margin:0;">Thanks for creating an account with ${appName}. Please verify your email address to activate your account.</p>
            `,
      buttonText: "Verify Email",
      buttonUrl: verificationUrl,
      footerText: `If you did not create an account with ${appName}, you can ignore this email.`,
    }),
    text: `
Verify your ${appName} email

Thanks for creating an account with ${appName}.
Please verify your email address using this link:

${verificationUrl}

If you did not create this account, you can ignore this email.
        `.trim(),
  };
};

const createResetPasswordEmail = (token) => {
  const frontend = getFrontendUrl();
  const resetUrl = createLink(frontend, `/reset-password/${token}`);

  return {
    subject: `Reset your ${appName} password`,
    html: createHtmlLayout({
      title: "Reset your password",
      message: `
            <p style="margin:0 0 12px;">Hello,</p>
            <p style="margin:0;">We received a request to reset your password. Click the button below to create a new password.</p>
            <p style="margin:12px 0 0;">This link will expire in 15 minutes.</p>
            `,
      buttonText: "Reset Password",
      buttonUrl: resetUrl,
      footerText:
        "If you did not request a password reset, you can ignore this email.",
    }),
    text: `
Reset your ${appName} password

We received a request to reset your password.
Use this link to create a new password:

${resetUrl}

This link will expire in 15 minutes.
If you did not request a password reset, you can ignore this email.
        `.trim(),
  };
};

const getDevTransporter = () => {
  if (!devTransporter) {
    devTransporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });
  }
  return devTransporter;
};

const getGmailTransporter = () => {
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      host: process.env.GMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.GMAIL_PORT || 465),
      secure: Number(process.env.GMAIL_PORT || 465) === 465,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }
  return gmailTransporter;
};

const getBrevoTransporter = () => {
  if (!brevoTransporter) {
    brevoTransporter = nodemailer.createTransport({
      host: process.env.BREVO_HOST || "smtp-relay.brevo.com",
      port: Number(process.env.BREVO_PORT || 587),
      secure: Number(process.env.BREVO_PORT) === 465,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASSWORD,
      },
    });
  }
  return brevoTransporter;
};

const verifyTransporter = async () => {
  if (process.env.NODE_ENV === "development") {
    try {
      await getDevTransporter().verify();
      console.log("Mailtrap is ready");
    } catch (error) {
      throw ApiError.badRequest(
        `Mailtrap verification failed: ${error.message}`,
      );
    }
    return;
  }

  let isReady = false;
  if (process.env.GMAIL_USER) {
    try {
      await getGmailTransporter().verify();
      console.log("Gmail SMTP is ready");
      isReady = true;
    } catch (error) {
      console.warn(`Gmail verification failed: ${error.message}`);
    }
  }

  if (!isReady && process.env.BREVO_USER) {
    try {
      await getBrevoTransporter().verify();
      console.log("Brevo SMTP is ready");
      isReady = true;
    } catch (error) {
      console.warn(`Brevo verification failed: ${error.message}`);
    }
  }

  if (!isReady && process.env.BREVO_API_KEY) {
    console.log(
      "SMTP transporters failed, but Brevo API key is present. Ready to fallback to HTTP API.",
    );
    isReady = true;
  }

  if (!isReady) {
    throw ApiError.badRequest(
      "All production email methods failed verification.",
    );
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  const fromName = appName;

  // 1. Development: Mailtrap
  if (process.env.NODE_ENV === "development") {
    const from = process.env.MAIL_FROM || process.env.MAILTRAP_USER;
    const info = await getDevTransporter().sendMail({
      from: `"${fromName}" <${from}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`Email sent via Mailtrap to ${info.messageId}`);
    return;
  }

  let lastError;

  // 2. Production: Try Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
    try {
      const from = process.env.MAIL_FROM || process.env.GMAIL_USER;
      const info = await getGmailTransporter().sendMail({
        from: `"${fromName}" <${from}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`Email sent via Gmail to ${info.messageId}`);
      return;
    } catch (error) {
      console.warn(`Gmail SMTP failed: ${error.message}. Falling back...`);
      lastError = error;
    }
  }

  // 3. Production: Try Brevo SMTP
  if (process.env.BREVO_USER && process.env.BREVO_PASSWORD) {
    try {
      const from = process.env.MAIL_FROM || process.env.BREVO_USER;
      const info = await getBrevoTransporter().sendMail({
        from: `"${fromName}" <${from}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`Email sent via Brevo SMTP to ${info.messageId}`);
      return;
    } catch (error) {
      console.warn(
        `Brevo SMTP failed: ${error.message}. Falling back to API...`,
      );
      lastError = error;
    }
  }

  // 4. Production: Brevo HTTP API (Bypasses Render SMTP port blocks!)
  if (process.env.BREVO_API_KEY) {
    try {
      console.log("Attempting to send email via Brevo HTTP API...");
      const from =
        process.env.MAIL_FROM ||
        process.env.BREVO_USER ||
        "noreply@pollpulse.com";
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: fromName, email: from },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo API Error: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Email sent via Brevo API to ${data.messageId}`);
      return;
    } catch (error) {
      console.error(`Brevo HTTP API failed: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error("All configured email delivery methods failed.");
};

const verificationEmail = async (userMail, token) => {
  const email = createVerificationEmail(token);

  await sendEmail({
    to: userMail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
};

const resetPasswordEmail = async (userMail, token) => {
  const email = createResetPasswordEmail(token);

  await sendEmail({
    to: userMail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
};

export { verifyTransporter, sendEmail, verificationEmail, resetPasswordEmail };
