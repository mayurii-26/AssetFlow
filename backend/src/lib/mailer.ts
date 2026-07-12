import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false, // true for port 465, false for 587 / 1025
  auth:
    process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
});

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "AssetFlow <noreply@assetflow.com>",
    to,
    subject: "Reset your AssetFlow password",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#131313;font-family:Inter,system-ui,sans-serif;color:#e5e2e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
          style="background:#1c1b1b;border:1px solid rgba(255,255,255,0.1);border-radius:24px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:36px;height:36px;background:rgba(0,240,255,0.15);border:1px solid rgba(0,240,255,0.25);border-radius:10px;text-align:center;vertical-align:middle;">
                    <span style="color:#00f0ff;font-size:18px;font-weight:900;">⚡</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">AssetFlow</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">Hi ${name},</p>
              <p style="margin:0 0 24px;font-size:14px;color:#8e9192;line-height:1.6;">
                We received a request to reset the password for your AssetFlow account.
                Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#00f0ff;border-radius:12px;">
                    <a href="${resetUrl}"
                      style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#000000;text-decoration:none;letter-spacing:-0.2px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 8px;font-size:12px;color:#8e9192;">
                If the button doesn&apos;t work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#00f0ff;word-break:break-all;">
                ${resetUrl}
              </p>

              <!-- Warning -->
              <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
                <p style="margin:0;font-size:12px;color:#8e9192;line-height:1.6;">
                  ⏱ This link expires in <strong style="color:#e5e2e1;">1 hour</strong>.<br/>
                  🔒 If you didn&apos;t request this, you can safely ignore this email — your password won&apos;t change.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.08);">
              <p style="margin:0;font-size:12px;color:#444748;text-align:center;">
                © ${new Date().getFullYear()} AssetFlow · Cinematic Asset Intelligence
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${name},\n\nReset your AssetFlow password here:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.\n\n— AssetFlow`,
  });
}
