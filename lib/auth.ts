import { betterAuth } from "better-auth";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Requer verificação de email
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Verifique seu email - Acme Inc.",
                text: `Olá ${user.name},\n\nClique no link para verificar seu email: ${url}\n\nSe você não criou esta conta, ignore este email.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Verifique seu email</h2>
                        <p>Olá <strong>${user.name}</strong>,</p>
                        <p>Clique no botão abaixo para verificar seu endereço de email:</p>
                        <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                            Verificar Email
                        </a>
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="color: #666; font-size: 14px;">${url}</p>
                        <p style="color: #999; font-size: 12px; margin-top: 32px;">
                            Se você não criou esta conta, ignore este email.
                        </p>
                    </div>
                `,
            });
        },
    },
});