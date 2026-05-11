type MailInput = {
  to: Array<string | null | undefined>;
  subject: string;
  html: string;
  text?: string;
};

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER;
const EMAIL_NOTIFICATIONS_ENABLED = process.env.EMAIL_NOTIFICATIONS_ENABLED === "true";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getEventAdminRecipients(includesBingo: boolean) {
  const recipients = new Set<string>();

  recipients.add(process.env.TUCXA_ADMIN_EMAIL ?? "tucxa@gmail.com");

  if (includesBingo) {
    recipients.add(process.env.BINGO_ADMIN_EMAIL ?? "bazardosementinha@gmail.com");
  }

  return Array.from(recipients).filter(Boolean);
}

export async function sendMail(input: MailInput) {
  const recipients = input.to.filter((recipient): recipient is string => Boolean(recipient && recipient.includes("@")));

  if (recipients.length === 0) {
    console.info("E-mail não enviado: nenhum destinatário válido.", { subject: input.subject });
    return { sent: false, reason: "no_valid_recipients" };
  }

  if (!EMAIL_NOTIFICATIONS_ENABLED) {
    console.info("E-mail não enviado: EMAIL_NOTIFICATIONS_ENABLED não está true.", {
      to: recipients,
      subject: input.subject,
    });
    return { sent: false, reason: "disabled" };
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    console.warn("E-mail não enviado: variáveis SMTP incompletas.", {
      hasHost: Boolean(SMTP_HOST),
      hasUser: Boolean(SMTP_USER),
      hasPass: Boolean(SMTP_PASS),
      hasFrom: Boolean(SMTP_FROM),
    });
    return { sent: false, reason: "missing_smtp_config" };
  }

  // Importação dinâmica para manter o build funcionando mesmo antes de instalar o nodemailer.
  // Rode: npm install nodemailer && npm install -D @types/nodemailer
  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: recipients.join(", "),
    subject: input.subject,
    html: input.html,
    text: input.text ?? stripHtml(input.html),
  });

  return { sent: true };
}
