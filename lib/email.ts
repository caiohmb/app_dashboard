import { Resend } from "resend"

/**
 * Serviço de envio de email usando Resend
 */

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(options: SendEmailOptions) {
  try {
    // Determina o endereço "from" baseado no ambiente
    // Em produção, usa o domínio verificado via variável de ambiente
    // Em desenvolvimento, usa o email de teste do Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

    // Envia email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html || options.text,
    })

    if (error) {
      console.error("Erro ao enviar email:", error)
      throw new Error(error.message)
    }

    console.log("✅ Email enviado com sucesso para:", options.to, "| ID:", data?.id)

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    throw error
  }
}
