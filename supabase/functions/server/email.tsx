/**
 * Email Helper para Planeje Fácil
 * 
 * Este arquivo contém funções para envio de emails.
 * Suporta múltiplos provedores de email.
 */

// ============================================
// CONFIGURAÇÃO
// ============================================

/**
 * Escolha o provedor de email que você quer usar:
 * 
 * 1. 'resend' - Moderno, simples, 100 emails/dia grátis
 * 2. 'sendgrid' - Popular, 100 emails/dia grátis
 * 3. 'smtp' - Genérico (Gmail, Outlook, etc)
 * 4. 'console' - Apenas loga no console (desenvolvimento)
 */
const EMAIL_PROVIDER = Deno.env.get('EMAIL_PROVIDER') || 'console';

/**
 * Configurações por provedor
 * Configure as variáveis de ambiente no Supabase:
 * 
 * RESEND:
 * - RESEND_API_KEY
 * 
 * SENDGRID:
 * - SENDGRID_API_KEY
 * 
 * SMTP:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASS
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

/**
 * Template de email para código de recuperação de senha
 */
export function getResetPasswordTemplate(code: string, expiresInMinutes: number = 15): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Recuperação de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0f9ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔐 Planeje Fácil
              </h1>
              <p style="margin: 10px 0 0; color: #e0f2fe; font-size: 16px;">
                Recuperação de Senha
              </p>
            </td>
          </tr>
          
          <!-- Conteúdo -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px;">
                Olá! 👋
              </h2>
              
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Você solicitou a recuperação de senha da sua conta no <strong>Planeje Fácil</strong>.
              </p>
              
              <p style="margin: 0 0 30px; color: #475569; font-size: 16px; line-height: 1.6;">
                Use o código abaixo para criar uma nova senha:
              </p>
              
              <!-- Código -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; border: 2px dashed #0ea5e9;">
                    <div style="font-size: 48px; font-weight: bold; color: #0c4a6e; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Informações -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                <p style="margin: 0 0 10px; color: #78350f; font-size: 14px; font-weight: bold;">
                  ⚠️ Informações importantes:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                  <li>Este código expira em <strong>${expiresInMinutes} minutos</strong></li>
                  <li>Você tem no máximo <strong>3 tentativas</strong></li>
                  <li>O código pode ser usado <strong>apenas uma vez</strong></li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                Se você <strong>não solicitou</strong> esta recuperação, pode ignorar este email com segurança. Sua senha não será alterada.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                © ${new Date().getFullYear()} Planeje Fácil. Todos os direitos reservados.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
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
 * Template simples em texto puro (fallback)
 */
export function getResetPasswordTextTemplate(code: string, expiresInMinutes: number = 15): string {
  return `
Planeje Fácil - Recuperação de Senha

Olá!

Você solicitou a recuperação de senha da sua conta.

Seu código de verificação é: ${code}

Informações importantes:
- Este código expira em ${expiresInMinutes} minutos
- Você tem no máximo 3 tentativas
- O código pode ser usado apenas uma vez

Se você não solicitou esta recuperação, ignore este email.

© ${new Date().getFullYear()} Planeje Fácil
  `.trim();
}

// ============================================
// PROVEDORES DE EMAIL
// ============================================

/**
 * RESEND - https://resend.com
 * Moderno, simples, 100 emails/dia grátis
 */
async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY não configurado');
    return { success: false, error: 'RESEND_API_KEY não configurado' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || 'Planeje Fácil <noreply@planejeviagem.com.br>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email] Erro Resend:', data);
      return { success: false, error: data.message || 'Erro ao enviar email' };
    }

    console.log('[Email] ✅ Email enviado via Resend:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('[Email] Erro ao enviar via Resend:', error);
    return { success: false, error: error.message };
  }
}

/**
 * SENDGRID - https://sendgrid.com
 * Popular, 100 emails/dia grátis
 */
async function sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  
  if (!apiKey) {
    console.error('[Email] SENDGRID_API_KEY não configurado');
    return { success: false, error: 'SENDGRID_API_KEY não configurado' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
          },
        ],
        from: {
          email: options.from?.split('<')[1]?.split('>')[0] || 'noreply@planejeviagem.com.br',
          name: 'Planeje Fácil',
        },
        subject: options.subject,
        content: [
          {
            type: 'text/html',
            value: options.html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Email] Erro SendGrid:', errorText);
      return { success: false, error: 'Erro ao enviar email via SendGrid' };
    }

    const messageId = response.headers.get('X-Message-Id');
    console.log('[Email] ✅ Email enviado via SendGrid:', messageId);
    return { success: true, messageId: messageId || undefined };
  } catch (error) {
    console.error('[Email] Erro ao enviar via SendGrid:', error);
    return { success: false, error: error.message };
  }
}

/**
 * SMTP Genérico (Gmail, Outlook, etc)
 * Funciona com qualquer servidor SMTP
 */
