"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconSearch,
  IconUserPlus,
  IconEdit,
  IconTrash,
  IconBan,
  IconCheck,
  IconX,
  IconLoader2,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RoleBadge } from "@/components/admin/role-badge"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateUserModal } from "@/components/admin/create-user-modal"
import { EditUserModal } from "@/components/admin/edit-user-modal"
import { BanUserModal } from "@/components/admin/ban-user-modal"
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog"
import { unbanUserAction } from "@/app/actions/admin"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: Date | null
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
  currentPage: number
  totalPages: number
  totalUsers: number
  searchQuery: string
  roleFilter: string
}

export function UsersTable({
  users,
  currentPage,
  totalPages,
  totalUsers,
  searchQuery,
  roleFilter,
}: UsersTableProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState(searchQuery)
  const [role, setRole] = React.useState(roleFilter)

  // Modals state
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [banModalOpen, setBanModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [unbanning, setUnbanning] = React.useState<string | null>(null)

  const handleSearch = React.useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role && role !== "all") params.set("role", role)
    params.set("page", "1")
    router.push(`/dashboard/admin/users?${params.toString()}`)
  }, [search, role, router])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (role && role !== "all") params.set("role", role)
    params.set("page", newPage.toString())
    router.push(`/dashboard/admin/users?${params.toString()}`)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleUnban = async (userId: string) => {
    setUnbanning(userId)
    try {
      const result = await unbanUserAction(userId)
      if (result.success) {
        toast.success("Usuário desbanido com sucesso!")
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao desbanir usuário")
      }
    } catch (error) {
      toast.error("Erro ao desbanir usuário")
    } finally {
      setUnbanning(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              {totalUsers} usuário{totalUsers !== 1 ? "s" : ""} cadastrado{totalUsers !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <IconUserPlus className="mr-2 h-4 w-4" />
            Criar Usuário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Select value={role || "all"} onValueChange={setRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <IconSearch className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={user.role || "user"} />
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banido</Badge>
                      ) : user.emailVerified ? (
                        <Badge variant="secondary">
                          <IconCheck className="mr-1 h-3 w-3" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <IconX className="mr-1 h-3 w-3" />
                          Não Verificado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Ações
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setEditModalOpen(true)
                            }}
                          >
                            <IconEdit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (user.banned) {
                                handleUnban(user.id)
                              } else {
                                setSelectedUser(user)
                                setBanModalOpen(true)
                              }
                            }}
                            disabled={unbanning === user.id}
                          >
                            {unbanning === user.id ? (
                              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <IconBan className="mr-2 h-4 w-4" />
                            )}
                            {user.banned ? "Desbanir" : "Banir"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(user)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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

      {/* Modals */}
      <CreateUserModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <EditUserModal user={selectedUser} open={editModalOpen} onOpenChange={setEditModalOpen} />
      <BanUserModal user={selectedUser} open={banModalOpen} onOpenChange={setBanModalOpen} />
      <DeleteUserDialog user={selectedUser} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </Card>
  )
}
