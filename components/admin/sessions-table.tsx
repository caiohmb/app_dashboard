"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconTrash,
  IconLoader2,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconWorld,
} from "@tabler/icons-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { revokeSessionAction } from "@/app/actions/admin"
import { getBrowserInfo, getInitials } from "@/lib/utils"
import { RevokeSessionDialog } from "@/components/admin/revoke-session-dialog"

interface Session {
  id: string
  token: string
  expiresAt: Date
  createdAt: Date
  ipAddress: string | null
  userAgent: string | null
  impersonatedBy: string | null
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

interface SessionsTableProps {
  sessions: Session[]
  currentPage: number
  totalPages: number
  totalSessions: number
  userIdFilter: string
}

export function SessionsTable({
  sessions,
  currentPage,
  totalPages,
  totalSessions,
  userIdFilter,
}: SessionsTableProps) {
  const router = useRouter()
  const [sessionToRevoke, setSessionToRevoke] = React.useState<Session | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (userIdFilter) params.set("userId", userIdFilter)
    params.set("page", newPage.toString())
    router.push(`/dashboard/admin/sessions?${params.toString()}`)
  }

  const handleRevokeClick = (session: Session) => {
    setSessionToRevoke(session)
    setDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sessões do Sistema</CardTitle>
              <CardDescription>
                {totalSessions} sessão{totalSessions !== 1 ? "ões" : ""} ativa{totalSessions !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhuma sessão ativa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => {
                    const isExpired = new Date(session.expiresAt) < new Date()
                    const isImpersonated = !!session.impersonatedBy

                    return (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={session.user.image || undefined} />
                              <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{session.user.name}</p>
                              <p className="text-xs text-muted-foreground">{session.user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {session.userAgent?.toLowerCase().includes("mobile") ? (
                              <IconDeviceMobile className="h-4 w-4" />
                            ) : (
                              <IconDeviceDesktop className="h-4 w-4" />
                            )}
                            <span className="text-sm">{getBrowserInfo(session.userAgent)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{session.ipAddress || "N/A"}</code>
                        </TableCell>
                        <TableCell>
                          {isImpersonated ? (
                            <Badge variant="outline" className="bg-yellow-500/10">
                              Impersonação
                            </Badge>
                          ) : isExpired ? (
                            <Badge variant="destructive">Expirada</Badge>
                          ) : (
                            <Badge variant="secondary">Ativa</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(session.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(session.expiresAt).toLocaleString("pt-BR")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeClick(session)}
                            disabled={isExpired}
                          >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Revogar
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RevokeSessionDialog
        session={sessionToRevoke}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
