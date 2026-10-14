const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        try {
            transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: Number(SMTP_PORT) || 587,
                secure: SMTP_SECURE === true || SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASS
                }
            });
            return transporter;
        } catch (err) {
            console.error('Ошибка инициализации SMTP транспортера:', err.message);
            return null;
        }
    }
    return null;
}

/**
 * Sends a verification code to the specified email address.
 * Logs the code to console for development visibility.
 */
async function sendVerificationCode(email, name, code) {
    const transport = getTransporter();

    console.log('\n============================================================');
    console.log('📩 [MAPNEWS EMAIL VERIFICATION]');
    console.log(`👤 Получатель: ${name} <${email}>`);
    console.log(`🔑 Код подтверждения: [ ${code} ]`);
    console.log(`⏳ Срок действия: 15 минут`);
    console.log('============================================================\n');

    if (!transport) {
        return {
            delivered: false,
            logged: true,
            message: 'Код сгенерирован и зафиксирован в консоли сервера (SMTP не настроен)'
        };
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Montserrat', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; }
                .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                .header { background: linear-gradient(135deg, #161c26 0%, #1e2534 100%); padding: 34px 28px; text-align: center; }
                .brand { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
                .brand-accent { color: #40C196; }
                .sub { color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; }
                .content { padding: 36px 32px; color: #1e293b; }
                .greeting { margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a; }
                .text { margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569; }
                .code-box { text-align: center; margin: 30px 0; }
                .code-inner { display: inline-block; background: #ecfdf5; border: 2px dashed #40C196; border-radius: 14px; padding: 18px 40px; }
                .code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: 'Courier New', monospace; }
                .note { margin: 0 0 12px 0; font-size: 13px; color: #64748b; line-height: 1.5; }
                .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #f1f5f9; text-align: center; }
                .copy { margin: 0; font-size: 12px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="brand">Map<span class="brand-accent">News</span></h1>
                    <p class="sub">Интерактивная карта региональных новостей</p>
                </div>
                <div class="content">
                    <h2 class="greeting">Здравствуйте, ${name || 'пользователь'}!</h2>
                    <p class="text">
                        Благодарим за регистрацию в MapNews. Для завершения создания учетной записи и подтверждения адреса электронной почты введите код:
                    </p>
                    <div class="code-box">
                        <div class="code-inner">
                            <span class="code">${code}</span>
                        </div>
                    </div>
                    <p class="note">
                        ⏱️ Код действует в течение <strong>15 минут</strong>.
                    </p>
                    <p class="note" style="color: #94a3b8;">
                        Если вы не регистрировались на сайте MapNews, просто проигнорируйте это письмо.
                    </p>
                </div>
                <div class="footer">
                    <p class="copy">© ${new Date().getFullYear()} MapNews. Все права защищены.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transport.sendMail({
            from: SMTP_FROM || `"MapNews" <${SMTP_USER}>`,
            replyTo: SMTP_USER,
            to: email,
            subject: `${code} — ваш код подтверждения MapNews`,
            headers: {
                'X-Mailer': 'MapNews Mailer',
                'X-Priority': '3',
                'Precedence': 'transactional'
            },
            text: `Здравствуйте, ${name}!\n\nВаш код подтверждения для регистрации в MapNews: ${code}\n\nКод действителен 15 минут.\n\nЕсли вы не регистрировались на сайте MapNews — просто проигнорируйте это письмо.\n\n—\nMapNews`,
            html: htmlContent
        });

        return { delivered: true, logged: true };
    } catch (err) {
        console.error('Ошибка отправки письма через SMTP:', err.message);
        return { delivered: false, logged: true, error: err.message };
    }
}

module.exports = {
    sendVerificationCode
};
