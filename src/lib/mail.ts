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

export const DEFAULT_TUCXA_OPERATIONS_EMAIL = "tucxacentro@gmail.com";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function addEmail(set: Set<string>, value?: string | null) {
  const email = value?.trim();
  if (email && email.includes("@")) set.add(email);
}

export function getTucxaOperationsEmail() {
  return process.env.TUCXA_OPERATIONS_EMAIL || process.env.TUCXA_CENTRO_EMAIL || DEFAULT_TUCXA_OPERATIONS_EMAIL;
}

export function getEventAdminRecipients(includesBingo: boolean) {
  const recipients = new Set<string>();

  addEmail(recipients, getTucxaOperationsEmail());
  addEmail(recipients, process.env.TUCXA_ADMIN_EMAIL ?? "tucxa@gmail.com");

  if (includesBingo) {
    addEmail(recipients, process.env.BINGO_ADMIN_EMAIL ?? "bazardosementinha@gmail.com");
  }

  return Array.from(recipients);
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
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
