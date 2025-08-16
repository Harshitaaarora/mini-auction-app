import sg from "@sendgrid/mail";

const haveSG = !!process.env.SENDGRID_API_KEY;
if (haveSG) sg.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMail({ to, subject, html }) {
  if (!haveSG) {
    console.log("[DEV MAIL]", { to, subject, html });
    return;
  }
  await sg.send({ to, from: process.env.MAIL_FROM, subject, html });
}
