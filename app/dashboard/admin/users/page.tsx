import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Separator } from "@/components/ui/separator"
import { UsersTable } from "@/components/admin/users-table"

interface SearchParams {
  page?: string
  search?: string
  role?: string
}

export default async function AdminUsersPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  // Verificar role do admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { organization: true }
  })

  const userRoles = currentUser?.role?.split(",") || []
  const isSuperAdmin = userRoles.some(role => role === "superadmin")

  // Paginação
  const page = parseInt(searchParams.page || "1")
  const pageSize = 10
  const skip = (page - 1) * pageSize

  // Filtros
  const search = searchParams.search || ""
  const roleFilter = searchParams.role || ""

  // Construir where clause
  const where = {
    AND: [
      search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ]
      } : {},
      roleFilter ? { role: { contains: roleFilter } } : {},
      // Se não for superadmin, filtrar apenas usuários da mesma organização
      !isSuperAdmin && currentUser?.organizationId
        ? { organizationId: currentUser.organizationId }
        : {},
    ]
  }

  // Buscar usuários com paginação
  const [users, totalUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    }),
    prisma.user.count({ where })
  ])

  const totalPages = Math.ceil(totalUsers / pageSize)

  // Buscar todas as organizações (apenas para superadmin)
  const organizations = isSuperAdmin
    ? await prisma.organization.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
        }
      })
    : []

  return (
    <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, roles e permissões do sistema
        </p>
      </div>

      <Separator />

      {/* Tabela de Usuários */}
      <UsersTable
        users={users}
        currentPage={page}
        totalPages={totalPages}
        totalUsers={totalUsers}
        searchQuery={search}
        roleFilter={roleFilter}
        isSuperAdmin={isSuperAdmin}
        organizations={organizations}
      />
    </div>
  )
}
