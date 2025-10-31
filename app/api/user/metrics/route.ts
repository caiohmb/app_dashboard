import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList
    })

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Busca ou cria as métricas do usuário
    let metrics = await prisma.userMetrics.findUnique({
      where: { userId: session.user.id }
    })

    // Se não existir, cria métricas padrão para o usuário
    if (!metrics) {
      metrics = await prisma.userMetrics.create({
        data: {
          userId: session.user.id,
          totalRevenue: 0,
          revenueChange: 0,
          totalCustomers: 0,
          customersChange: 0,
          activeAccounts: 0,
          accountsChange: 0,
          growthRate: 0,
          growthChange: 0,
        }
      })
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error fetching user metrics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList
    })

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Atualiza ou cria as métricas do usuário
    const metrics = await prisma.userMetrics.upsert({
      where: { userId: session.user.id },
      update: {
        totalRevenue: body.totalRevenue ?? undefined,
        revenueChange: body.revenueChange ?? undefined,
        totalCustomers: body.totalCustomers ?? undefined,
        customersChange: body.customersChange ?? undefined,
        activeAccounts: body.activeAccounts ?? undefined,
        accountsChange: body.accountsChange ?? undefined,
        growthRate: body.growthRate ?? undefined,
        growthChange: body.growthChange ?? undefined,
      },
      create: {
        userId: session.user.id,
        totalRevenue: body.totalRevenue ?? 0,
        revenueChange: body.revenueChange ?? 0,
        totalCustomers: body.totalCustomers ?? 0,
        customersChange: body.customersChange ?? 0,
        activeAccounts: body.activeAccounts ?? 0,
        accountsChange: body.accountsChange ?? 0,
        growthRate: body.growthRate ?? 0,
        growthChange: body.growthChange ?? 0,
      }
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Error updating user metrics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
