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
    // Em desenvolvimento, Resend só permite enviar para o email verificado
    // Substituímos o destinatário mas mostramos o email original no console
    const isDevelopment = process.env.NODE_ENV === "development"
    const verifiedEmail = "caioh.maiab@gmail.com" // Email verificado no Resend

    const emailToSend = isDevelopment ? verifiedEmail : options.to

    if (isDevelopment && options.to !== verifiedEmail) {
      console.log("\n=== MODO DESENVOLVIMENTO - RESEND ===")
      console.log("Email destinatário original:", options.to)
      console.log("Enviando para email verificado:", verifiedEmail)
      console.log("(Em produção, seria enviado para:", options.to, ")")
      console.log("=====================================\n")
    }

    // Envia email via Resend
    const { data, error } = await resend.emails.send({
      from: "Acme Inc <onboarding@resend.dev>", // Use seu domínio verificado em produção
      to: emailToSend,
      subject: isDevelopment ? `[DEV: ${options.to}] ${options.subject}` : options.subject,
      html: options.html || options.text,
    })

    if (error) {
      console.error("Erro ao enviar email:", error)
      throw new Error(error.message)
    }

    if (isDevelopment) {
      console.log("✅ Email enviado com sucesso! ID:", data?.id)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Erro ao enviar email:", error)
    throw error
  }
}
