import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { ac, admin, user, superadmin } from "./permissions"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    plugins: [
        adminClient({
            ac, // Sistema de controle de acesso customizado
            roles: { admin, user, superadmin }, // Roles customizadas
        })
    ]
})