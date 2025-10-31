import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protege rotas /dashboard/admin/*
  if (pathname.startsWith("/dashboard/admin")) {
    try {
      // Verifica sessão do usuário
      const session = await auth.api.getSession({
        headers: request.headers,
      })

      // Se não estiver logado, redireciona para login
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Verifica se tem role de admin
      const userRoles = session.user.role?.split(",") || []
      const isAdmin = userRoles.some(
        (role) => role === "admin" || role === "superadmin"
      )

      // Se não for admin, redireciona para página de acesso negado
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url))
      }

      // Permite acesso
      return NextResponse.next()
    } catch (error) {
      console.error("Erro no middleware admin:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
}
