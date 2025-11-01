import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { OrganizationsTable } from "@/components/admin/organizations-table"

export default async function AdminOrganizationsPage() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  // Verificar se é superadmin
  const userRoles = session?.user?.role?.split(",") || []
  const isSuperAdmin = userRoles.some(role => role === "superadmin")

  if (!isSuperAdmin) {
    redirect("/dashboard/admin")
  }

  // Buscar todas as organizações com contagem de usuários
  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Organizações</h1>
        <p className="text-muted-foreground">
          Gerencie organizações do sistema
        </p>
      </div>

      <Separator />

      {/* Tabela de Organizações */}
      <OrganizationsTable organizations={organizations} />
    </div>
  )
}
