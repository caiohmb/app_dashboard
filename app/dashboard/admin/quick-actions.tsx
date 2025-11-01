import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconUsers, IconActivity, IconBuilding } from "@tabler/icons-react"

interface QuickActionsProps {
  isSuperAdmin: boolean
}

export function QuickActions({ isSuperAdmin }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Links para funcionalidades administrativas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${isSuperAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          <Link
            href="/dashboard/admin/users"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <IconUsers className="h-5 w-5" />
            <div>
              <p className="font-medium">Gerenciar Usuários</p>
              <p className="text-sm text-muted-foreground">Criar, editar e gerenciar usuários</p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/sessions"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <IconActivity className="h-5 w-5" />
            <div>
              <p className="font-medium">Sessões Ativas</p>
              <p className="text-sm text-muted-foreground">Ver e gerenciar sessões</p>
            </div>
          </Link>

          {isSuperAdmin && (
            <Link
              href="/dashboard/admin/organizations"
              className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <IconBuilding className="h-5 w-5" />
              <div>
                <p className="font-medium">Organizações</p>
                <p className="text-sm text-muted-foreground">Gerenciar organizações do sistema</p>
              </div>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}