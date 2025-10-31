import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ProfileForm } from "@/components/profile-form"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function ProfilePage() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  if (!session) {
    redirect("/login")
  }

  // Busca dados completos do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 lg:px-6">
              <div>
                <h1 className="text-2xl font-semibold">Perfil do Usuário</h1>
                <p className="text-muted-foreground">
                  Gerencie suas informações pessoais
                </p>
              </div>

              <Separator />

              <div className="grid gap-6 max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Atualize seus dados pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm user={user} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>
                    Histórico das suas últimas atividades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade registrada ainda
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {user.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 rounded-lg border p-4"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