async function sendWithSMTP(options: EmailOptions): Promise<EmailResult> {
  // 1. VALIDAÇÃO: Verificar se todas as configurações necessárias estão presentes
  const host = Deno.env.get('SMTP_HOST');
  const port = Deno.env.get('SMTP_PORT');
  const user = Deno.env.get('SMTP_USER');
  const pass = Deno.env.get('SMTP_PASS');
  
  if (!host || !port || !user || !pass) {
    console.error('[Email SMTP] ❌ Configurações SMTP incompletas');
    console.error('[Email SMTP] Necessário: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    return { 
      success: false, 
      error: 'Configurações SMTP incompletas. Verifique SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS.' 
    };
  }

  // 2. CONFIGURAÇÃO: Preparar informações do remetente
  const fromName = Deno.env.get('SMTP_FROM_NAME') || 'Planeje Fácil';
  const fromEmail = Deno.env.get('SMTP_FROM_EMAIL') || user;
  const fromAddress = options.from || `${fromName} <${fromEmail}>`;
  
  console.log('[Email SMTP] 📨 Iniciando envio de email...');
  console.log(`[Email SMTP] Servidor: ${host}:${port}`);
  console.log(`[Email SMTP] De: ${fromAddress}`);
  console.log(`[Email SMTP] Para: ${options.to}`);
  console.log(`[Email SMTP] Assunto: ${options.subject}`);

  try {
    // 3. IMPORTAÇÃO DINÂMICA: Importar a biblioteca SMTPClient do Deno
    // Usamos importação dinâmica para evitar carregar a biblioteca se não for necessária
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts');
    
    // 4. CONFIGURAÇÃO DO CLIENTE: Criar instância do cliente SMTP
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: parseInt(port, 10),
        // TLS/SSL: Determinar se deve usar conexão segura baseado na porta
        // Porta 465 = SSL direto, porta 587 = STARTTLS, porta 25 = sem criptografia
        tls: port === '465',
        // STARTTLS: Upgrade de conexão não segura para segura (usado na porta 587)
        auth: {
          username: user,
          password: pass,
        },
      },
    });

    console.log('[Email SMTP] 🔌 Conectando ao servidor SMTP...');

    // 5. ENVIO: Enviar o email
    await client.send({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      content: 'auto', // Define automaticamente o content-type baseado no conteúdo
      html: options.html,
    });

    // 6. LIMPEZA: Fechar a conexão com o servidor SMTP
    await client.close();

    // 7. SUCESSO: Retornar resultado positivo
    const messageId = `smtp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[Email SMTP] ✅ Email enviado com sucesso! ID: ${messageId}`);
    
    return { 
      success: true, 
      messageId 
    };

  } catch (error) {
    // 8. TRATAMENTO DE ERROS: Capturar e logar erros detalhados
    console.error('[Email SMTP] ❌ Erro ao enviar email via SMTP:', error);
    
    // Fornecer mensagens de erro mais específicas baseadas no tipo de erro
    let errorMessage = 'Erro ao enviar email via SMTP';
    
    if (error.message) {
      // Erros comuns e suas soluções
      if (error.message.includes('authentication failed') || error.message.includes('Invalid login')) {
        errorMessage = 'Autenticação SMTP falhou. Verifique SMTP_USER e SMTP_PASS.';
      } else if (error.message.includes('Connection refused') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Não foi possível conectar ao servidor SMTP. Verifique SMTP_HOST e SMTP_PORT.';
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Tempo limite de conexão excedido. Verifique se o servidor SMTP está acessível.';
      } else if (error.message.includes('certificate') || error.message.includes('TLS')) {
        errorMessage = 'Erro de certificado SSL/TLS. Tente usar porta 587 com STARTTLS.';
      } else {
        errorMessage = `Erro SMTP: ${error.message}`;
      }
      
      console.error('[Email SMTP] Detalhes do erro:', error.message);
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Console - Apenas loga no console (desenvolvimento)
 */
async function sendWithConsole(options: EmailOptions): Promise<EmailResult> {
  console.log('[Email] 📧 ========== EMAIL DE DESENVOLVIMENTO ==========');
  console.log('[Email] Para:', options.to);
  console.log('[Email] De:', options.from || 'noreply@planejeviagem.com.br');
  console.log('[Email] Assunto:', options.subject);
  console.log('[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[Email] Conteúdo HTML:');
  console.log(options.html);
  console.log('[Email] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return { success: true, messageId: 'console-' + Date.now() };
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Envia um email usando o provedor configurado
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  console.log(`[Email] Enviando email via ${EMAIL_PROVIDER}...`);
  
  switch (EMAIL_PROVIDER) {
    case 'resend':
      return sendWithResend(options);
    
    case 'sendgrid':
      return sendWithSendGrid(options);
    
    case 'smtp':
      return sendWithSMTP(options);
    
    case 'console':
    default:
      return sendWithConsole(options);
  }
}

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  expiresInMinutes: number = 15
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: 'Código de Recuperação de Senha - Planeje Fácil',
    html: getResetPasswordTemplate(code, expiresInMinutes),
  });
}
