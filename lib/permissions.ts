import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

// Define nossos recursos e ações customizadas
const statement = {
  ...defaultStatements, // Mantém as permissões padrão do admin plugin
  dashboard: ["view", "edit"],
  metrics: ["view", "edit", "export"],
  reports: ["view", "create", "edit", "delete"],
  users: ["view", "edit", "delete"],
} as const

// Cria o controlador de acesso
export const ac = createAccessControl(statement)

// Role: user (padrão) - apenas visualização
export const user = ac.newRole({
  dashboard: ["view"],
  metrics: ["view"],
  reports: ["view"],
  users: [], // Sem permissões de usuários
})

// Role: admin - permissões administrativas completas
export const admin = ac.newRole({
  ...adminAc.statements, // Inclui todas as permissões padrão de admin
  dashboard: ["view", "edit"],
  metrics: ["view", "edit", "export"],
  reports: ["view", "create", "edit", "delete"],
  users: ["view", "edit", "delete"],
})

// Role: superadmin - permissões totais (futura expansão)
export const superadmin = ac.newRole({
  ...adminAc.statements, // Inclui todas as permissões padrão de admin
  dashboard: ["view", "edit"],
  metrics: ["view", "edit", "export"],
  reports: ["view", "create", "edit", "delete"],
  users: ["view", "edit", "delete"],
})

// Export dos tipos para uso no TypeScript
export type Permission = typeof statement
export type Role = "user" | "admin" | "superadmin"
