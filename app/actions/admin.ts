"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Verifica se o usuário é admin (admin ou superadmin)
async function checkIsAdmin() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  if (!session?.user) {
    throw new Error("Não autenticado")
  }

  const userRoles = session.user.role?.split(",") || []
  const isAdmin = userRoles.some(role => role === "admin" || role === "superadmin")

  if (!isAdmin) {
    throw new Error("Sem permissão de admin")
  }

  return session
}

// Verifica se o usuário é superadmin
async function checkIsSuperAdmin() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  if (!session?.user) {
    throw new Error("Não autenticado")
  }

  const userRoles = session.user.role?.split(",") || []
  const isSuperAdmin = userRoles.some(role => role === "superadmin")

  if (!isSuperAdmin) {
    throw new Error("Sem permissão de superadmin")
  }

  return session
}

// Pega informações do admin com organização
async function getAdminInfo() {
  const session = await checkIsAdmin()

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organization: true }
  })

  if (!user) {
    throw new Error("Usuário não encontrado")
  }

  const userRoles = user.role?.split(",") || []
  const isSuperAdmin = userRoles.some(role => role === "superadmin")

  return {
    user,
    isSuperAdmin,
    organizationId: user.organizationId
  }
}

// Criar novo usuário
export async function createUserAction(data: {
  name: string
  email: string
  password: string
  role?: string
  organizationId?: string
}) {
  try {
    await checkIsAdmin()

    // Usar Better Auth API para criar usuário
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      }
    })

    if (!result) {
      return { success: false, error: "Erro ao criar usuário" }
    }

    // Atualizar role e organizationId se fornecidos
    if ((data.role || data.organizationId) && result.user) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: {
          ...(data.role && { role: data.role }),
          ...(data.organizationId && { organizationId: data.organizationId }),
        }
      })
    }

    revalidatePath("/dashboard/admin/users")
    return { success: true, user: result.user }
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    return { success: false, error: error.message || "Erro ao criar usuário" }
  }
}

// Atualizar usuário
export async function updateUserAction(data: {
  userId: string
  name?: string
  email?: string
  role?: string
  organizationId?: string | null
}) {
  try {
    await checkIsAdmin()

    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.organizationId !== undefined && { organizationId: data.organizationId }),
      }
    })

    revalidatePath("/dashboard/admin/users")
    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error)
    return { success: false, error: error.message || "Erro ao atualizar usuário" }
  }
}

// Banir usuário
export async function banUserAction(data: {
  userId: string
  reason: string
  expiresInDays?: number
}) {
  try {
    await checkIsAdmin()

    const banExpires = data.expiresInDays
      ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: {
        banned: true,
        banReason: data.reason,
        banExpires: banExpires,
      }
    })

    revalidatePath("/dashboard/admin/users")
    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Erro ao banir usuário:", error)
    return { success: false, error: error.message || "Erro ao banir usuário" }
  }
}

// Desbanir usuário
export async function unbanUserAction(userId: string) {
  try {
    await checkIsAdmin()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      }
    })

    revalidatePath("/dashboard/admin/users")
    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Erro ao desbanir usuário:", error)
    return { success: false, error: error.message || "Erro ao desbanir usuário" }
  }
}

// Deletar usuário
export async function deleteUserAction(userId: string) {
  try {
    const session = await checkIsAdmin()

    // Não permitir deletar a si mesmo
    if (session.user.id === userId) {
      return { success: false, error: "Você não pode deletar sua própria conta" }
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    revalidatePath("/dashboard/admin/users")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar usuário:", error)
    return { success: false, error: error.message || "Erro ao deletar usuário" }
  }
}

// Alterar role do usuário
export async function setRoleAction(data: {
  userId: string
  role: string
}) {
  try {
    await checkIsAdmin()

    const updatedUser = await prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role }
    })

    revalidatePath("/dashboard/admin/users")
    return { success: true, user: updatedUser }
  } catch (error: any) {
    console.error("Erro ao alterar role:", error)
    return { success: false, error: error.message || "Erro ao alterar role" }
  }
}

// Revogar sessão
export async function revokeSessionAction(sessionToken: string) {
  try {
    await checkIsAdmin()

    await prisma.session.delete({
      where: { token: sessionToken }
    })

    revalidatePath("/dashboard/admin/sessions")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao revogar sessão:", error)
    return { success: false, error: error.message || "Erro ao revogar sessão" }
  }
}

// Revogar todas as sessões de um usuário
export async function revokeAllUserSessionsAction(userId: string) {
  try {
    await checkIsAdmin()

    await prisma.session.deleteMany({
      where: { userId }
    })

    revalidatePath("/dashboard/admin/sessions")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao revogar sessões:", error)
    return { success: false, error: error.message || "Erro ao revogar sessões" }
  }
}

// ========== ORGANIZAÇÕES (SUPERADMIN ONLY) ==========

// Criar nova organização
export async function createOrganizationAction(data: {
  name: string
  slug: string
  description?: string
  logo?: string
}) {
  try {
    await checkIsSuperAdmin()

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
      }
    })

    revalidatePath("/dashboard/admin/organizations")
    return { success: true, organization }
  } catch (error: any) {
    console.error("Erro ao criar organização:", error)
    return { success: false, error: error.message || "Erro ao criar organização" }
  }
}

// Atualizar organização
export async function updateOrganizationAction(data: {
  organizationId: string
  name?: string
  slug?: string
  description?: string
  logo?: string
}) {
  try {
    await checkIsSuperAdmin()

    const organization = await prisma.organization.update({
      where: { id: data.organizationId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logo !== undefined && { logo: data.logo }),
      }
    })

    revalidatePath("/dashboard/admin/organizations")
    return { success: true, organization }
  } catch (error: any) {
    console.error("Erro ao atualizar organização:", error)
    return { success: false, error: error.message || "Erro ao atualizar organização" }
  }
}

// Deletar organização
export async function deleteOrganizationAction(organizationId: string) {
  try {
    await checkIsSuperAdmin()

    // Verificar se há usuários na organização
    const usersCount = await prisma.user.count({
      where: { organizationId }
    })

    if (usersCount > 0) {
      return {
        success: false,
        error: `Não é possível deletar. Existem ${usersCount} usuário(s) nesta organização.`
      }
    }

    await prisma.organization.delete({
      where: { id: organizationId }
    })

    revalidatePath("/dashboard/admin/organizations")
    return { success: true }
  } catch (error: any) {
    console.error("Erro ao deletar organização:", error)
    return { success: false, error: error.message || "Erro ao deletar organização" }
  }
}

// Listar todas as organizações (para superadmin)
export async function listOrganizationsAction() {
  try {
    await checkIsSuperAdmin()

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, organizations }
  } catch (error: any) {
    console.error("Erro ao listar organizações:", error)
    return { success: false, error: error.message || "Erro ao listar organizações" }
  }
}
