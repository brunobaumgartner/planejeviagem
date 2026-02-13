/**
 * Email Helper para Planeje Fácil
 *
 * - Provider atual: SMTP ou console
 * - Feito para rodar em Supabase Edge Functions (Deno)
 *
 * Observação importante:
 * - SMTP em ambiente serverless pode ser bloqueado por rede (porta 465/587).
 * - Se der timeout/ECONNREFUSED, não é necessariamente bug do código.
 */

// ============================================
// CONFIGURAÇÃO
// ============================================

const EMAIL_PROVIDER = Deno.env.get("EMAIL_PROVIDER") || "console";

/**
 * Variáveis SMTP (configure no Supabase > Functions > Secrets):
 * - SMTP_HOST        ex: smtp.hostinger.com
 * - SMTP_PORT        ex: 465 (SSL) ou 587 (STARTTLS)
 * - SMTP_USER        usuário/login
 * - SMTP_PASS        senha (ou app password)
 *
 * Opcional:
 * - SMTP_FROM_NAME   ex: Planeje Fácil
 * - SMTP_FROM_EMAIL  ex: noreply@seu-dominio.com
 */

// ============================================
// TIPOS
// ============================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

// ============================================
// TEMPLATES
// ============================================

export function getResetPasswordTemplate(
  code: string,
  expiresInMinutes: number = 15,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Recuperação de Senha</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f0f9ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9 0%,#3b82f6 100%);padding:40px 30px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:bold;">🔐 Planeje Fácil</h1>
              <p style="margin:10px 0 0;color:#e0f2fe;font-size:16px;">Recuperação de Senha</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;">
              <h2 style="margin:0 0 20px;color:#1e293b;font-size:24px;">Olá! 👋</h2>
              <p style="margin:0 0 20px;color:#475569;font-size:16px;line-height:1.6;">
                Você solicitou a recuperação de senha da sua conta no <strong>Planeje Fácil</strong>.
              </p>
              <p style="margin:0 0 30px;color:#475569;font-size:16px;line-height:1.6;">
                Use o código abaixo para criar uma nova senha:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:30px;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);border-radius:12px;border:2px dashed #0ea5e9;">
                    <div style="font-size:48px;font-weight:bold;color:#0c4a6e;letter-spacing:12px;font-family:'Courier New',monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin:30px 0;padding:20px;background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;">
                <p style="margin:0 0 10px;color:#78350f;font-size:14px;font-weight:bold;">⚠️ Informações importantes:</p>
                <ul style="margin:0;padding-left:20px;color:#78350f;font-size:14px;line-height:1.8;">
                  <li>Este código expira em <strong>${expiresInMinutes} minutos</strong></li>
                  <li>Você tem no máximo <strong>3 tentativas</strong></li>
                  <li>O código pode ser usado <strong>apenas uma vez</strong></li>
                </ul>
              </div>

              <p style="margin:30px 0 0;color:#64748b;font-size:14px;line-height:1.6;">
                Se você <strong>não solicitou</strong> esta recuperação, pode ignorar este email com segurança.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 10px;color:#64748b;font-size:14px;">
                © ${new Date().getFullYear()} Planeje Fácil. Todos os direitos reservados.
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Este é um email automático. Por favor, não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Template simples para "Fale Conosco"
 */
