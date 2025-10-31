"use client"

import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
import type { Permission } from "@/lib/permissions"

/**
 * Hook para verificar se o usuário é admin
 * @returns true se o usuário tem role admin ou superadmin
 */
export function useIsAdmin(): boolean {
  const { data: session } = useSession()

  if (!session?.user) {
    return false
  }

  // Verifica se o usuário tem role de admin ou superadmin
  const userRoles = session.user.role?.split(",") || []
  return userRoles.some(role => role === "admin" || role === "superadmin")
}

/**
 * Hook para verificar se o usuário tem uma permissão específica
 * @param permission - Objeto de permissão a verificar
 * @returns true se o usuário tem a permissão
 */
export function useHasPermission(permission: Partial<Permission>): boolean {
  const { data: session } = useSession()

  if (!session?.user) {
    return false
  }

  const userRoles = session.user.role?.split(",") || []

  // Verifica para cada role do usuário
  return userRoles.some(role => {
    try {
      return authClient.admin.checkRolePermission({
        permissions: permission,
        role: role as "admin" | "user" | "superadmin",
      })
    } catch {
      return false
    }
  })
}

/**
 * Hook para obter dados completos da sessão admin
 * @returns Objeto com informações de admin e métodos auxiliares
 */
export function useAdminSession() {
  const { data: session, isPending } = useSession()
  const isAdmin = useIsAdmin()

  return {
    session,
    isAdmin,
    isPending,
    user: session?.user,
    roles: session?.user?.role?.split(",") || [],
    isSuperAdmin: session?.user?.role?.includes("superadmin") || false,
  }
}

/**
 * Hook para verificar se o usuário tem uma role específica
 * @param role - Role a verificar ("admin", "superadmin", "user")
 * @returns true se o usuário tem a role
 */
export function useHasRole(role: "admin" | "superadmin" | "user"): boolean {
  const { data: session } = useSession()

  if (!session?.user) {
    return false
  }

  const userRoles = session.user.role?.split(",") || []
  return userRoles.includes(role)
}
