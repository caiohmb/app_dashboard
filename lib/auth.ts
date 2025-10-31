import { betterAuth } from "better-auth";
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail } from "./email";
import { admin } from "better-auth/plugins";
import { ac, admin as adminRole, user, superadmin } from "./permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin", "superadmin"],
            impersonationSessionDuration: 60 * 60, // 1 hora
            defaultBanReason: "Violação dos termos de uso",
            defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 dias
            bannedUserMessage: "Sua conta foi suspensa. Entre em contato com o suporte.",
            ac, // Sistema de controle de acesso customizado
            roles: { admin: adminRole, user, superadmin }, // Roles customizadas
        })
    ],
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true, // Requer verificação de email
        sendResetPassword: async ({ user, url }) => {
            await sendEmail({
                to: user.email,
                subject: "Redefinir sua senha - Acme Inc.",
                text: `Olá ${user.name},\n\nRecebemos uma solicitação para redefinir sua senha.\n\nClique no link para redefinir: ${url}\n\nEste link expira em 1 hora.\n\nSe você não solicitou esta redefinição, ignore este email.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Redefinir sua senha</h2>
                        <p>Olá <strong>${user.name}</strong>,</p>
                        <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                        <p>Clique no botão abaixo para criar uma nova senha:</p>
                        <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                            Redefinir Senha
                        </a>
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="color: #666; font-size: 14px; word-break: break-all;">${url}</p>
                        <p style="color: #e74c3c; font-size: 14px; margin-top: 24px;">
                            <strong>Este link expira em 1 hora.</strong>
                        </p>
                        <p style="color: #999; font-size: 12px; margin-top: 32px;">
                            Se você não solicitou esta redefinição de senha, ignore este email. Sua senha permanecerá inalterada.
                        </p>
                    </div>
                `,
            });
        },
        resetPasswordTokenExpiresIn: 3600, // 1 hora
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