function getContatoTemplate(params: {
  nome?: string;
  email: string;
  assunto: string;
  mensagem: string;
}): string {
  const nome = String(params.nome ?? "").trim();
  const email = String(params.email ?? "");
  const assunto = String(params.assunto ?? "");
  const mensagem = String(params.mensagem ?? "");

  const safe = (s: unknown) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /></head>
<body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="padding:16px 20px;background:linear-gradient(135deg,#0ea5e9 0%,#3b82f6 100%);color:#fff;">
      <h2 style="margin:0;font-size:18px;">📩 Nova mensagem — Fale Conosco</h2>
    </div>
    <div style="padding:20px;color:#0f172a;">
      <p style="margin:0 0 8px;"><strong>De:</strong> ${safe(
        nome ? `${nome} <${email}>` : email
      )}</p>
      <p style="margin:0 0 16px;"><strong>Assunto:</strong> ${safe(assunto)}</p>
      <div style="padding:14px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;white-space:pre-wrap;line-height:1.5;">
        ${safe(mensagem)}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================
// PROVEDORES
// ============================================

async function sendWithSMTP(options: EmailOptions): Promise<EmailResult> {
  // 1) Ler secrets
  const host = Deno.env.get("SMTP_HOST");
  const portStr = Deno.env.get("SMTP_PORT");
  const user = Deno.env.get("SMTP_USER");
  const pass = Deno.env.get("SMTP_PASS");

  if (!host || !portStr || !user || !pass) {
    return {
      success: false,
      error:
        "Configurações SMTP incompletas. Verifique SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS.",
    };
  }

  // 2) Remetente (from)
  const fromName = Deno.env.get("SMTP_FROM_NAME") || "Planeje Fácil";
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL_NOREPLY") || user;
  const fromAddress = options.from || `${fromName} <${fromEmail}>`;

  // 3) Porta e modo de segurança
  const port = Number(portStr);
  if (!Number.isFinite(port) || port <= 0) {
    return { success: false, error: "SMTP_PORT inválida" };
  }

  // Regras práticas:
  // - 465: TLS/SSL direto
  // - 587: STARTTLS (começa sem TLS e faz upgrade)
  // - 25: normalmente bloqueado / inseguro
  const tls = port === 465;
  const starttls = port === 587;

  // 4) Import do client SMTP (Deno)
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

  // 5) Criar client
  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      tls, // SSL direto (465)
      starttls, // STARTTLS (587)
      auth: {
        username: user,
        password: pass,
      },
    },
  });

  try {
    // 6) Enviar
    await client.send({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      // "content: auto" ajuda o denomailer a montar o email
      content: "auto",
      html: options.html,
    });

    // 7) Fechar conexão
    await client.close();

    return {
      success: true,
      messageId: `smtp-${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(16).slice(2)}`,
    };
  } catch (error: any) {
    // Erros comuns com mensagens mais úteis
    const raw = String(error?.message || error);
    let msg = "Erro ao enviar email via SMTP.";

    if (/auth|authentication|Invalid login|535/i.test(raw)) {
      msg = "Autenticação SMTP falhou. Verifique SMTP_USER/SMTP_PASS (ou app password).";
    } else if (/ECONNREFUSED|Connection refused/i.test(raw)) {
      msg = "Conexão recusada. Verifique SMTP_HOST/SMTP_PORT e se a rede do Edge permite SMTP.";
    } else if (/timeout|ETIMEDOUT/i.test(raw)) {
      msg = "Timeout. O servidor SMTP demorou a responder (ou a rede bloqueia a porta).";
    } else if (/TLS|certificate|handshake/i.test(raw)) {
      msg = "Erro TLS/SSL. Tente trocar a porta (465 vs 587) e confirme o modo TLS/STARTTLS do provedor.";
    } else {
      msg = `Erro SMTP: ${raw}`;
    }

    console.error("[Email SMTP] ❌", msg);
    return { success: false, error: msg };
  } finally {
    // Garantir fechamento mesmo em erro
    try {
      await client.close();
    } catch {
      // ignore
    }
  }
}

async function sendWithConsole(options: EmailOptions): Promise<EmailResult> {
  console.log("[Email] 📧 ========== EMAIL DE DESENVOLVIMENTO ==========");
  console.log("[Email] Para:", options.to);
  console.log("[Email] De:", options.from || "noreply@planejeviagem.com.br");
  console.log("[Email] Assunto:", options.subject);
  console.log("[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(options.html);
  console.log("[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return { success: true, messageId: "console-" + Date.now() };
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  console.log(`[Email] Enviando email via ${EMAIL_PROVIDER}...`);

  switch (EMAIL_PROVIDER) {
    case "smtp":
      return sendWithSMTP(options);

    case "console":
    default:
      return sendWithConsole(options);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
  expiresInMinutes: number = 15,
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: "Código de Recuperação de Senha - Planeje Fácil",
    html: getResetPasswordTemplate(code, expiresInMinutes),
  });
}

/**
 * Envia email de contato (Fale Conosco)
 * - `from`: email do usuário que preencheu o form
 * - `to`: email que vai receber (suporte/admin)
 * - `subject`: assunto do usuário (ou do form)
 * - `text`: mensagem em texto puro (opcional; aqui a gente usa pra preencher o HTML)
 * - `html`: se você quiser mandar um HTML pronto; se vier vazio, a função gera um template
 */
export async function sendContatoEmail(
  from: string,
  to: string,
  subject: string,
  text: string,
  html?: string,
): Promise<EmailResult> {
  const finalHtml =
    (html && html.trim().length > 0)
      ? html
      : getContatoTemplate({
          email: from,
          assunto: subject,
          mensagem: text,
        });

  // Aqui faz sentido “from” ser algo do teu domínio (para evitar SPF/DKIM falhar),
  // e o email do usuário ir em Reply-To (se você quiser evoluir depois).
  return sendEmail({
    to,
    subject: `Fale Conosco — ${subject}`,
    html: finalHtml,
  });
}
