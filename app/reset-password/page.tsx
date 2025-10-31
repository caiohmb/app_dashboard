import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Redefinir senha</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite sua nova senha abaixo
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
