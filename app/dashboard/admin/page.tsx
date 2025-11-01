import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { IconUsers, IconUserCheck, IconUserX, IconActivity } from "@tabler/icons-react"

export default async function AdminDashboardPage() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

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

  // Buscar usuários recentes para atividade
  const latestUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: true,
    }
  })

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

      {/* Usuários Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Recentes</CardTitle>
          <CardDescription>
            Últimos usuários registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário registrado ainda
            </p>
          ) : (
            <div className="space-y-4">
              {latestUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {user.role || "user"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Links para funcionalidades administrativas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/dashboard/admin/users"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <IconUsers className="h-5 w-5" />
              <div>
                <p className="font-medium">Gerenciar Usuários</p>
                <p className="text-sm text-muted-foreground">
                  Criar, editar e gerenciar usuários
                </p>
              </div>
            </a>

            <a
              href="/dashboard/admin/sessions"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <IconActivity className="h-5 w-5" />
              <div>
                <p className="font-medium">Sessões Ativas</p>
                <p className="text-sm text-muted-foreground">
                  Ver e gerenciar sessões
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
