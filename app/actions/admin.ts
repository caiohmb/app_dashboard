"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Esquemas de validação
const CreateUserSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  role: z.string().optional(),
  organizationId: z.string().optional(),
})

const UpdateUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, "O nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  role: z.string().optional(),
  organizationId: z.string().nullable().optional(),
})

const BanUserSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1, "O motivo é obrigatório"),
  expiresInDays: z.number().optional(),
})

const SetRoleSchema = z.object({
  userId: z.string(),
  role: z.string(),
})


// Verifica se o usuário possui uma das roles necessárias
async function checkUserRole(requiredRoles: string[]) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  if (!session?.user) {
    throw new Error("Não autenticado")
  }

  const userRoles = session.user.role?.split(",") || []
  const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role))

  if (!hasRequiredRole) {
    throw new Error(`Sem permissão. Requer uma das seguintes roles: ${requiredRoles.join(", ")}`)
  }

  return session
}

// Pega informações do admin e do usuário alvo, e verifica permissões
async function getAdminAndTargetUser(userId: string) {
  const session = await checkUserRole(["admin", "superadmin"])
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!adminUser) {
    throw new Error("Usuário admin não encontrado")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!targetUser) {
    throw new Error("Usuário alvo não encontrado")
  }

  const isAdminSuper = adminUser.role?.includes("superadmin")
  const isTargetSuper = targetUser.role?.includes("superadmin")

  // Superadmin pode gerenciar todos, exceto outro superadmin (a menos que seja ele mesmo)
  if (isAdminSuper) {
    if (isTargetSuper && adminUser.id !== targetUser.id) {
      throw new Error("Superadmin não pode modificar outro superadmin")
    }
    return { adminUser, targetUser, isAdminSuper }
  }

  // Admin normal não pode modificar superadmin
  if (isTargetSuper) {
    throw new Error("Admin não pode modificar superadmin")
  }

  // Admin normal só pode gerenciar usuários da sua organização
  if (adminUser.organizationId !== targetUser.organizationId) {
    throw new Error("Você não tem permissão para gerenciar usuários de outra organização")
  }

  return { adminUser, targetUser, isAdminSuper }
}


// Criar novo usuário
export async function createUserAction(data: z.infer<typeof CreateUserSchema>) {
  try {
    const validation = CreateUserSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: "Dados inválidos" }
    }

    const session = await checkUserRole(["admin", "superadmin"])
    const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!adminUser) {
      return { success: false, error: "Usuário admin não encontrado" }
    }

    const isAdminSuper = adminUser.role?.includes("superadmin")

    // Se o admin não for superadmin, ele só pode criar usuários para a sua própria organização
    let organizationId = data.organizationId
    if (!isAdminSuper) {
      organizationId = adminUser.organizationId ?? undefined
      if (data.role?.includes("superadmin") || data.role?.includes("admin")) {
        return { success: false, error: "Você não pode criar usuários com role de admin ou superadmin" }
      }
    }

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
    if ((data.role || organizationId) && result.user) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: {
          ...(data.role && { role: data.role }),
          ...(organizationId && { organizationId: organizationId }),
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
export async function updateUserAction(data: z.infer<typeof UpdateUserSchema>) {
  try {
    const validation = UpdateUserSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: "Dados inválidos" }
    }

    const { adminUser, isAdminSuper } = await getAdminAndTargetUser(data.userId)

    // Prevenir escalação de privilégio
    if (data.role?.includes("superadmin") && !isAdminSuper) {
      return { success: false, error: "Somente superadmins podem atribuir a role de superadmin" }
    }
    
    // Admins não podem alterar a organização de um usuário para uma organização que não seja a sua
    if (!isAdminSuper && data.organizationId && data.organizationId !== adminUser.organizationId) {
      return { success: false, error: "Você só pode atribuir usuários à sua própria organização" }
    }

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
export async function banUserAction(data: z.infer<typeof BanUserSchema>) {
  try {
    const validation = BanUserSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: "Dados inválidos" }
    }

    await getAdminAndTargetUser(data.userId)

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
    await getAdminAndTargetUser(userId)

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
    const { adminUser } = await getAdminAndTargetUser(userId)

    // Não permitir deletar a si mesmo
    if (adminUser.id === userId) {
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
export async function setRoleAction(data: z.infer<typeof SetRoleSchema>) {
  try {
    const validation = SetRoleSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: "Dados inválidos" }
    }

    const { isAdminSuper } = await getAdminAndTargetUser(data.userId)

    // Prevenir escalação de privilégio
    if (data.role.includes("superadmin") && !isAdminSuper) {
      return { success: false, error: "Somente superadmins podem atribuir a role de superadmin" }
    }

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

const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  slug: z.string().min(1, "O slug é obrigatório"),
  description: z.string().optional(),
  logo: z.string().optional(),
})

const UpdateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1, "O nome é obrigatório").optional(),
  slug: z.string().min(1, "O slug é obrigatório").optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
})


// Revogar sessão
export async function revokeSessionAction(sessionToken: string) {
  try {
    await checkUserRole(["admin", "superadmin"])

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
    await checkUserRole(["admin", "superadmin"])

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
export async function createOrganizationAction(data: z.infer<typeof CreateOrganizationSchema>) {
  try {
    const validation = CreateOrganizationSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: "Dados inválidos" }
    }

    await checkUserRole(["superadmin"])

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
export async function updateOrganizationAction(data: z.infer<typeof UpdateOrganizationSchema>) {
  try {
    const validation = UpdateOrganizationSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: "Dados inválidos" }
    }

    await checkUserRole(["superadmin"])

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
    await checkUserRole(["superadmin"])

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
    await checkUserRole(["superadmin"])

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
