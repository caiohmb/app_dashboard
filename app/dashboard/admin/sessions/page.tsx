import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Separator } from "@/components/ui/separator"
import { SessionsTable } from "@/components/admin/sessions-table"

interface SearchParams {
  page?: string
  userId?: string
}

export default async function AdminSessionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  // Paginação
  const page = parseInt(searchParams.page || "1")
  const pageSize = 20
  const skip = (page - 1) * pageSize

  // Filtros
  const userIdFilter = searchParams.userId || ""

  // Construir where clause
  const where = {
    ...(userIdFilter ? { userId: userIdFilter } : {}),
    expiresAt: { gt: new Date() } // Apenas sessões ativas
  }

  // Buscar sessões com paginação
  const [sessions, totalSessions] = await Promise.all([
    prisma.session.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    }),
    prisma.session.count({ where })
  ])

  const totalPages = Math.ceil(totalSessions / pageSize)

  return (
    <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Sessões Ativas</h1>
        <p className="text-muted-foreground">
          Gerencie e monitore sessões ativas de usuários
        </p>
      </div>

      <Separator />

      {/* Tabela de Sessões */}
      <SessionsTable
        sessions={sessions}
        currentPage={page}
        totalPages={totalPages}
        totalSessions={totalSessions}
        userIdFilter={userIdFilter}
      />
    </div>
  )
}
