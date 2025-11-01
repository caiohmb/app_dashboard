"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBuilding,
  IconEdit,
  IconTrash,
  IconUsers,
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
import { Badge } from "@/components/ui/badge"
import { CreateOrganizationModal } from "@/components/admin/create-organization-modal"
import { EditOrganizationModal } from "@/components/admin/edit-organization-modal"
import { DeleteOrganizationDialog } from "@/components/admin/delete-organization-dialog"

interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  createdAt: Date
  _count: {
    users: number
  }
}

interface OrganizationsTableProps {
  organizations: Organization[]
}

export function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedOrg, setSelectedOrg] = React.useState<Organization | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organizações do Sistema</CardTitle>
              <CardDescription>
                {organizations.length} organização{organizations.length !== 1 ? "ões" : ""} cadastrada{organizations.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <IconBuilding className="mr-2 h-4 w-4" />
              Criar Organização
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhuma organização encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {org.logo ? (
                            <img
                              src={org.logo}
                              alt={org.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                              <IconBuilding className="h-4 w-4" />
                            </div>
                          )}
                          <span className="font-medium">{org.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{org.slug}</code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {org.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/admin/users?organizationId=${org.id}`}>
                          <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
                            <IconUsers className="h-3 w-3" />
                            {org._count.users}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrg(org)
                              setEditModalOpen(true)
                            }}
                          >
                            <IconEdit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrg(org)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Deletar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateOrganizationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      <EditOrganizationModal
        organization={selectedOrg}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
      <DeleteOrganizationDialog
        organization={selectedOrg}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}
