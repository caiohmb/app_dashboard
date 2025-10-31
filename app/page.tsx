import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconChartBar, IconShieldCheck, IconSparkles } from "@tabler/icons-react"
import { HomeNav } from "@/components/home-nav"

export default async function Home() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList
  })

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <IconChartBar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Acme Inc.</span>
          </div>
          <HomeNav session={session} />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
              <IconSparkles className="h-4 w-4" />
              <span>Dashboard Inteligente para seu Negócio</span>
            </div>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Gerencie suas métricas
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                com eficiência
              </span>
            </h1>

            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Visualize receitas, clientes, contas ativas e taxa de crescimento em tempo real.
              Tome decisões baseadas em dados com nosso dashboard completo.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Criar Conta Grátis
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Fazer Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-12 text-center text-3xl font-bold">
                Tudo que você precisa em um só lugar
              </h2>

              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <IconChartBar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Métricas em Tempo Real</h3>
                  <p className="text-muted-foreground">
                    Acompanhe receita, clientes e contas ativas com atualizações instantâneas.
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <IconShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Seguro e Confiável</h3>
                  <p className="text-muted-foreground">
                    Autenticação robusta com Better Auth e proteção de dados de ponta.
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <IconSparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Personalização Total</h3>
                  <p className="text-muted-foreground">
                    Configure suas métricas e visualize exatamente o que importa para você.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold">
                Pronto para começar?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Crie sua conta gratuita em menos de 1 minuto
              </p>
              <Link href="/signup">
                <Button size="lg">
                  Começar Agora
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 Acme Inc. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-foreground">
                Termos
              </Link>
              <Link href="#" className="hover:text-foreground">
                Contato
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
