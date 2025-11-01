import { Suspense } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { IconUsers, IconUserCheck, IconUserX, IconActivity, IconBuilding } from "@tabler/icons-react"
import { QuickActions } from "@/app/dashboard/admin/quick-actions"
import { RecentUsers } from "@/app/dashboard/admin/recent-users"
import { RecentUsersSkeleton } from "@/app/dashboard/admin/recent-users-skeleton"

export default async function AdminDashboardPage() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  // Verificar se é superadmin
  const currentUser = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { organization: true }
  })

  const userRoles = currentUser?.role?.split(",") || []
  const isSuperAdmin = userRoles.some(role => role === "superadmin")

  // Buscar métricas do sistema
  const [totalUsers, verifiedUsers, bannedUsersCount, recentUsers] = await Promise.all([
    // Total de usuários
    prisma.user.count(),

    // Usuários verificados
    prisma.user.count({
      where: { emailVerified: true }
    }),

    // Usuários banidos
    prisma.user.count({
      where: { banned: true }
    }),

    // Usuários recentes (últimos 7 dias)
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
  ])

  const activeUsers = totalUsers - bannedUsersCount

  return (
    <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Painel Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema e gerenciamento de usuários
        </p>
      </div>

      <Separator />

      {/* Métricas em Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuários
            </CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{recentUsers} nos últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Verificados
            </CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contas Ativas
            </CardTitle>
            <IconActivity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários não banidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários Banidos
            </CardTitle>
            <IconUserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bannedUsersCount}</div>
            <p className="text-xs text-muted-foreground">
              Contas suspensas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <QuickActions isSuperAdmin={isSuperAdmin} />

      {/* Usuários Recentes (Recolhível) */}
      <Suspense fallback={<RecentUsersSkeleton />}>
        <RecentUsers />
      </Suspense>
    </div>
  )
}
